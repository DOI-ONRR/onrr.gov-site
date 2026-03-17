/**
 * Replaces null/undefined values with empty strings for specified fields.
 * Sets commodity to "Not tied to a commodity" if empty.
 *
 * Based on: sanitize_nulls_revenue.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with nulls replaced by empty strings
 */
export function sanitizeNulls(record) {
  const fieldsToSanitize = [
    'land_class_code',
    'land_category_code_desc',
    'state',
    'county_code_desc',
    'fips_code',
    'agency_state_region_code_desc',
    'revenue_type',
    'mineral_production_code_desc',
    'product_code_desc',
  ];

  const sanitized = { ...record };

  for (const field of fieldsToSanitize) {
    if (sanitized[field] == null) {
      sanitized[field] = '';
    }
  }

  // Special handling for commodity
  if (sanitized.commodity === '' || sanitized.commodity == null) {
    sanitized.commodity = 'Not tied to a commodity';
  }

  return sanitized;
}
