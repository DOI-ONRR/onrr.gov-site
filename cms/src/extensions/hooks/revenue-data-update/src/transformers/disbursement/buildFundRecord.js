/**
 * Builds a fund record from a disbursement record for insertion into the fund table.
 *
 * @param {Object} record - The disbursement record (after transformations)
 * @returns {Object} - A fund record ready for insertion
 */
export function buildFundRecord(record) {
  const disbursementType = record.disbursement_type || '';
  const landCategory = record.land_category || '';

  // Determine source based on disbursement_type. The GOMESA/OCS-Gulf family (the raw feed
  // sends both 'GoMESA' and 'OCS Gulf') all maps to source 'OCS Gulf', mirroring what nrrd
  // presents publicly (its query tool shows Source 'OCS Gulf' for these rows). transformFundType
  // normalizes disbursement_type to 'OCS Gulf' upstream; the explicit 'GoMESA' checks keep this
  // correct even if buildFundRecord is called on a record that wasn't run through transformFundType.
  // (nrrd's own insert_fund has a 'GOMESA offshore' branch, but it is dead code there — its
  // BEFORE-insert trigger rewrites disbursement_type to 'OCS Gulf' first — so nrrd never emits it.)
  let source;
  if (disbursementType === '8(g)') {
    source = '8(g) offshore';
  } else if (
    disbursementType.includes('GoMESA') ||
    disbursementType.includes('GOMESA') ||
    disbursementType === 'OCS Gulf'
  ) {
    source = 'OCS Gulf';
  } else {
    source = landCategory;
  }

  return {
    type: record.fund_type || '',
    class: record.fund_class || '',
    recipient: record.recipient || '',
    revenue_type: record.category || '',
    source,
    disbursement_type: disbursementType,
  };
}
