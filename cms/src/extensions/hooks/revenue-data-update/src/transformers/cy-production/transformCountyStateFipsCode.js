/**
 * Transforms county, state, and FIPS code.
 * - Removes County/Parish/Borough suffixes from county
 * - Handles LA offshore special case
 * - Fixes Santa Barbara typo
 * - Left-pads FIPS code to 5 digits when county is present
 *
 * Based on: transform_county_state_fips_code_prod_fy.sql
 *
 * @param {Object} record - The production record
 * @param {Function} lookupFipsCode - Optional async function for FIPS lookup
 * @returns {Object} - The record with transformed county, state, and FIPS code
 */
export function transformCountyStateFipsCode(record) {
  let county = record.county || '';
  let state = record.state || '';
  let fipsCode = record.fips_code || '';
  let offshoreRegion = record.offshore_region || '';

  // Remove suffixes from county
  county = county.replace(/ County/g, '');
  county = county.replace(/ Parish/g, '');
  county = county.replace(/ Borough/g, '');

  // Handle LA offshore special case
  if (state === 'LA' && record.land_category === 'Offshore') {
    state = '';
    county = '';
    fipsCode = 'GMR';
    offshoreRegion = 'Gulf of Mexico';
  }

  // Fix Santa Barbara typo
  if (county === 'Santa Barbar') {
    county = 'Santa Barbara';
  }

  // Left-pad FIPS code to 5 digits when county is present
  if (county !== '' && fipsCode) {
    fipsCode = fipsCode.toString().padStart(5, '0');
  }

  return {
    ...record,
    county,
    state,
    fips_code: fipsCode,
    offshore_region: offshoreRegion,
  };
}

/**
 * Async version that performs FIPS code lookup when FIPS is missing.
 *
 * @param {Object} record - The production record
 * @param {Function} lookupFipsCode - Async function that takes (county, state) and returns fips_code
 * @returns {Promise<Object>} - The record with transformed and looked-up FIPS code
 */
export async function transformCountyStateFipsCodeWithLookup(record, lookupFipsCode) {
  let transformed = transformCountyStateFipsCode(record);

  // Lookup FIPS code if not present but county and state are
  if (!transformed.fips_code && transformed.county && transformed.state && lookupFipsCode) {
    try {
      const fipsCode = await lookupFipsCode(transformed.county, transformed.state);
      if (fipsCode) {
        transformed = {
          ...transformed,
          fips_code: fipsCode.toString().padStart(5, '0'),
        };
      }
    } catch (error) {
      // If lookup fails, continue without FIPS code
    }
  }

  return transformed;
}

/**
 * Creates a FIPS code lookup function using a Directus ItemsService.
 *
 * @param {Object} itemsService - Directus ItemsService for county_lookup collection
 * @returns {Function} - Lookup function for use with transformCountyStateFipsCodeWithLookup
 */
export function createFipsCodeLookup(itemsService) {
  return async (county, state) => {
    const results = await itemsService.readByQuery({
      filter: {
        county: { _eq: county },
        state: { _eq: state },
      },
      fields: ['fips_code'],
      limit: 1,
    });

    return results?.[0]?.fips_code || null;
  };
}
