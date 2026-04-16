/**
 * Transforms fund_class and recipient based on fund_type and other fields.
 * Contains complex business logic for categorizing disbursements.
 *
 * @param {Object} record - The disbursement record
 * @returns {Object} - The record with transformed fund_class and recipient
 */
export function transformFundClassAndRecipient(record) {
  const fundType = record.fund_type || '';
  const county = record.county || '';
  let fundClass = record.fund_class || '';
  let recipient = record.recipient || '';

  // Default fund_class to 'Other funds' if fund_type is set but fund_class is empty
  if (fundType !== '' && fundClass === '') {
    fundClass = 'Other funds';
  }

  // Native American funds
  if (
    fundType === 'U.S. TreasuryAI' ||
    fundType === 'American Indian Tribes' ||
    fundType === 'Native American Tribes & Allottees'
  ) {
    fundClass = 'Native American tribes and individuals';
    recipient = 'Native American tribes and individuals';
  }
  // U.S. Treasury funds
  else if (fundType === 'U.S. Treasury' || fundType === 'U.S. Treasury - GoMESA') {
    fundClass = 'U.S. Treasury';
    recipient = 'U.S. Treasury';
  }
  // Historic Preservation Fund
  else if (fundType === 'Historic Preservation Fund') {
    fundClass = 'Historic Preservation Fund';
    recipient = 'Historic Preservation Fund';
  }
  // State funds (no county)
  else if (fundType === 'State' && county === '') {
    fundClass = 'State and local governments';
    recipient = 'State';
  }
  // State funds (with county)
  else if (fundType === 'State' && county !== '') {
    fundClass = 'State and local governments';
    recipient = 'County';
  }
  // State 8(g) funds (no county)
  else if (fundType === 'State 8(g)' && county === '') {
    fundClass = 'State and local governments';
    recipient = 'State';
  }
  // State 8(g) funds (with county)
  else if (fundType === 'State 8(g)' && county !== '') {
    fundClass = 'State and local governments';
    recipient = 'County';
  }
  // U.S. GOMESA funds (no county)
  else if (fundType.toLowerCase().startsWith('u.s.') && fundType.toLowerCase().includes('gomesa') && county === '') {
    fundClass = 'U.S. Treasury';
    recipient = 'U.S. Treasury';
  }
  // State GOMESA funds (no county)
  else if (fundType.toLowerCase().startsWith('state') && fundType.toLowerCase().includes('gomesa') && county === '') {
    fundClass = 'State and local governments';
    recipient = 'State';
  }
  // GOMESA funds (with county) - note: SQL has LOWER(NEW.fund_type) = '%gomesa%' which likely should be LIKE
  else if (fundType.toLowerCase().includes('gomesa') && county !== '') {
    fundClass = 'State and local governments';
    recipient = 'County';
  }
  // Land & Water Conservation Fund - GoMESA
  else if (fundType === 'Land & Water Conservation Fund - GoMesa' || fundType === 'Land & Water Conservation Fund - GoMESA') {
    fundClass = 'Land and Water Conservation Fund';
    recipient = 'Land and Water Conservation Fund - GoMesa';
  }
  // Land & Water Conservation Fund
  else if (fundType === 'Land & Water Conservation Fund') {
    fundClass = 'Land and Water Conservation Fund';
    recipient = 'Land and Water Conservation Fund';
  }
  // Reclamation Fund
  else if (fundType === 'Reclamation Fund' || fundType === 'Reclamation') {
    fundClass = 'Reclamation Fund';
    recipient = 'Reclamation Fund';
  }
  // Other funds - use fund_type as recipient
  else if (
    !isKnownFundType(fundType) &&
    (fundClass === '' || fundClass === 'Other funds') &&
    recipient === ''
  ) {
    fundClass = 'Other funds';
    recipient = fundType;
  }

  return {
    ...record,
    fund_class: fundClass,
    recipient,
  };
}

/**
 * Checks if a fund_type is one of the known types that have specific handling.
 */
function isKnownFundType(fundType) {
  const knownTypes = [
    '',
    'Historic Preservation Fund',
    'U.S. Treasury - GoMESA',
    'U.S. Treasury',
    'State',
    'U.S. TreasuryAI',
    'American Indian Tribes',
    'Native American Tribes & Allottees',
    'Native American tribes and individuals',
  ];
  return knownTypes.includes(fundType);
}
