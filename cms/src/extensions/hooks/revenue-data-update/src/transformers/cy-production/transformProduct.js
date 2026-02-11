/**
 * Transforms product names to standardized format.
 *
 * Based on: transform_product.sql
 *
 * @param {Object} record - The production record
 * @returns {Object} - The record with transformed product
 */
export function transformProduct(record) {
  let product = record.product;

  if (!product) {
    return record;
  }

  // Apply specific replacements
  const productMappings = {
    'Sand/Gravel-Cubic Yards (cyd)': 'Sand/Gravel (Cubic Yards)',
    'Geothermal - Direct Utilization, Hundreds of Gallons':
      'Geothermal - Direct Use (Hundreds of Gallons)',
    'Geothermal - Direct Use, Millions of Gallons':
      'Geothermal - Direct Use (Millions of Gallons)',
    'Geothermal - Direct Use, Millions of Gallons (cgal)':
      'Geothermal - Direct Use, Millions of Gallons (mgal)',
    'Geothermal - Direct Utilization, Millions of BTUs':
      'Geothermal - Direct Use (Millions of BTUs)',
    'Geothermal - Electrical Generation, Kilowatt Hours':
      'Geothermal - Electrical Generation (Kilowatt Hours)',
    'Geothermal - Electrical Generation, Other':
      'Geothermal - Electrical Generation (Other)',
    'Geothermal - Electrical Generation, Thousands of Pounds':
      'Geothermal - Electrical Generation (Thousands of Pounds)',
    'Geothermal - sulfur': 'Geothermal - Sulfur (tons)',
  };

  if (productMappings[product]) {
    product = productMappings[product];
  } else if (product.includes('Dioxide')) {
    // Handle Dioxide -> dioxide transformation
    product = product.replace('Dioxide', 'dioxide');
  }

  // Capitalize first letter, lowercase the rest
  product = product.charAt(0).toUpperCase() + product.slice(1).toLowerCase();

  return {
    ...record,
    product,
  };
}

/**
 * Extracts commodity name from the product string.
 * e.g., "Gas (Mcf)" -> "Gas"
 * e.g., "Geothermal - Direct Use (Millions of BTUs)" -> "Geothermal"
 *
 * @param {string} product - The product string
 * @returns {string} - The commodity name
 */
export function extractCommodity(product) {
  if (!product) return '';

  // If product contains " (", extract everything before it
  if (product.includes(' (')) {
    return product.split(' (')[0].trim();
  }

  // If product contains " - ", extract everything before it
  if (product.includes(' - ')) {
    return product.split(' - ')[0].trim();
  }

  return product;
}

/**
 * Extracts unit from the product string.
 * e.g., "Gas (Mcf)" -> "Mcf"
 * e.g., "Oil (bbl)" -> "bbl"
 *
 * @param {string} product - The product string
 * @returns {string} - The unit (up to 20 chars)
 */
export function extractUnit(product) {
  if (!product) return '';

  const match = product.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].substring(0, 20);
  }

  return '';
}

/**
 * Extracts unit abbreviation from the product string.
 * e.g., "Gas (Mcf)" -> "Mcf"
 *
 * @param {string} product - The product string
 * @returns {string} - The unit abbreviation (up to 5 chars)
 */
export function extractUnitAbbr(product) {
  if (!product) return '';

  const match = product.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].substring(0, 5);
  }

  return '';
}
