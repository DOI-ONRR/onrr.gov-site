/**
 * Looks up and sets the FIPS code based on county and state.
 *
 * @param {Object} record - The disbursement record
 * @param {Function} lookupFipsCode - Async function that takes (county, state) and returns fips_code or null
 * @returns {Promise<Object>} - The record with fips_code populated
 */
export async function transformFipsCode(record, lookupFipsCode) {
  if (!record.county || !record.state) {
    return {
      ...record,
      fips_code: '',
    };
  }

  try {
    const fipsCode = await lookupFipsCode(record.county, record.state);
    return {
      ...record,
      fips_code: fipsCode || '',
    };
  } catch (error) {
    // If lookup fails, return empty fips_code (matches SQL EXCEPTION handler)
    return {
      ...record,
      fips_code: '',
    };
  }
}

/**
 * Creates a FIPS code lookup function using a Directus ItemsService.
 *
 * @param {Object} itemsService - Directus ItemsService for county_lookup collection
 * @returns {Function} - Lookup function for use with transformFipsCode
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
