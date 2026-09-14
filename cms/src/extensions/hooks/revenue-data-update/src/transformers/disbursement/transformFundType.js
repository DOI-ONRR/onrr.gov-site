/**
 * Transforms fund_type and disbursement_type based on business rules.
 * - Normalizes fund_type names
 * - Appends suffixes based on disbursement_type (8(g), OCS Gulf)
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

  // Append suffix based on disbursement_type. nrrd's transform_fund_type only appends to
  // fund_type; it does NOT rewrite disbursement_type. Leaving disbursement_type unchanged is
  // important because the fund `source` is derived from the ORIGINAL disbursement_type in
  // buildFundRecord / nrrd's insert_fund ('8(g)' -> '8(g) offshore', GoMESA -> 'GOMESA
  // offshore', else land_category); overwriting it here made those branches dead code.
  if (disbursementType.includes('8(g)')) {
    fundType = `${fundType} 8(g)`;
  } else if (disbursementType.includes('GoMESA') || disbursementType === 'OCS Gulf') {
    fundType = `${fundType} - OCS Gulf`;
  }

  return {
    ...record,
    fund_type: fundType,
    disbursement_type: disbursementType,
  };
}
