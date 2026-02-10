/**
 * Filters out production records where all key fields are empty/null.
 * Returns null if all of: period_date, land_class, land_category, commodity, and volume are empty.
 *
 * Based on: ignore_empty_production.sql
 *
 * @param {Object} record - The production record
 * @returns {Object|null} - The record, or null if it should be skipped
 */
export function ignoreEmptyProduction(record) {
  const isEmpty = (value) => value === null || value === undefined || value === '';

  if (
    isEmpty(record.period_date) &&
    isEmpty(record.land_class) &&
    isEmpty(record.land_category) &&
    isEmpty(record.commodity) &&
    isEmpty(record.volume)
  ) {
    return null;
  }

  return record;
}
