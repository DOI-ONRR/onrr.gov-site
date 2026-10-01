/**
 * Authenticate the Publish flows' calls to the onrr-flows endpoints.
 *
 * POST /onrr-flows/pages/:id and /onrr-flows/files/:fileUuid now require a caller
 * in one of ONRR_FLOWS_ALLOWED_ROLES (fix/4324). The flows that call them used a
 * Request operation with no credentials, so this adds
 *   Authorization: Bearer {{$env.FLOWS_LOCAL_TOKEN}}
 * to every Request operation that calls onrr-flows: either its URL names the
 * endpoint directly (the _file flow) or it uses a URL built by an earlier step in
 * the same flow (the pages Publish flow's {{build_flow_url.flowUrl}}).
 * FLOWS_LOCAL_TOKEN is exposed to flows by cms/config.js.
 *
 * Run it right after deploying the CMS change: before that, FLOWS_LOCAL_TOKEN
 * doesn't exist and the header would break the current flows.
 *
 * Safety check (warning only, never fails the migration): if the account behind
 * DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN isn't in an allowed role, publishing
 * would be rejected, so that is logged loudly.
 *
 * Idempotent: operations that already have the header are left alone. On an
 * instance with no matching flows (e.g. prod) it changes nothing.
 */

const HEADER_NAME = 'Authorization';
const HEADER_VALUE = 'Bearer {{$env.FLOWS_LOCAL_TOKEN}}';

const parse = options => (typeof options === 'string' ? JSON.parse(options) : options) ?? {};
const isAuthHeader = h => String(h?.header ?? '').toLowerCase() === HEADER_NAME.toLowerCase();

// Request operations that call onrr-flows, with their parsed options.
async function onrrFlowsRequestOps(knex) {
  const ops = (await knex('directus_operations').select('id', 'key', 'type', 'flow', 'options'))
    .map(op => ({ ...op, options: parse(op.options) }));
  const buildsFlowsUrl = op => JSON.stringify(op.options).includes('/onrr-flows/');

  return ops.filter(op => {
    if (op.type !== 'request') return false;
    const url = String(op.options.url ?? '');
    if (url.includes('/onrr-flows/')) return true;
    const refs = [...url.matchAll(/\{\{\s*([A-Za-z0-9_-]+)\./g)].map(m => m[1]);
    return ops.some(other => other.flow === op.flow && refs.includes(other.key) && buildsFlowsUrl(other));
  });
}

async function warnIfFlowsAccountNotAllowed(knex) {
  const token = process.env.DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN;
  const allowed = String(process.env.ONRR_FLOWS_ALLOWED_ROLES ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (!token) {
    console.warn('[onrr-flows-auth-header] DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN is not set; the Publish flows cannot authenticate.');
    return;
  }

  const user = await knex('directus_users').where({ token }).first('email', 'role');
  if (!user) {
    console.warn('[onrr-flows-auth-header] No user has the DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN token; the Publish flows will be rejected.');
    return;
  }

  const roles = [];
  for (let id = user.role; id; ) {
    const role = await knex('directus_roles').where({ id }).first('name', 'parent');
    if (!role) break;
    roles.push(role.name);
    id = role.parent;
  }

  if (roles.some(name => allowed.some(a => a.toLowerCase() === name.trim().toLowerCase()))) {
    console.log(`[onrr-flows-auth-header] Flows account ${user.email} (role: ${roles.join(' < ')}) is allowed.`);
  } else {
    console.warn(
      `[onrr-flows-auth-header] WARNING: flows account ${user.email} (role: ${roles.join(' < ') || 'none'}) is not in ` +
      `ONRR_FLOWS_ALLOWED_ROLES (${allowed.join(', ') || 'unset'}). The Publish flows will be rejected until it is.`
    );
  }
}

module.exports = {
  async up(knex) {
    const ops = await onrrFlowsRequestOps(knex);
    let updated = 0;

    for (const op of ops) {
      const headers = Array.isArray(op.options.headers) ? op.options.headers : [];
      if (headers.some(h => isAuthHeader(h) && h.value === HEADER_VALUE)) continue;

      const options = { ...op.options, headers: [...headers.filter(h => !isAuthHeader(h)), { header: HEADER_NAME, value: HEADER_VALUE }] };
      await knex('directus_operations').where({ id: op.id }).update({ options: JSON.stringify(options) });
      updated++;
    }

    console.log(`[onrr-flows-auth-header] ${ops.length} operation(s) call onrr-flows; ${updated} updated.`);
    if (ops.length > 0) await warnIfFlowsAccountNotAllowed(knex);
  },

  async down(knex) {
    // Remove only the header this migration adds.
    for (const op of await onrrFlowsRequestOps(knex)) {
      const headers = Array.isArray(op.options.headers) ? op.options.headers : [];
      const kept = headers.filter(h => !(isAuthHeader(h) && h.value === HEADER_VALUE));
      if (kept.length === headers.length) continue;

      const { headers: _removed, ...rest } = op.options;
      const options = kept.length > 0 ? { ...rest, headers: kept } : rest;
      await knex('directus_operations').where({ id: op.id }).update({ options: JSON.stringify(options) });
    }
  },
};
