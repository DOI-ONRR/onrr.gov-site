/**
 * Formats negative disbursement values.
 * - Converts accounting notation (123) to -123
 * - Returns null for records where disbursement is just "-"
 *
 * @param {Object} record - The disbursement record
 * @returns {Object|null} - The transformed record, or null if should be filtered out
 */
export function formatNegativeDisbursement(record) {
  if (!record.disbursement) {
    return record;
  }

  const trimmed = record.disbursement.trim();

  // Filter out records with just a dash
  if (trimmed === '-') {
    return null;
  }

  // Convert accounting notation (123) to -123
  let formatted = record.disbursement;
  formatted = formatted.replace('(', '-');
  formatted = formatted.replace(')', '');

  return {
    ...record,
    disbursement: formatted,
  };
}
