/**
 * Left-pads FIPS code to 5 digits when county is present.
 *
 * Based on: sanitize_fips_code_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with sanitized FIPS code
 */
export function sanitizeFipsCode(record) {
  if (record.county_code_desc && record.county_code_desc !== '') {
    return {
      ...record,
      fips_code: (record.fips_code || '').padStart(5, '0'),
    };
  }

  return record;
}
