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
    revenue_type: record.revenue_type || '',
    source: record.land_category_code_desc || '',
    fund_type: '',
    fund_class: '',
    recipient: '',
    disbursement_type: '',
  };
}
