import { describe, it, expect } from 'vitest';
import {
  transformProduct,
  extractCommodity,
  extractUnit,
  extractUnitAbbr,
} from '../../../transformers/cy-production/transformProduct.js';

describe('transformProduct', () => {
  it('should transform Dioxide to dioxide', () => {
    const record = { product: 'Carbon Dioxide (ton)' };
    const result = transformProduct(record);
    expect(result.product).toBe('Carbon dioxide (ton)');
  });

  it('should transform Sand/Gravel-Cubic Yards (cyd)', () => {
    const record = { product: 'Sand/Gravel-Cubic Yards (cyd)' };
    const result = transformProduct(record);
    expect(result.product).toBe('Sand/gravel (cubic yards)');
  });

  it('should transform geothermal products', () => {
    expect(transformProduct({ product: 'Geothermal - Direct Utilization, Hundreds of Gallons' }).product)
      .toBe('Geothermal - direct use (hundreds of gallons)');

    expect(transformProduct({ product: 'Geothermal - sulfur' }).product)
      .toBe('Geothermal - sulfur (tons)');
  });

  it('should capitalize first letter and lowercase rest', () => {
    const record = { product: 'GAS (MCF)' };
    const result = transformProduct(record);
    expect(result.product).toBe('Gas (mcf)');
  });

  it('should handle null product', () => {
    const record = { product: null };
    const result = transformProduct(record);
    expect(result.product).toBeNull();
  });

  it('should handle empty product', () => {
    const record = { product: '' };
    const result = transformProduct(record);
    expect(result.product).toBe('');
  });
});

describe('extractCommodity', () => {
  it('should extract commodity before parentheses', () => {
    expect(extractCommodity('Gas (Mcf)')).toBe('Gas');
    expect(extractCommodity('Oil (bbl)')).toBe('Oil');
  });

  it('should extract commodity before dash', () => {
    expect(extractCommodity('Geothermal - Direct Use')).toBe('Geothermal');
  });

  it('should return full product if no special chars', () => {
    expect(extractCommodity('Salt')).toBe('Salt');
  });

  it('should handle empty product', () => {
    expect(extractCommodity('')).toBe('');
    expect(extractCommodity(null)).toBe('');
  });
});

describe('extractUnit', () => {
  it('should extract unit from parentheses', () => {
    expect(extractUnit('Gas (Mcf)')).toBe('Mcf');
    expect(extractUnit('Oil (bbl)')).toBe('bbl');
  });

  it('should truncate to 20 chars', () => {
    expect(extractUnit('Product (This is a very long unit name that exceeds twenty characters)')).toHaveLength(20);
  });

  it('should return empty for no unit', () => {
    expect(extractUnit('Salt')).toBe('');
    expect(extractUnit('')).toBe('');
  });
});

describe('extractUnitAbbr', () => {
  it('should extract unit abbreviation from parentheses', () => {
    expect(extractUnitAbbr('Gas (Mcf)')).toBe('Mcf');
    expect(extractUnitAbbr('Oil (bbl)')).toBe('bbl');
  });

  it('should truncate to 5 chars', () => {
    expect(extractUnitAbbr('Product (LongUnit)')).toBe('LongU');
  });

  it('should return empty for no unit', () => {
    expect(extractUnitAbbr('Salt')).toBe('');
  });
});
