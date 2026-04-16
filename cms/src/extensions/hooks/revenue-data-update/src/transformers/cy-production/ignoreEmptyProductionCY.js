/**
 * Filters out calendar year production records where all key fields are empty/null.
 * Returns null if all fields are empty.
 *
 * Based on: ignore_empty_production_cy.sql
 *
 * @param {Object} record - The production record
 * @returns {Object|null} - The record, or null if it should be skipped
 */
export function ignoreEmptyProductionCY(record) {
  const isEmpty = (value) => value === null || value === undefined || value === '';

  if (
    isEmpty(record.calendar_year) &&
    isEmpty(record.land_class) &&
    isEmpty(record.land_category) &&
    isEmpty(record.state) &&
    isEmpty(record.county) &&
    isEmpty(record.fips_code) &&
    isEmpty(record.offshore_region) &&
    isEmpty(record.product) &&
    isEmpty(record.volume)
  ) {
    return null;
  }

  return record;
}
