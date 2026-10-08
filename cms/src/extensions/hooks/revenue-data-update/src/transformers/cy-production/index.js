/**
 * Calendar Year Production data transformers.
 *
 * These transformers convert and normalize calendar year production data
 * from CSV imports before insertion into the database.
 */

import { ignoreEmptyProductionCY } from './ignoreEmptyProductionCY.js';
import { transformOffshoreRegion } from './transformOffshoreRegion.js';
import {
  transformCountyStateFipsCode,
  transformCountyStateFipsCodeWithLookup,
  createFipsCodeLookup,
} from './transformCountyStateFipsCode.js';
import {
  transformProduct,
  extractCommodity,
  extractUnit,
  extractUnitAbbr,
} from './transformProduct.js';
import { buildPeriodRecord } from './buildPeriodRecord.js';
import { buildLocationRecord } from './buildLocationRecord.js';

// Reuse formatVolume from production transformers
import { formatVolume } from '../production/formatVolume.js';

export {
  ignoreEmptyProductionCY,
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
 * Applies all calendar year production transformations to a record.
 * Returns null if the record should be skipped.
 *
 * @param {Object} record - The raw production record from CSV
 * @returns {Object|null} - The transformed record, or null if it should be skipped
 */
export function transformCYProductionRecord(record) {
  // Check for empty records first
  let transformed = ignoreEmptyProductionCY(record);
  if (transformed === null) {
    return null;
  }

  // Apply transformations in order. NOTE: the product is intentionally left RAW — nrrd
  // retired the CY transform_product trigger and resolves the raw CSV spelling through the
  // commodity-alias map in load_production_calendar_year, which the CY loader mirrors.
  transformed = formatVolume(transformed);
  transformed = transformOffshoreRegion(transformed);
  transformed = transformCountyStateFipsCode(transformed);

  return transformed;
}
