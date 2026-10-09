/**
 * Shared revenue_data_update dispatcher.
 *
 * Maps an item payload ({ dataset, period, file }) to the matching process and
 * runs it. Used by BOTH the `revenue_data_update.items.create` hook and the
 * "Rerun revenue data update" flow operation, so a re-run executes the exact
 * same logic as the original run — the item already stores everything the
 * process needs (dataset, period, file), so no new item is required to re-run.
 *
 * @param {{dataset: string, period?: string, file: string}} payload
 * @param {Object} context - Directus hook/operation context ({ services, database, schema, accountability })
 * @returns {Promise<Object|null>} - The process result, or null when `dataset` matches no process.
 */
import { processDisbursementUpdate } from './disbursement/index.js';
import { processProductionUpdate } from './production/index.js';
import { processRevenueUpdate } from './revenue/index.js';
import { processCYProductionUpdate } from './cy-production/index.js';
import { processFYProductionUpdate } from './fy-production/index.js';
import { processRevenueByCompanyUpdate } from './revenue-by-company/index.js';
import { processFederalSalesUpdate } from './federal-sales/index.js';

export async function runDatasetUpdate(payload, context) {
  switch (payload.dataset) {
    case 'disbursement':
      return processDisbursementUpdate(payload.file, context);
    case 'production':
      if (payload.period === 'calendar-year') {
        return processCYProductionUpdate(payload.file, context);
      }
      if (payload.period === 'fiscal-year') {
        return processFYProductionUpdate(payload.file, context);
      }
      return processProductionUpdate(payload.file, context);
    case 'revenue':
      return processRevenueUpdate(payload.file, context, { period: payload.period });
    case 'federal-revenue-by-company':
      return processRevenueByCompanyUpdate(payload.file, context);
    case 'federal-sales':
      return processFederalSalesUpdate(payload.file, context);
    default:
      return null;
  }
}
