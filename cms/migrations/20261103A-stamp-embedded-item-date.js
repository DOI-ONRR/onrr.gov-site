/**
 * Backfill: stamp each embedded snapshot item with its parent row's month/year `date`
 * (YYYY-MM-01), so an embedded-source data_table can render a `date` column with the
 * Month/Year format (the item array only carried measure fields, no per-item date).
 *
 * Covers the three "dated snapshot + JSON array of line items" collections:
 *   - index_zones               -> index_zones        (items: abbreviation/index_zone/price)
 *   - indian_gas_major_portion  -> index_zones        (items: designatedArea/price/dueDate)
 *   - ibmp                      -> ibmp_line_items     (items: designatedArea/condensate…)
 *
 * The xlsx parsers (cms/src/utils/file-utils.js) stamp item.date on new uploads; this
 * migration brings existing rows in line. Written with raw knex on purpose: it bypasses
 * the Directus item hooks (there is no re-parse on update) and revisions, which is what
 * we want for a pure data backfill.
 *
 * Idempotent: re-running overwrites item.date with the same value. Reversible: `down`
 * removes the `date` key from every item. See chore/4463.
 *
 * Note: Directus's Redis cache may serve stale embedded data until CACHE_TTL expires or
 * the cache is purged (POST /utils/cache/clear) after this runs.
 */

const TARGETS = [
  { collection: 'index_zones', field: 'index_zones' },
  { collection: 'indian_gas_major_portion', field: 'index_zones' },
  { collection: 'ibmp', field: 'ibmp_line_items' },
];

// Parent date -> YYYY-MM-01, from the date's own components (no timezone shift, which at a
// day-01 boundary could otherwise roll into the previous month).
function monthStart(d) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(`${String(d).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-01`;
}

// The JSON column comes back parsed (pg json) or, defensively, as a JSON string.
function asItems(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

module.exports = {
  async up(knex) {
    for (const { collection, field } of TARGETS) {
      const rows = await knex(collection).select('id', 'date', field);
      for (const row of rows) {
        const items = asItems(row[field]);
        const itemDate = monthStart(row.date);
        if (!items || !itemDate) continue;
        const next = items.map((it) =>
          it && typeof it === 'object' && !Array.isArray(it) ? { ...it, date: itemDate } : it,
        );
        await knex(collection).where({ id: row.id }).update({ [field]: JSON.stringify(next) });
      }
    }
  },

  async down(knex) {
    for (const { collection, field } of TARGETS) {
      const rows = await knex(collection).select('id', field);
      for (const row of rows) {
        const items = asItems(row[field]);
        if (!items) continue;
        const next = items.map((it) => {
          if (it && typeof it === 'object' && !Array.isArray(it)) {
            const { date, ...rest } = it;
            return rest;
          }
          return it;
        });
        await knex(collection).where({ id: row.id }).update({ [field]: JSON.stringify(next) });
      }
    }
  },
};
