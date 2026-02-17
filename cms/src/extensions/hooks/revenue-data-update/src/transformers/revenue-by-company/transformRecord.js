/**
 * Transforms a raw federal revenue by company record.
 *
 * Replicates the logic from the PostgreSQL trigger function
 * revenue_by_company_bri().
 *
 * @param {Object} record - Raw record with fields from CSV
 * @returns {Object} - Transformed record with derived fields populated
 */
export function transformRevenueByCompanyRecord(record) {
  const transformed = { ...record };

  // Convert accounting notation: (123) -> -123
  transformed.raw_revenue = (transformed.raw_revenue || '')
    .replace(/\(/g, '-')
    .replace(/\)/g, '');

  // Parse revenue as number (strip $, commas)
  const cleaned = transformed.raw_revenue
    .replace(/[$,]/g, '');
  transformed.revenue = parseFloat(cleaned) || 0;

  // Split revenue_agency_type into agency and type
  const parts = (transformed.revenue_agency_type || '').split(' - ');
  transformed.revenue_agency = parts[0] || '';
  transformed.revenue_type = parts[1] || '';

  // Trim commodity
  transformed.commodity = (transformed.commodity || '').trim();

  // Determine commodity_order (default to first 5 chars)
  switch (transformed.commodity) {
    case 'Oil':
      transformed.commodity_order = '1';
      break;
    case 'Gas':
      transformed.commodity_order = '2';
      break;
    case 'Oil & Gas':
      transformed.commodity_order = '3';
      transformed.commodity = 'Oil & Gas (Pre-production)';
      break;
    case 'NGL':
      transformed.commodity_order = '4';
      break;
    case 'Coal':
      transformed.commodity_order = '5';
      break;
    default:
      transformed.commodity_order = transformed.commodity.substring(0, 5);
      break;
  }

  // Capitalize first letter, lowercase rest
  if (transformed.commodity.length > 0) {
    transformed.commodity =
      transformed.commodity.charAt(0).toUpperCase() +
      transformed.commodity.slice(1).toLowerCase();
  }

  // Fix N/A casing
  transformed.commodity = transformed.commodity.replace(/N\\a/g, 'N\\A');

  // Parse calendar_year as integer
  transformed.calendar_year = parseInt(transformed.calendar_year, 10);

  return transformed;
}
