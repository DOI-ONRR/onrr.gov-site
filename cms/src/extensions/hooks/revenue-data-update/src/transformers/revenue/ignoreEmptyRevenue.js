/**
 * Filters out revenue records where all key fields are empty/null.
 * Returns null if all fields are empty.
 *
 * Based on: ignore_empty_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object|null} - The record, or null if it should be skipped
 */
export function ignoreEmptyRevenue(record) {
  const isEmpty = (value) => value === null || value === undefined || value === '';

  if (
    isEmpty(record.accept_date) &&
    isEmpty(record.land_class_code) &&
    isEmpty(record.land_category_code_desc) &&
    isEmpty(record.state) &&
    isEmpty(record.county_code_desc) &&
    isEmpty(record.fips_code) &&
    isEmpty(record.agency_state_region_code_desc) &&
    isEmpty(record.revenue_type) &&
    isEmpty(record.mineral_production_code_desc) &&
    isEmpty(record.commodity) &&
    isEmpty(record.product_code_desc) &&
    isEmpty(record.revenue)
  ) {
    return null;
  }

  return record;
}
