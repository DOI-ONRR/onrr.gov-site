/**
 * Add commodity rows that exist in nrrd but are missing from the Directus `commodity`
 * table. The Directus table is a point-in-time copy of nrrd's commodity reference data
 * (migrated 2026-01-22); nrrd added these 53 rows afterward. Nothing had drifted — the
 * shared rows match nrrd exactly by legacy_id — so this is purely additive.
 *
 * The gap surfaced when the calendar-year production load left 426 rows unmatched: the
 * canonical geothermal products (e.g. "Geothermal - direct use (hundreds of gallons)",
 * "Geothermal - electrical generation (kilowatt hours)") that the CY/FY loaders resolve
 * against only existed in nrrd. See chore/4311.
 *
 * Idempotent: each row is inserted only if its legacy_id is not already present, so this is
 * safe to run on an environment that already has some/all of them. Reversible: `down`
 * removes the rows it added, skipping any that a fact table now references.
 */

const USER = '37a5978c-9f80-4c93-b6d9-53408a797368';

const COMMODITIES = [
  {
    "mineral_lease_type": "",
    "name": "Anhydrous sodium sulfate",
    "product": "Anhydrous sodium sulfate",
    "sort": "Anhyd",
    "legacy_id": 16619
  },
  {
    "mineral_lease_type": "",
    "name": "Borax-anhydrous",
    "product": "Borax-anhydrous",
    "sort": "Borax",
    "legacy_id": 16620
  },
  {
    "mineral_lease_type": "",
    "name": "Borax-decahydrate",
    "product": "Borax-decahydrate",
    "sort": "Borax",
    "legacy_id": 16621
  },
  {
    "mineral_lease_type": "",
    "name": "Borax-pentahydrate",
    "product": "Borax-pentahydrate",
    "sort": "Borax",
    "legacy_id": 16622
  },
  {
    "mineral_lease_type": "",
    "name": "Boric acid",
    "product": "Boric acid",
    "sort": "Boric",
    "legacy_id": 16623
  },
  {
    "mineral_lease_type": "",
    "name": "Borrow sand & gravel",
    "product": "Borrow sand & gravel",
    "sort": "Borro",
    "legacy_id": 19381
  },
  {
    "mineral_lease_type": "",
    "name": "Brine barrels",
    "product": "Brine barrels",
    "sort": "Brine",
    "legacy_id": 16929
  },
  {
    "mineral_lease_type": "",
    "name": "Calcium chloride",
    "product": "Calcium chloride",
    "sort": "Calci",
    "legacy_id": 26230
  },
  {
    "mineral_lease_type": "",
    "name": "Cinders",
    "product": "Cinders",
    "sort": "Cinde",
    "legacy_id": 17240
  },
  {
    "mineral_lease_type": "",
    "name": "Coal-bituminous-raw",
    "product": "Coal-bituminous-raw",
    "sort": "5",
    "legacy_id": 17242
  },
  {
    "mineral_lease_type": "",
    "name": "Coal-fines circuit",
    "product": "Coal-fines circuit",
    "sort": "5",
    "legacy_id": 29651
  },
  {
    "mineral_lease_type": "",
    "name": "Coal waste",
    "product": "Coal waste (sub-econ)",
    "sort": "5",
    "legacy_id": 22380
  },
  {
    "mineral_lease_type": "",
    "name": "Copper concentrate",
    "product": "Copper concentrate",
    "sort": "Coppe",
    "legacy_id": 16802
  },
  {
    "mineral_lease_type": "Geothermal",
    "name": "Geothermal",
    "product": "Geothermal - Direct Use, Millions of Pounds",
    "sort": "Geoth",
    "legacy_id": 32756
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - direct use",
    "product": "Geothermal - direct use (hundreds of gallons)",
    "sort": "Geoth",
    "legacy_id": 16928
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - direct use",
    "product": "Geothermal - direct use (millions of btus)",
    "sort": "Geoth",
    "legacy_id": 16609
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - direct use",
    "product": "Geothermal - direct use (millions of gallons)",
    "sort": "Geoth",
    "legacy_id": 22778
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - electrical generation",
    "product": "Geothermal - electrical generation (kilowatt hours)",
    "sort": "Geoth",
    "legacy_id": 16601
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - electrical generation",
    "product": "Geothermal - electrical generation (other)",
    "sort": "Geoth",
    "legacy_id": 16602
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - electrical generation",
    "product": "Geothermal - electrical generation (thousands of pounds)",
    "sort": "Geoth",
    "legacy_id": 16608
  },
  {
    "mineral_lease_type": "",
    "name": "Geothermal - sulfur",
    "product": "Geothermal - sulfur (tons)",
    "sort": "Geoth",
    "legacy_id": 21696
  },
  {
    "mineral_lease_type": "",
    "name": "Gold ore",
    "product": "Gold ore",
    "sort": "Gold ",
    "legacy_id": 21402
  },
  {
    "mineral_lease_type": "",
    "name": "Gold placer",
    "product": "Gold placer",
    "sort": "Gold ",
    "legacy_id": 21403
  },
  {
    "mineral_lease_type": "",
    "name": "Gypsum",
    "product": "Gypsum",
    "sort": "Gypsu",
    "legacy_id": 17246
  },
  {
    "mineral_lease_type": "",
    "name": "Humate",
    "product": "Humate",
    "sort": "Humat",
    "legacy_id": 26906
  },
  {
    "mineral_lease_type": "",
    "name": "Langbeinite",
    "product": "Langbeinite",
    "sort": "Langb",
    "legacy_id": 16931
  },
  {
    "mineral_lease_type": "",
    "name": "Lead concentrate",
    "product": "Lead concentrate",
    "sort": "Lead ",
    "legacy_id": 16803
  },
  {
    "mineral_lease_type": "",
    "name": "Leonardite",
    "product": "Leonardite",
    "sort": "Leona",
    "legacy_id": 19025
  },
  {
    "mineral_lease_type": "",
    "name": "Magnesium chloride brine",
    "product": "Magnesium chloride brine",
    "sort": "Magne",
    "legacy_id": 17126
  },
  {
    "mineral_lease_type": "",
    "name": "Manure salts",
    "product": "Manure salts",
    "sort": "Manur",
    "legacy_id": 17127
  },
  {
    "mineral_lease_type": "",
    "name": "Mine water",
    "product": "Mine water",
    "sort": "Mine ",
    "legacy_id": 29694
  },
  {
    "mineral_lease_type": "",
    "name": "Molybdenum concentrate",
    "product": "Molybdenum concentrate",
    "sort": "Molyb",
    "legacy_id": 20131
  },
  {
    "mineral_lease_type": "",
    "name": "Muriate of potash-granular",
    "product": "Muriate of potash-granular",
    "sort": "Muria",
    "legacy_id": 16932
  },
  {
    "mineral_lease_type": "",
    "name": "Muriate of potash-standard",
    "product": "Muriate of potash-standard",
    "sort": "Muria",
    "legacy_id": 16933
  },
  {
    "mineral_lease_type": "",
    "name": "Phosphate raw ore",
    "product": "Phosphate raw ore",
    "sort": "Phosp",
    "legacy_id": 16698
  },
  {
    "mineral_lease_type": "",
    "name": "Potash",
    "product": "Potash",
    "sort": "Potas",
    "legacy_id": 16935
  },
  {
    "mineral_lease_type": "",
    "name": "Potassium sulphate-standard",
    "product": "Potassium sulphate-standard",
    "sort": "Potas",
    "legacy_id": 16936
  },
  {
    "mineral_lease_type": "",
    "name": "Purge liquor",
    "product": "Purge liquor",
    "sort": "Purge",
    "legacy_id": 17182
  },
  {
    "mineral_lease_type": "",
    "name": "Quartz crystal",
    "product": "Quartz crystal",
    "sort": "Quart",
    "legacy_id": 16592
  },
  {
    "mineral_lease_type": "",
    "name": "Salt",
    "product": "Salt",
    "sort": "Salt",
    "legacy_id": 16565
  },
  {
    "mineral_lease_type": "",
    "name": "Sand/gravel",
    "product": "Sand/gravel",
    "sort": "Sand/",
    "legacy_id": 16958
  },
  {
    "mineral_lease_type": "",
    "name": "Sand/gravel-cubic yards",
    "product": "Sand/gravel-cubic yards",
    "sort": "Sand/",
    "legacy_id": 17249
  },
  {
    "mineral_lease_type": "",
    "name": "Silver",
    "product": "Silver",
    "sort": "Silve",
    "legacy_id": 24047
  },
  {
    "mineral_lease_type": "",
    "name": "Soda ash",
    "product": "Soda ash",
    "sort": "Soda ",
    "legacy_id": 16625
  },
  {
    "mineral_lease_type": "",
    "name": "Sodium bi-carbonate",
    "product": "Sodium bi-carbonate",
    "sort": "Sodiu",
    "legacy_id": 16687
  },
  {
    "mineral_lease_type": "",
    "name": "Sodium bisulfite",
    "product": "Sodium bisulfite",
    "sort": "Sodiu",
    "legacy_id": 18593
  },
  {
    "mineral_lease_type": "",
    "name": "Sodium decahydrate",
    "product": "Sodium decahydrate",
    "sort": "Sodiu",
    "legacy_id": 18594
  },
  {
    "mineral_lease_type": "",
    "name": "Sodium sesquicarbonate",
    "product": "Sodium sesquicarbonate",
    "sort": "Sodiu",
    "legacy_id": 17185
  },
  {
    "mineral_lease_type": "",
    "name": "Sulfide",
    "product": "Sulfide",
    "sort": "Sulfi",
    "legacy_id": 18596
  },
  {
    "mineral_lease_type": "",
    "name": "Sylvite-raw ore",
    "product": "Sylvite-raw ore",
    "sort": "Sylvi",
    "legacy_id": 19045
  },
  {
    "mineral_lease_type": "",
    "name": "Trona ore",
    "product": "Trona ore",
    "sort": "Trona",
    "legacy_id": 17186
  },
  {
    "mineral_lease_type": "",
    "name": "Wavellite",
    "product": "Wavellite",
    "sort": "Wavel",
    "legacy_id": 19427
  },
  {
    "mineral_lease_type": "",
    "name": "Zinc concentrate",
    "product": "Zinc concentrate",
    "sort": "Zinc ",
    "legacy_id": 16804
  }
];

module.exports = {
  async up(knex) {
    let added = 0;
    let skipped = 0;
    for (const c of COMMODITIES) {
      const existing = await knex('commodity').where({ legacy_id: c.legacy_id }).first('id');
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
        legacy_id: c.legacy_id,
      });
      added++;
    }
    console.log(`[add-missing-commodities] added ${added}, skipped ${skipped} already present by legacy_id.`);
  },

  async down(knex) {
    const legacyIds = COMMODITIES.map((c) => c.legacy_id);
    const rows = await knex('commodity').whereIn('legacy_id', legacyIds).select('id');
    let removed = 0;
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
    console.log(`[add-missing-commodities] removed ${removed} unreferenced commodity row(s).`);
  },
};
