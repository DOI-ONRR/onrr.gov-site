/**
 * Transforms county names by fixing typos.
 *
 * Based on: transform_county_code_desc.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with transformed county
 */
export function transformCountyCodeDesc(record) {
  if (!record.county_code_desc) {
    return record;
  }

  let county = record.county_code_desc;
  const fipsCode = record.fips_code || '';

  // Fix known typos
  const typoFixes = {
    'Santa Barbar': 'Santa Barbara',
    'Pt. Coupee': 'Pointe Coupee',
    'Point Coupee': 'Pointe Coupee',
    'E Baton Rouge': 'East Baton Rouge',
    'Grand Trvse': 'Grand Traverse',
    'Jeffer Davis': 'Jefferson Davis',
    'San Augustin': 'San Augustine',
    'San Pete': 'Sanpete',
    'St Charles': 'St. Charles',
    'St Clair': 'St. Clair',
    'St Martin': 'St. Martin',
    'St Mary': 'St. Mary',
  };

  // Simple typo fixes
  if (typoFixes[county]) {
    county = typoFixes[county];
  }

  // Golden Valley special cases with FIPS code
  if ((county === 'Golden Valle' && fipsCode === '38033') ||
      (county === 'Golden Vally' && fipsCode === '30037')) {
    county = 'Golden Valley';
  }

  return {
    ...record,
    county_code_desc: county,
  };
}
