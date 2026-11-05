/**
 * Transforms fund_type and disbursement_type based on business rules.
 * - Normalizes fund_type names
 * - Appends suffixes based on disbursement_type (8(g), OCS Gulf) and normalizes the
 *   GOMESA/OCS-Gulf family to the canonical disbursement_type 'OCS Gulf' (mirrors nrrd)
 *
 * @param {Object} record - The disbursement record
 * @returns {Object} - The record with transformed fund_type and disbursement_type
 */
export function transformFundType(record) {
  let fundType = record.fund_type || '';
  let disbursementType = record.disbursement_type || '';

  // Normalize specific fund_type values
  if (fundType === 'BLM - Permit Processing and Improvement') {
    fundType = 'Lease Process Improvement (BLM)';
  } else if (
    fundType === 'U.S. TreasuryAI' ||
    fundType === 'American Indian Tribes' ||
    fundType === 'Native American Tribes & Allottees'
  ) {
    fundType = 'Native American Tribes & Allottees';
  }

  // Append suffix based on disbursement_type, and normalize the GOMESA/OCS-Gulf family to a
  // single canonical disbursement_type, 'OCS Gulf'. This mirrors nrrd's live
  // transform_fund_type_disbursement trigger exactly: the raw feed uses BOTH 'GoMESA' and
  // 'OCS Gulf' for the same category, and nrrd collapses both to 'OCS Gulf' (appending
  // ' - OCS Gulf' to fund_type and rewriting disbursement_type to 'OCS Gulf'). nrrd's public
  // surfaces confirm this is the canonical value: its download view prints fund.disbursement_type
  // raw ('OCS Gulf') and its query tool derives source 'OCS Gulf' from it. The 8(g) branch only
  // suffixes fund_type and leaves disbursement_type as '8(g)', matching nrrd.
  if (disbursementType.includes('8(g)')) {
    fundType = `${fundType} 8(g)`;
  } else if (disbursementType.includes('GoMESA') || disbursementType === 'OCS Gulf') {
    fundType = `${fundType} - OCS Gulf`;
    disbursementType = 'OCS Gulf';
  }

  return {
    ...record,
    fund_type: fundType,
    disbursement_type: disbursementType,
  };
}
