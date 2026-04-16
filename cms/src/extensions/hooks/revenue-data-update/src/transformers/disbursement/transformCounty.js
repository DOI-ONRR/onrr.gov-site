/**
 * Transforms county names by fixing typos and removing suffixes.
 * - Fixes "Hidalgo Caounty" typo
 * - Removes " County", " Parish", " Borough" suffixes (case-insensitive)
 * - Removes " Paris" (partial match cleanup)
 *
 * @param {Object} record - The disbursement record
 * @returns {Object} - The record with transformed county
 */
export function transformCounty(record) {
  if (record.county == null) {
    return {
      ...record,
      county: '',
    };
  }

  let county = record.county;

  // Fix known typo
  if (county === 'Hidalgo Caounty') {
    county = 'Hidalgo County';
  }

  // Remove suffixes (case-insensitive)
  county = county.replace(/ county/gi, '');
  county = county.replace(/ parish/gi, '');
  county = county.replace(/ borough/gi, '');
  county = county.replace(/ Paris/g, '');

  return {
    ...record,
    county: county || '',
  };
}
