/**
 * On a SUCCESSFUL revenue_data_update, stamp the matching dataset_metadata row(s):
 *   - coverage_end         = last day of the dataset's latest covered month (its newest Monthly
 *                            period). For the annual-only datasets (federal_sales,
 *                            federal_revenue_by_company — no Monthly period) it's Dec 31 of the
 *                            latest calendar_year. Read from the fact table, so it never regresses
 *                            if an older file is re-run.
 *   - dataset_last_updated = when this update completed.
 *
 * Which rows get stamped: dataset_metadata is matched by `source_collection` (the revenue_data_update
 * `dataset` value with hyphens swapped for underscores) AND `period_type`. A monthly load
 * (period `monthly`/`true-up`, or none) stamps rows set to `monthly` or `both`; a `calendar-year` /
 * `fiscal-year` load stamps rows set to `yearly` or `both`. Shared by the items.create hook and the
 * "Rerun revenue data update" flow operation so both paths stamp identically.
 */

// Fact tables with no Monthly period — coverage is a year (Dec 31 of the latest calendar_year).
const ANNUAL_SOURCES = new Set(['federal_sales', 'federal_revenue_by_company']);

export const sourceCollectionForDataset = (dataset) => String(dataset || '').replace(/-/g, '_');

export const grainForPeriod = (period) =>
  period === 'calendar-year' || period === 'fiscal-year' ? 'yearly' : 'monthly';

// Last day of the month containing `date` (a Date or a YYYY-MM-DD string), as YYYY-MM-DD.
export function lastDayOfMonth(date) {
  const d = date instanceof Date ? date : new Date(`${String(date).slice(0, 10)}T00:00:00Z`);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return end.toISOString().slice(0, 10);
}

async function coverageEndFor(database, sourceCollection) {
  if (ANNUAL_SOURCES.has(sourceCollection)) {
    const row = await database(sourceCollection).max('calendar_year as y').first();
    return row?.y ? `${row.y}-12-31` : null;
  }
  const row = await database(sourceCollection)
    .join('period', 'period.id', `${sourceCollection}.period`)
    .where('period.type', 'Monthly')
    .max('period.period_date as d')
    .first();
  return row?.d ? lastDayOfMonth(row.d) : null;
}

export async function updateDatasetMetadata(payload, context, result) {
  // Only a clean, successful load advances coverage / last-updated.
  if (!result || result.success !== true) return;

  const { database, services, schema, accountability } = context;
  const sourceCollection = sourceCollectionForDataset(payload?.dataset);
  if (!sourceCollection) return;

  const grain = grainForPeriod(payload?.period);

  try {
    const rows = await database('dataset_metadata')
      .where('source_collection', sourceCollection)
      .whereIn('period_type', [grain, 'both'])
      .select('id');
    if (!rows.length) return;

    const patch = { dataset_last_updated: result.completedAt || new Date().toISOString() };
    const coverageEnd = await coverageEndFor(database, sourceCollection);
    if (coverageEnd) patch.coverage_end = coverageEnd;

    const { ItemsService } = services;
    const svc = new ItemsService('dataset_metadata', { schema, accountability });
    await svc.updateMany(rows.map((r) => r.id), patch);

    console.log(
      `[Dataset metadata] Stamped ${rows.length} ${sourceCollection} row(s) (${grain}): ` +
        `coverage_end=${patch.coverage_end ?? '(unchanged)'}, dataset_last_updated=${patch.dataset_last_updated}`,
    );
  } catch (error) {
    // A metadata stamp must never fail the load itself.
    console.error('[Dataset metadata] Failed to update:', error.message);
  }
}
