/**
 * Transforms offshore region and sets FIPS code accordingly.
 *
 * Based on: transform_offshore_region_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with transformed offshore region
 */
export function transformOffshoreRegion(record) {
  let offshoreRegion = record.agency_state_region_code_desc || '';
  let fipsCode = record.fips_code || '';

  switch (offshoreRegion) {
    case 'ALASKA OCS':
      offshoreRegion = 'Alaska';
      fipsCode = 'AKR';
      break;
    case 'PACIFIC OCS':
      offshoreRegion = 'Pacific';
      fipsCode = 'POR';
      break;
    case 'ATLANTIC OCS':
      offshoreRegion = 'Atlantic';
      fipsCode = 'AOR';
      break;
    case 'GULF OF MEXICO':
    case 'GULF OF AMERICA':
      offshoreRegion = 'Gulf of America';
      fipsCode = 'GMR';
      break;
    case 'NEW MEXICO':
    case 'EAST STATES':
      offshoreRegion = '';
      break;
    default:
      // Clear offshore region for Onshore or Not Tied to a Lease
      if (
        record.land_category_code_desc === 'Not Tied to a Lease' ||
        record.land_category_code_desc === 'Onshore'
      ) {
        offshoreRegion = '';
      }
      break;
  }

  return {
    ...record,
    agency_state_region_code_desc: offshoreRegion,
    fips_code: fipsCode,
  };
}
