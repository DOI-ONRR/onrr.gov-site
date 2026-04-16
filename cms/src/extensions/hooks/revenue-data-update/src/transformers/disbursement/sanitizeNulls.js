/**
 * Replaces null/undefined values with empty strings for specified fields.
 *
 * @param {Object} record - The disbursement record
 * @returns {Object} - The record with nulls replaced by empty strings
 */
export function sanitizeNulls(record) {
  const fieldsToSanitize = [
    'fund_type',
    'disbursement_type',
    'land_category',
    'state',
    'county',
    'fund_class',
    'recipient',
    'category',
  ];

  const sanitized = { ...record };

  for (const field of fieldsToSanitize) {
    if (sanitized[field] == null) {
      sanitized[field] = '';
    }
  }

  return sanitized;
}
