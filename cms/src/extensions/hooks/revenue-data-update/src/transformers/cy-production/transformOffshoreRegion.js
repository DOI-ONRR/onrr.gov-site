/**
 * Transforms offshore region names and sets FIPS code accordingly.
 * Clears state and county for offshore regions.
 *
 * Based on: transform_offshore_region_production.sql
 *
 * @param {Object} record - The production record
 * @returns {Object} - The record with transformed offshore region
 */
export function transformOffshoreRegion(record) {
  let offshoreRegion = record.offshore_region || '';
  let fipsCode = record.fips_code || '';
  let county = record.county;
  let state = record.state;

  switch (offshoreRegion) {
    case 'Offshore Alaska':
      offshoreRegion = 'Alaska';
      fipsCode = 'AKR';
      county = '';
      state = '';
      break;
    case 'Offshore Pacific':
      offshoreRegion = 'Pacific';
      fipsCode = 'POR';
      county = '';
      state = '';
      break;
    case 'Offshore Atlantic':
      offshoreRegion = 'Atlantic';
      fipsCode = 'AOR';
      county = '';
      state = '';
      break;
    case 'Offshore Gulf of America':
      offshoreRegion = 'Gulf of America';
      fipsCode = 'GMR';
      county = '';
      state = '';
      break;
    default:
      // Keep as-is
      break;
  }

  return {
    ...record,
    offshore_region: offshoreRegion,
    fips_code: fipsCode,
    county,
    state,
  };
}
