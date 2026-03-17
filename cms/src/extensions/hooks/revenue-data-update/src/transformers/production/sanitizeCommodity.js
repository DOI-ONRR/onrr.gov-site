/**
 * Sanitizes commodity names for production records.
 * Normalizes unit text for Coal commodities.
 *
 * Based on: sanitize_commodity_production.sql
 *
 * @param {Object} record - The production record
 * @returns {Object} - The record with sanitized commodity
 */
export function sanitizeCommodity(record) {
  if (!record.commodity) {
    return record;
  }

  let commodity = record.commodity;

  // Normalize Coal unit text: (ton) -> (tons)
  if (commodity.startsWith('Coal')) {
    commodity = commodity.replace('(ton)', '(tons)');
  }

  return {
    ...record,
    commodity,
  };
}
