/**
 * Maps CSV header names to snake_case property names used in records.
 */

export const DISBURSEMENT_FIELD_MAP = {
  'Month': 'month',
  'Calendar Year': 'calendar_year',
  'Fund Type': 'fund_type',
  'Treasury Fund': 'treasury_fund',
  'Land Category': 'land_category',
  'Disbursement Type': 'disbursement_type',
  'State': 'state',
  'County': 'county',
  'Commodity': 'commodity',
  'Category': 'category',
  'Disbursement': 'disbursement',
};

/**
 * Converts a CSV header to its snake_case property name.
 * Returns the original header (lowercased with spaces as underscores) if no mapping exists.
 *
 * @param {string} header - The CSV header name
 * @param {Object} fieldMap - The field mapping object
 * @returns {string} - The snake_case property name
 */
export function mapHeader(header, fieldMap) {
  if (fieldMap[header]) {
    return fieldMap[header];
  }
  // Fallback: convert to lowercase and replace spaces with underscores
  return header.toLowerCase().replace(/\s+/g, '_');
}
