import { describe, it, expect } from 'vitest';
import { transformProductCodeDesc } from '../../../transformers/revenue/transformProductCodeDesc.js';

describe('transformProductCodeDesc', () => {
  it('should transform Geothermal - Direct Utilization, Hundreds of Gallons', () => {
    const record = { product_code_desc: 'Geothermal - Direct Utilization, Hundreds of Gallons' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Direct Use (Hundreds of Gallons)');
  });

  it('should transform Geothermal - Direct Utilization, Millions of BTUs', () => {
    const record = { product_code_desc: 'Geothermal - Direct Utilization, Millions of BTUs' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Direct Use (Millions of BTUs)');
  });

  it('should transform Geothermal - Direct Use, Millions of Gallons', () => {
    const record = { product_code_desc: 'Geothermal - Direct Use, Millions of Gallons' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Direct Use (Millions of Gallons)');
  });

  it('should transform Geothermal - Electrical Generation, Kilowatt Hours', () => {
    const record = { product_code_desc: 'Geothermal - Electrical Generation, Kilowatt Hours' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Electrical Generation (Kilowatt Hours)');
  });

  it('should transform Geothermal - Direct Utilization, Other', () => {
    const record = { product_code_desc: 'Geothermal - Direct Utilization, Other' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Direct Utilization - Other');
  });

  it('should transform Geothermal - Electrical Generation, Other', () => {
    const record = { product_code_desc: 'Geothermal - Electrical Generation, Other' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Electrical Generation (Other)');
  });

  it('should transform Geothermal - Electrical Generation, Thousands of Pounds', () => {
    const record = { product_code_desc: 'Geothermal - Electrical Generation, Thousands of Pounds' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Electrical Generation (Thousands of Pounds)');
  });

  it('should transform Geothermal - sulfur', () => {
    const record = { product_code_desc: 'Geothermal - sulfur' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Geothermal - Sulfur (tons)');
  });

  it('should preserve other product descriptions', () => {
    const record = { product_code_desc: 'Oil' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('Oil');
  });

  it('should return record unchanged when product is empty', () => {
    const record = { product_code_desc: '' };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBe('');
  });

  it('should return record unchanged when product is null', () => {
    const record = { product_code_desc: null };
    const result = transformProductCodeDesc(record);
    expect(result.product_code_desc).toBeNull();
  });

  it('should not mutate the original record', () => {
    const record = { product_code_desc: 'Geothermal - sulfur' };
    const result = transformProductCodeDesc(record);

    expect(record.product_code_desc).toBe('Geothermal - sulfur');
    expect(result.product_code_desc).toBe('Geothermal - Sulfur (tons)');
  });
});
