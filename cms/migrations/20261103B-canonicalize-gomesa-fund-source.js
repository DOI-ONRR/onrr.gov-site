/**
 * Canonicalize the GOMESA / OCS-Gulf representation in the `fund` dimension to mirror nrrd.
 *
 * The raw disbursement feed uses two spellings for the same category, and the ONRR hook
 * historically stored them a third way:
 *   - nrrd (source of truth):  disbursement_type = 'OCS Gulf',       source = 'OCS Gulf'
 *   - onrr hook (old):         disbursement_type = 'GoMESA',          source = 'GOMESA offshore'
 * Grouping/filtering the disbursement pivot by `fund.source` therefore split one category into
 * two buckets, and ONRR's values ('GoMESA' / 'GOMESA offshore') did not match anything nrrd
 * presents publicly. nrrd's live trigger collapses the family to 'OCS Gulf' (disbursement_type)
 * and its public query tool shows source 'OCS Gulf'; its download view prints
 * fund.disbursement_type raw as 'OCS Gulf'. This migration adopts nrrd's scheme everywhere:
 *   source            'GOMESA offshore' -> 'OCS Gulf'
 *   disbursement_type 'GoMESA'          -> 'OCS Gulf'
 * (fund_type already carries the ' - OCS Gulf' suffix in both, so it's left alone.)
 *
 * `fund` is a deduplicated dimension (unique on type/class/recipient/revenue_type/source/
 * disbursement_type). Canonicalizing an old onrr row makes it identical to the legacy 'OCS Gulf'
 * row (imported from nrrd) for the same identity, so we MERGE rather than update-in-place:
 * repoint the fact rows (disbursement, revenue) from the old fund id to the canonical one, then
 * delete the now-duplicate old row. When no canonical twin exists yet, we update the row in place.
 *
 * NOT reversible: the merge deletes dimension rows and repoints facts, and a rollback can't
 * tell a migrated row from one that was natively 'OCS Gulf'. `down` throws so a rollback fails
 * loudly instead of corrupting data. See chore/4XXX (GOMESA mirror).
 *
 * Redis cache may serve stale rows until CACHE_TTL or a POST /utils/cache/clear.
 */

const FACT_TABLES = ['disbursement', 'revenue']; // tables with a `fund` FK column

const IDENTITY = ['type', 'class', 'recipient', 'revenue_type'];
const q = (col) => `"${col}"`;

// Canonical mapping for an old onrr row's source / disbursement_type (mirror nrrd).
const canonSource = (s) => (s === 'GOMESA offshore' ? 'OCS Gulf' : s);
const canonDt = (dt) => (dt === 'GoMESA' ? 'OCS Gulf' : dt);

module.exports = {
  async up(knex) {
    // Every fund row in the GOMESA family that still uses the old onrr spelling.
    const legacyRows = await knex('fund')
      .where('source', 'GOMESA offshore')
      .orWhere('disbursement_type', 'GoMESA')
      .select('id', 'type', 'class', 'recipient', 'revenue_type', 'source', 'disbursement_type');

    let merged = 0;
    let updated = 0;

    for (const row of legacyRows) {
      const newSource = canonSource(row.source);
      const newDt = canonDt(row.disbursement_type);
      if (newSource === row.source && newDt === row.disbursement_type) continue; // already canonical

      // Look for an existing canonical twin (same identity + canonical source/disbursement_type),
      // matching with COALESCE so NULL and '' compare equal to the loader's '' convention.
      let twinQuery = knex('fund').whereNot('id', row.id);
      for (const col of IDENTITY) {
        twinQuery = twinQuery.whereRaw(`COALESCE(${q(col)}, '') = ?`, [row[col] ?? '']);
      }
      twinQuery = twinQuery
        .whereRaw(`COALESCE(${q('source')}, '') = ?`, [newSource ?? ''])
        .whereRaw(`COALESCE(${q('disbursement_type')}, '') = ?`, [newDt ?? '']);
      const twin = await twinQuery.first('id');

      if (twin) {
        // Merge: repoint every fact row off the old fund id, then delete it.
        for (const tbl of FACT_TABLES) {
          const exists = await knex.schema.hasColumn(tbl, 'fund');
          if (exists) await knex(tbl).where('fund', row.id).update({ fund: twin.id });
        }
        await knex('fund').where('id', row.id).del();
        merged++;
      } else {
        await knex('fund')
          .where('id', row.id)
          .update({ source: newSource, disbursement_type: newDt });
        updated++;
      }
    }

    // eslint-disable-next-line no-console
    console.log(`[20261103B] GOMESA canonicalize: ${updated} updated in place, ${merged} merged.`);
  },

  async down() {
    throw new Error(
      '20261103B-canonicalize-gomesa-fund-source is not reversible: it merges and deletes ' +
        'fund dimension rows and repoints fact rows. Restore from a backup to roll back.'
    );
  },
};
