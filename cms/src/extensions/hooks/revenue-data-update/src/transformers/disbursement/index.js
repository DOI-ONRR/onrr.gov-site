/**
 * Disbursement data transformers.
 *
 * These functions convert raw disbursement data into the format expected
 * by the Directus CMS, replicating the logic previously implemented as
 * PostgreSQL trigger functions.
 */

import { formatNegativeDisbursement } from './formatNegativeDisbursement.js';
import { sanitizeNulls } from './sanitizeNulls.js';
import { transformCommodity } from './transformCommodity.js';
import { transformCounty } from './transformCounty.js';
import { transformFipsCode, createFipsCodeLookup } from './transformFipsCode.js';
import { transformFundType } from './transformFundType.js';
import { transformFundClassAndRecipient } from './transformFundClassAndRecipient.js';
import { buildFundRecord } from './buildFundRecord.js';
import { buildLocationRecord } from './buildLocationRecord.js';
import { buildPeriodRecord } from './buildPeriodRecord.js';

export {
  formatNegativeDisbursement,
  sanitizeNulls,
  transformCommodity,
  transformCounty,
  transformFipsCode,
  createFipsCodeLookup,
  transformFundType,
  transformFundClassAndRecipient,
  buildFundRecord,
  buildLocationRecord,
  buildPeriodRecord,
};

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
  // fund_class_and_recipient runs BEFORE fund_type to match nrrd's trigger firing order
  // (Postgres fires BEFORE-insert triggers alphabetically: ..._transform_fund_class_and_
  // recipient_bri before ..._transform_fund_type_bri). This matters because fund_type
  // normalizes/suffixes fund_type and the class/recipient branches key off fund_type — so
  // they must see the ORIGINAL fund_type (e.g. "U.S. Treasury" for an OCS Gulf row, not the
  // later "U.S. Treasury - OCS Gulf").
  transformed = transformFundClassAndRecipient(transformed);
  transformed = transformFundType(transformed);

  return transformed;
}
