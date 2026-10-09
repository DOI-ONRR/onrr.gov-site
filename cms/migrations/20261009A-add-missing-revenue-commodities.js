/**
 * Add the revenue commodities that the 2005-2025 true-up surfaced as missing from the Directus
 * `commodity` table. The revenue load — and nrrd's load_revenue_monthly — resolves a commodity by
 * the exact triple (name, mineral_lease_type, product):
 *
 *     JOIN commodity c ON e.commodity = c.commodity
 *       AND e.mineral_production_code_desc = c.mineral_lease_type
 *       AND product_code_desc = product
 *
 * These four triples had no matching row, so those revenue rows skipped as commodity_not_found:
 *     Coal      / Coal      / Coal-Lignite-Processed
 *     Cobalt    / Hardrock  / Cobalt Concentrate
 *     Limestone / Limestone / Limestone
 *     Sulfur    / Sulfur    / Sulfur
 *
 * The earlier sync (20261008A) only covered production/CY commodities (all mineral_lease_type ''),
 * so these revenue-only rows were never added. See chore/4310.
 *
 * Idempotent on the natural key (name, mineral_lease_type, product) — safe to re-run. legacy_id is
 * left null: the loader matches on the triple, not legacy_id, and nrrd's commodity_id for these
 * wasn't on hand (backfill later from nrrd if cross-referencing is wanted). Reversible: `down`
 * removes only the null-legacy_id rows it added that no fact row references.
 */

const USER = '37a5978c-9f80-4c93-b6d9-53408a797368';

const COMMODITIES = [
  { name: 'Coal', mineral_lease_type: 'Coal', product: 'Coal-Lignite-Processed', sort: '5' },
  { name: 'Cobalt', mineral_lease_type: 'Hardrock', product: 'Cobalt Concentrate', sort: 'Cobal' },
  { name: 'Limestone', mineral_lease_type: 'Limestone', product: 'Limestone', sort: 'Limes' },
  { name: 'Sulfur', mineral_lease_type: 'Sulfur', product: 'Sulfur', sort: 'Sulfu' },
];

module.exports = {
  async up(knex) {
    let added = 0;
    let skipped = 0;
    for (const c of COMMODITIES) {
      const existing = await knex('commodity')
        .where({ name: c.name, mineral_lease_type: c.mineral_lease_type, product: c.product })
        .first('id');
      if (existing) { skipped++; continue; }
      await knex('commodity').insert({
        id: knex.raw('gen_random_uuid()'),
        user_created: USER,
        date_created: knex.fn.now(),
        user_updated: USER,
        date_updated: knex.fn.now(),
        mineral_lease_type: c.mineral_lease_type,
        name: c.name,
        product: c.product,
        sort: c.sort,
        legacy_id: null,
      });
      added++;
    }
    console.log(`[add-missing-revenue-commodities] added ${added}, skipped ${skipped} already present.`);
  },

  async down(knex) {
    let removed = 0;
    for (const c of COMMODITIES) {
      // Only the rows this migration added: match the triple AND legacy_id IS NULL.
      const rows = await knex('commodity')
        .where({ name: c.name, mineral_lease_type: c.mineral_lease_type, product: c.product })
        .whereNull('legacy_id')
        .select('id');
      for (const r of rows) {
        // Never orphan fact rows: skip any commodity a dataset now references.
        const used =
          (await knex('production').where({ commodity: r.id }).first('id')) ||
          (await knex('disbursement').where({ commodity: r.id }).first('id')) ||
          (await knex('revenue').where({ commodity: r.id }).first('id'));
        if (used) continue;
        await knex('commodity').where({ id: r.id }).del();
        removed++;
      }
    }
    console.log(`[add-missing-revenue-commodities] removed ${removed} unreferenced row(s).`);
  },
};
