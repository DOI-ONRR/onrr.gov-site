/**
 * Grant the Preview policy read access to every collection-block data source.
 *
 * Draft preview works by loading the frontend with a preview token whose user is
 * attached to the Preview policy. For a previewed page to render its collection
 * blocks (and surface drafts), the Preview policy must be able to read each of
 * those collections. This grants unrestricted read (all statuses) on the 17
 * collection types rendered by CollectionBlock.vue.
 *
 * Companion to 20260630A-tighten-public-collection-read (the leak fix). That one
 * scopes PUBLIC read to published; this one lets the PREVIEW policy see drafts.
 * The two policies are independent, so order between the migrations does not matter.
 *
 * Keyed by policy NAME ('Preview') for portability across environments, and
 * idempotent: it only inserts grants that are missing, so it is safe to run on an
 * instance where some grants already exist (e.g. the v12 spike DB).
 */

const PREVIEW_POLICY = 'Preview';

// Every collection type handled by CollectionBlock.vue's query switch.
const COLLECTIONS = [
  'contacts',
  'announcements',
  'press_releases',
  'reporter_letters',
  'rulemakings',
  'NYMEX',
  'index_zones',
  'ibmp',
  'indian_gas_major_portion',
  'Interest_Oil_and_Gas',
  'Interest_Solids',
  'solid_minerals_handbook',
  'production_handbook',
  'revenue_handbook',
  'geothermal_class_1',
  'geothermal_class_2_3',
  'plant_specific_ucas',
];

async function previewPolicyId(knex) {
  const row = await knex('directus_policies').where({ name: PREVIEW_POLICY }).first('id');
  if (!row) throw new Error(`Policy (${PREVIEW_POLICY}) not found — create the Preview policy before running this migration.`);
  return row.id;
}

module.exports = {
  async up(knex) {
    const policy = await previewPolicyId(knex);

    const existing = await knex('directus_permissions')
      .where({ action: 'read', policy })
      .whereIn('collection', COLLECTIONS)
      .pluck('collection');

    const missing = COLLECTIONS.filter((c) => !existing.includes(c));
    if (missing.length === 0) return;

    // permissions: null → no row filter (all statuses); fields: '*' → all fields.
    await knex('directus_permissions').insert(
      missing.map((collection) => ({ collection, action: 'read', policy, permissions: null, fields: '*' })),
    );
  },

  async down(knex) {
    const policy = await previewPolicyId(knex);

    await knex('directus_permissions')
      .where({ action: 'read', policy })
      .whereIn('collection', COLLECTIONS)
      .del();
  },
};
