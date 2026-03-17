/**
 * Transforms commodity names to standardized format.
 * - CO2, Carbon Dioxide -> Carbon dioxide
 * - NGL -> Natural gas liquids
 * - Oil & Gas -> Oil & gas (pre-production)
 * - Capitalizes first letter, lowercases rest
 *
 * Based on: transform_commodity.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with transformed commodity
 */
export function transformCommodity(record) {
  let commodity = record.commodity;

  if (!commodity) {
    return record;
  }

  // Apply specific replacements
  switch (commodity) {
    case 'CO2':
    case 'Carbon Dioxide':
      commodity = 'Carbon dioxide';
      break;
    case 'NGL':
      commodity = 'Natural gas liquids';
      break;
    case 'Oil & Gas':
      commodity = 'Oil & gas (pre-production)';
      break;
    default:
      // Capitalize first letter, lowercase the rest
      commodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();
      break;
  }

  return {
    ...record,
    commodity,
  };
}
