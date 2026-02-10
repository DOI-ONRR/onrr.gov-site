/**
 * Production data transformers.
 *
 * These transformers convert and normalize production data from CSV imports
 * before insertion into the database.
 */

import { formatVolume } from './formatVolume.js';
import { ignoreEmptyProduction } from './ignoreEmptyProduction.js';
import { buildPeriodRecord } from './buildPeriodRecord.js';
import { sanitizeCommodity } from './sanitizeCommodity.js';

export {
  formatVolume,
  ignoreEmptyProduction,
  buildPeriodRecord,
  sanitizeCommodity,
};

/**
 * Applies all production transformations to a record.
 * Returns null if the record should be skipped.
 *
 * @param {Object} record - The raw production record from CSV
 * @returns {Object|null} - The transformed record, or null if it should be skipped
 */
export function transformProductionRecord(record) {
  // Check for empty records first
  let transformed = ignoreEmptyProduction(record);
  if (transformed === null) {
    return null;
  }

  // Apply transformations
  transformed = formatVolume(transformed);
  transformed = sanitizeCommodity(transformed);

  return transformed;
}
