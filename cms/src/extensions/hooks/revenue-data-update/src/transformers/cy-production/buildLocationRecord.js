/**
 * Builds a location record from a calendar year production record.
 *
 * @param {Object} record - The production record
 * @returns {Object} - Location record ready for insertion
 */
export function buildLocationRecord(record) {
  return {
    land_class: record.land_class || '',
    land_category: record.land_category || '',
    state: record.state || null,
    county: record.county || null,
    fips_code: record.fips_code || null,
    offshore_region: record.offshore_region || null,
  };
}
