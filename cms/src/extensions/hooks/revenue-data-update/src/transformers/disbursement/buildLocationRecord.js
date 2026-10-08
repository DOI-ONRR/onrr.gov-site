/**
 * Builds a location record from a disbursement record for insertion into the location table.
 *
 * @param {Object} record - The disbursement record (after transformations)
 * @returns {Object} - A location record ready for insertion
 */
import { deriveLandType } from '../shared/deriveLandType.js';

export function buildLocationRecord(record) {
  const fundType = record.fund_type || '';

  // Determine land_class based on fund_type
  const landClass = fundType === 'Native American Tribes & Allottees'
    ? 'Native American'
    : 'Federal';
  const landCategory = record.land_category || '';

  return {
    land_class: landClass,
    land_category: landCategory,
    land_type: deriveLandType(landClass, landCategory),
    state: record.state || null,
    county: record.county || null,
    fips_code: (!record.fips_code && !record.county && record.state.length == 2) ? record.state : record.fips_code,
  };
}
