#!/usr/bin/env node
// Adds `Authorization: Bearer {{$env.FLOWS_LOCAL_TOKEN}}` to every flow Request
// operation that calls this CMS's onrr-flows endpoints (the Publish flows), so
// they keep working once those endpoints require an allowed role
// (ONRR_FLOWS_ALLOWED_ROLES). Flows are stored in each environment's
// database, so run this once per environment (dev, preview, upgrade).
//
// Dry run by default; pass --apply to save. Safe to re-run.
//
// Usage (bash; keeps tokens out of shell history):
//   read -s -p "Admin token: " ADMIN_TOKEN; echo
//   read -s -p "Flows token (DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN, optional): " FLOWS_TOKEN; echo
//   API_URL=https://dev-onrr-cms.app.cloud.gov ADMIN_TOKEN=$ADMIN_TOKEN FLOWS_TOKEN=$FLOWS_TOKEN \
//     node cms/scripts/add-onrr-flows-auth-header.mjs [--apply]
//
// ADMIN_TOKEN: an admin's token for the target CMS (used to read and update flows).
// FLOWS_TOKEN: optional. If given, the script checks that the account it
//   belongs to is in one of ALLOWED_ROLES (default "Admin,Events,Service Account"; parent roles
//   count); if it isn't, publishing would be rejected after deploy, so the
//   script stops.

const API_URL = (process.env.API_URL || '').replace(/\/+$/, '');
const { ADMIN_TOKEN, FLOWS_TOKEN } = process.env;
const ALLOWED_ROLES = (process.env.ALLOWED_ROLES ?? 'Admin,Events,Service Account').split(',').map(s => s.trim()).filter(Boolean);
const APPLY = process.argv.includes('--apply');

const HEADER_NAME = 'Authorization';
const HEADER_VALUE = 'Bearer {{$env.FLOWS_LOCAL_TOKEN}}';

if (!API_URL || !ADMIN_TOKEN) {
  console.error('Set API_URL and ADMIN_TOKEN (see the usage notes at the top of this file).');
  process.exit(2);
}

async function api(path, { token = ADMIN_TOKEN, method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${json.errors?.[0]?.message ?? res.statusText}`);
  return json.data;
}

// 1. Optional: confirm the flows token's account is in an allowed role (its
// own role or any parent role, as the endpoint checks).
if (FLOWS_TOKEN) {
  const me = await api('/users/me?fields=email,role.id,role.name,role.parent', { token: FLOWS_TOKEN });
  const roles = [];
  for (let role = me.role; role; ) {
    roles.push(role.name);
    role = role.parent ? await api(`/roles/${role.parent}?fields=id,name,parent`) : null;
  }
  const ok = roles.some(r => ALLOWED_ROLES.some(a => a.toLowerCase() === r.toLowerCase()));
  console.log(`Flows token account: ${me.email} (role: ${roles.join(' < ') || 'none'})`);
  console.log(`Allowed roles:       ${ALLOWED_ROLES.join(', ')}  ->  ${ok ? 'OK' : 'NOT ALLOWED'}`);
  if (!ok) {
    console.error('\nThe Publish flows would be rejected after deploy. Put this account in one of the allowed\n' +
      'roles, or add its role to ONRR_FLOWS_ALLOWED_ROLES, then re-run.');
    process.exit(1);
  }
  console.log();
} else {
  console.log('FLOWS_TOKEN not set: skipping the check that its account is in an allowed role.\n');
}

// 2. Find the Request operations that call onrr-flows: either the URL names it
// directly, or it comes from an earlier step in the same flow that builds an
// onrr-flows URL (the pages Publish flow uses {{build_flow_url.flowUrl}}).
const ops = await api('/operations?fields=id,key,type,options,flow.id,flow.name&limit=-1');
const buildsFlowsUrl = op => JSON.stringify(op.options ?? {}).includes('/onrr-flows/');
const targets = ops.filter(op => {
  if (op.type !== 'request') return false;
  const url = String(op.options?.url ?? '');
  if (url.includes('/onrr-flows/')) return true;
  const refs = [...url.matchAll(/\{\{\s*([A-Za-z0-9_-]+)\./g)].map(m => m[1]);
  return ops.some(other => other.flow?.id === op.flow?.id && refs.includes(other.key) && buildsFlowsUrl(other));
});

if (targets.length === 0) {
  console.log(`No Request operations calling /onrr-flows/ found on ${API_URL}. Nothing to do.`);
  process.exit(0);
}

let changed = 0;
for (const op of targets) {
  const headers = Array.isArray(op.options.headers) ? op.options.headers : [];
  const others = headers.filter(h => String(h?.header ?? '').toLowerCase() !== HEADER_NAME.toLowerCase());
  const current = headers.find(h => String(h?.header ?? '').toLowerCase() === HEADER_NAME.toLowerCase());
  const label = `${op.flow?.name ?? '?'} / ${op.key}  (${op.options.method ?? 'GET'} ${op.options.url})`;

  if (current?.value === HEADER_VALUE && others.length === headers.length - 1) {
    console.log(`  already set   ${label}`);
    continue;
  }

  changed++;
  console.log(`  ${APPLY ? 'updating ' : 'would set'}     ${label}${current ? `  [replacing existing ${HEADER_NAME} header]` : ''}`);
  if (APPLY) {
    await api(`/operations/${op.id}`, {
      method: 'PATCH',
      body: { options: { ...op.options, headers: [...others, { header: HEADER_NAME, value: HEADER_VALUE }] } },
    });
  }
}

console.log(`\n${targets.length} operation(s) call onrr-flows on ${API_URL}; ${changed} ${APPLY ? 'updated' : 'need updating'}.`);
if (!APPLY && changed > 0) console.log('Dry run only. Re-run with --apply to save.');
