/**
 * Builds a location record from a revenue record for insertion into the location table.
 *
 * Based on: insert_location_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - Location record ready for insertion
 */
import { deriveLandType } from '../shared/deriveLandType.js';

export function buildLocationRecord(record) {
  const land_class = record.land_class_code || '';
  const land_category = record.land_category_code_desc || '';
  return {
    land_class,
    land_category,
    land_type: deriveLandType(land_class, land_category),
    state: record.state || null,
    county: record.county_code_desc || null,
    fips_code: record.fips_code || null,
    offshore_region: record.agency_state_region_code_desc || null,
  };
}
