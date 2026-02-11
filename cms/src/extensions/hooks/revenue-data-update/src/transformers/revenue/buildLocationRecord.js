/**
 * Builds a location record from a revenue record for insertion into the location table.
 *
 * Based on: insert_location_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - Location record ready for insertion
 */
export function buildLocationRecord(record) {
  return {
    land_class: record.land_class_code || '',
    land_category: record.land_category_code_desc || '',
    state: record.state || '',
    county: record.county_code_desc || '',
    fips_code: record.fips_code || '',
    offshore_region: record.agency_state_region_code_desc || '',
  };
}
