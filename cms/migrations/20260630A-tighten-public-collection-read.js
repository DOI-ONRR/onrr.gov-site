/**
 * Tighten public (unauthenticated) read access on collection-block data sources.
 *
 * These collections shipped with a wide-open Public read filter (`{}`), so draft
 * and archived rows were returned to anonymous visitors and hidden only by the
 * frontend's client-side `item_status` filter (CollectionBlock.vue). This closes
 * that exposure by scoping Public read to published rows.
 *
 * Special case: `press_releases` is rendered by a live collection block configured
 * with `item_status = 'archived'`, so its public read must keep `archived` visible
 * — we only remove `draft`. Every other collection is rendered as `published` only.
 *
 * Keyed by policy NAME (`$t:public_label`) rather than id so it is portable across
 * environments (dev / preview / v12 / prod), where permission ids differ.
 *
 * Not included here: the Preview-policy read grants that enable draft preview —
 * those are a separate change set (preview enablement, not the leak fix).
 */

const PUBLIC_POLICY = '$t:public_label';

// Rendered as published-only → Public read limited to status = published.
const PUBLISHED_ONLY = [
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

// A live block reads archived press releases → keep archived, drop only draft.
const PUBLISHED_OR_ARCHIVED = ['press_releases'];

const ALL = [...PUBLISHED_ONLY, ...PUBLISHED_OR_ARCHIVED];

async function publicPolicyId(knex) {
  const row = await knex('directus_policies').where({ name: PUBLIC_POLICY }).first('id');
  if (!row) throw new Error(`Public policy (${PUBLIC_POLICY}) not found — verify the policy name for this environment.`);
  return row.id;
}

module.exports = {
  async up(knex) {
    const policy = await publicPolicyId(knex);

    await knex('directus_permissions')
      .where({ action: 'read', policy })
      .whereIn('collection', PUBLISHED_ONLY)
      .update({ permissions: JSON.stringify({ _and: [{ status: { _eq: 'published' } }] }) });

    await knex('directus_permissions')
      .where({ action: 'read', policy })
      .whereIn('collection', PUBLISHED_OR_ARCHIVED)
      .update({ permissions: JSON.stringify({ _and: [{ status: { _in: ['published', 'archived'] } }] }) });
  },

  async down(knex) {
    const policy = await publicPolicyId(knex);

    // Restore the original wide-open read filter.
    await knex('directus_permissions')
      .where({ action: 'read', policy })
      .whereIn('collection', ALL)
      .update({ permissions: JSON.stringify({}) });
  },
};
