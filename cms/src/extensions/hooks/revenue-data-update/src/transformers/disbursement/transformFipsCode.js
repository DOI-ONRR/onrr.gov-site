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
      fips_code: null,
    };
  }

  try {
    const fipsCode = await lookupFipsCode(record.county, record.state);
    return {
      ...record,
      fips_code: fipsCode || null,
    };
  } catch (error) {
    // If lookup fails, return empty fips_code
    return {
      ...record,
      fips_code: null,
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
  // Memoize by county|state for the lifetime of one load: a disbursement file repeats the
  // same counties across thousands of rows, so without a cache this does one DB round-trip
  // per record. county_lookup is static during a load, so caching is safe and cuts the
  // transform phase from thousands of queries to one per distinct county.
  const cache = new Map();

  return async (county, state) => {
    const cacheKey = `${county}|${state}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const results = await itemsService.readByQuery({
      filter: {
        county: { _eq: county },
        state: { _eq: state },
      },
      fields: ['fips_code'],
      limit: 1,
    });

    const fipsCode = results?.[0]?.fips_code || null;
    cache.set(cacheKey, fipsCode);
    return fipsCode;
  };
}
