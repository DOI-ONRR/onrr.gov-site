/**
 * Builds a fund record from a revenue record for insertion into the fund table.
 *
 * Based on: load_revenue_monthly.sql - fund join logic
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - Fund record ready for insertion/lookup
 */
export function buildFundRecord(record) {
  return {
    revenue_type: record.revenue_type || null,
    source: record.land_category_code_desc || null,
    fund_type: null,
    fund_class: null,
    recipient: null,
    disbursement_type: null,
  };
}
