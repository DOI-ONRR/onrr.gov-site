/**
 * Allow the Public (unauthenticated) policy to read dataset_metadata.dataset_last_updated.
 *
 * DatasetView now queries this field via pageFields.gql. If the Public read permission on
 * dataset_metadata uses an explicit field allowlist that omits the field, the whole public page
 * GraphQL query fails — so ensure it's present. Safe/idempotent in every shape:
 *   - fields '*' (all fields) → no-op
 *   - explicit list (CSV or JSON array) missing the field → append it, preserving the format
 *   - no dataset_metadata read permission row → warn (the field can't be exposed without it)
 *
 * Keyed by policy NAME ($t:public_label) for portability across environments (ids differ).
 */

const PUBLIC_POLICY = '$t:public_label';
const COLLECTION = 'dataset_metadata';
const FIELD = 'dataset_last_updated';

async function publicPolicyId(knex) {
  const row = await knex('directus_policies').where({ name: PUBLIC_POLICY }).first('id');
  if (!row) throw new Error(`Public policy (${PUBLIC_POLICY}) not found — verify the policy name for this environment.`);
  return row.id;
}

// Returns { list, isJson } for an explicit allowlist, or null for '*'/empty.
function parseFields(raw) {
  if (raw == null || raw === '*') return null;
  const t = String(raw).trim();
  if (!t) return null;
  if (t.startsWith('[')) return { list: JSON.parse(t), isJson: true };
  return { list: t.split(',').map((s) => s.trim()).filter(Boolean), isJson: false };
}
const serialize = (list, isJson) => (isJson ? JSON.stringify(list) : list.join(','));

module.exports = {
  async up(knex) {
    const policy = await publicPolicyId(knex);
    const perm = await knex('directus_permissions').where({ policy, collection: COLLECTION, action: 'read' }).first('id', 'fields');
    if (!perm) { console.warn(`[public-read-${FIELD}] no Public read permission on ${COLLECTION} — nothing to update (field won't be public).`); return; }

    const parsed = parseFields(perm.fields);
    if (!parsed) { console.log(`[public-read-${FIELD}] ${COLLECTION} read is '*' — all fields already allowed, no change.`); return; }
    if (parsed.list.includes(FIELD)) { console.log(`[public-read-${FIELD}] already in the ${COLLECTION} allowlist, no change.`); return; }

    parsed.list.push(FIELD);
    await knex('directus_permissions').where({ id: perm.id }).update({ fields: serialize(parsed.list, parsed.isJson) });
    console.log(`[public-read-${FIELD}] added to the ${COLLECTION} Public read allowlist.`);
  },

  async down(knex) {
    const policy = await publicPolicyId(knex);
    const perm = await knex('directus_permissions').where({ policy, collection: COLLECTION, action: 'read' }).first('id', 'fields');
    if (!perm) return;
    const parsed = parseFields(perm.fields);
    if (!parsed || !parsed.list.includes(FIELD)) return;
    const next = parsed.list.filter((f) => f !== FIELD);
    await knex('directus_permissions').where({ id: perm.id }).update({ fields: serialize(next, parsed.isJson) });
  },
};
