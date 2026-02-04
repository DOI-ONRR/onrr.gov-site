/**
 * Transforms commodity names to standardized format.
 * - CO2 → Carbon dioxide
 * - Carbon Dioxide → Carbon dioxide
 * - NGL → Natural gas liquids
 * - Oil & Gas → Oil & gas (pre-production)
 * - Capitalizes first letter, lowercases rest
 *
 * @param {Object} record - The disbursement record
 * @returns {Object} - The record with transformed commodity
 */
export function transformCommodity(record) {

  let commodity = record.commodity;

  if (!record.commodity) {
    commodity = 'Not tied to a commodity';
    return {
      ...record,
      commodity,
    };
  }

  // Apply specific replacements
  if (commodity.startsWith('CO2')) {
    commodity = commodity.replace('CO2', 'Carbon dioxide');
  } else if (commodity.startsWith('Carbon Dioxide')) {
    commodity = commodity.replace('Carbon Dioxide', 'Carbon dioxide');
  } else if (commodity.startsWith('NGL')) {
    commodity = commodity.replace('NGL', 'Natural gas liquids');
  } else if (commodity.startsWith('Oil & Gas')) {
    commodity = commodity.replace('Oil & Gas', 'Oil & gas (pre-production)');
  }

  // Capitalize first letter, lowercase the rest
  commodity = commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase();

  return {
    ...record,
    commodity,
  };
}
