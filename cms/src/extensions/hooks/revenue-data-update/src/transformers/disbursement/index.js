/**
 * Disbursement data transformers.
 *
 * These functions convert raw disbursement data into the format expected
 * by the Directus CMS, replicating the logic previously implemented as
 * PostgreSQL trigger functions.
 */

export { formatNegativeDisbursement } from './formatNegativeDisbursement.js';
export { sanitizeNulls } from './sanitizeNulls.js';
export { transformCommodity } from './transformCommodity.js';
export { transformCounty } from './transformCounty.js';
export { transformFipsCode, createFipsCodeLookup } from './transformFipsCode.js';
export { transformFundType } from './transformFundType.js';
export { transformFundClassAndRecipient } from './transformFundClassAndRecipient.js';
export { buildFundRecord } from './buildFundRecord.js';
export { buildLocationRecord } from './buildLocationRecord.js';
export { buildPeriodRecord } from './buildPeriodRecord.js';

/**
 * Applies all field transformations to a disbursement record.
 * Does not include FIPS code lookup (async) or record builders.
 *
 * @param {Object} record - Raw disbursement record
 * @returns {Object|null} - Transformed record, or null if should be filtered out
 */
export function transformDisbursementRecord(record) {
  // Format negative values first (may return null to filter)
  let transformed = formatNegativeDisbursement(record);
  if (transformed === null) {
    return null;
  }

  // Sanitize nulls to empty strings
  transformed = sanitizeNulls(transformed);

  // Apply field transformations
  transformed = transformCommodity(transformed);
  transformed = transformCounty(transformed);
  transformed = transformFundType(transformed);
  transformed = transformFundClassAndRecipient(transformed);

  return transformed;
}
