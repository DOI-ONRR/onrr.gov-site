/**
 * Transforms product code descriptions to standardized format.
 * Primarily normalizes geothermal product descriptions.
 *
 * Based on: transform_product_code_desc.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with transformed product code description
 */
export function transformProductCodeDesc(record) {
  if (!record.product_code_desc) {
    return record;
  }

  let product = record.product_code_desc;

  const productMappings = {
    'Geothermal - Direct Utilization, Hundreds of Gallons':
      'Geothermal - Direct Use (Hundreds of Gallons)',
    'Geothermal - Direct Utilization, Millions of BTUs':
      'Geothermal - Direct Use (Millions of BTUs)',
    'Geothermal - Direct Utilization, Other':
      'Geothermal - Direct Utilization - Other',
    'Geothermal - Direct Use, Millions of Gallons':
      'Geothermal - Direct Use (Millions of Gallons)',
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
  }

  return {
    ...record,
    product_code_desc: product,
  };
}
