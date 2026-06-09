/**
 * Fiscal Year Production data transformers.
 *
 * These transformers convert and normalize fiscal year production data
 * from CSV imports before insertion into the database.
 */

import { ignoreEmptyProductionFY } from './ignoreEmptyProductionFY.js';
import { buildPeriodRecord } from './buildPeriodRecord.js';

// Reuse formatVolume from production transformers
import { formatVolume } from '../production/formatVolume.js';

// Reuse transformers from calendar year production
import { transformOffshoreRegion } from '../cy-production/transformOffshoreRegion.js';
import {
  transformCountyStateFipsCode,
  transformCountyStateFipsCodeWithLookup,
  createFipsCodeLookup,
} from '../cy-production/transformCountyStateFipsCode.js';
import {
  transformProduct,
  extractCommodity,
  extractUnit,
  extractUnitAbbr,
} from '../cy-production/transformProduct.js';
import { buildLocationRecord } from '../cy-production/buildLocationRecord.js';

export {
  ignoreEmptyProductionFY,
  formatVolume,
  transformOffshoreRegion,
  transformCountyStateFipsCode,
  transformCountyStateFipsCodeWithLookup,
  createFipsCodeLookup,
  transformProduct,
  extractCommodity,
  extractUnit,
  extractUnitAbbr,
  buildPeriodRecord,
  buildLocationRecord,
};

/**
 * Applies all fiscal year production transformations to a record.
 * Returns null if the record should be skipped.
 *
 * @param {Object} record - The raw production record from CSV
 * @returns {Object|null} - The transformed record, or null if it should be skipped
 */
export function transformFYProductionRecord(record) {
  // Check for empty records first
  let transformed = ignoreEmptyProductionFY(record);
  if (transformed === null) {
    return null;
  }

  // Apply transformations in order
  transformed = formatVolume(transformed);
  transformed = transformOffshoreRegion(transformed);
  transformed = transformCountyStateFipsCode(transformed);
  transformed = transformProduct(transformed);

  return transformed;
}
