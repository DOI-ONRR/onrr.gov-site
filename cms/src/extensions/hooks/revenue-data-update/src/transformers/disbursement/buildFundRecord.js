/**
 * Builds a fund record from a disbursement record for insertion into the fund table.
 *
 * @param {Object} record - The disbursement record (after transformations)
 * @returns {Object} - A fund record ready for insertion
 */
export function buildFundRecord(record) {
  const disbursementType = record.disbursement_type || '';
  const landCategory = record.land_category || '';

  // Determine source based on disbursement_type
  let source;
  if (disbursementType === '8(g)') {
    source = '8(g) offshore';
  } else if (
    disbursementType.includes('GoMESA') ||
    disbursementType.includes('GOMESA')
  ) {
    source = 'GOMESA offshore';
  } else {
    source = landCategory;
  }

  return {
    fund_type: record.fund_type || '',
    fund_class: record.fund_class || '',
    recipient: record.recipient || '',
    revenue_type: record.category || '',
    source,
    disbursement_type: disbursementType,
  };
}
