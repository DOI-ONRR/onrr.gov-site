import { describe, it, expect } from 'vitest';
import { sanitizeNulls } from '../../../transformers/revenue/sanitizeNulls.js';

describe('sanitizeNulls', () => {
  it('should replace null values with empty strings', () => {
    const record = {
      land_class_code: null,
      land_category_code_desc: null,
      state: null,
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
      revenue_type: null,
      mineral_production_code_desc: null,
      product_code_desc: null,
      commodity: 'Oil',
    };
    const result = sanitizeNulls(record);

    expect(result.land_class_code).toBe('');
    expect(result.land_category_code_desc).toBe('');
    expect(result.state).toBe('');
    expect(result.county_code_desc).toBe('');
    expect(result.fips_code).toBe('');
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.revenue_type).toBe('');
    expect(result.mineral_production_code_desc).toBe('');
    expect(result.product_code_desc).toBe('');
    expect(result.commodity).toBe('Oil');
  });

  it('should set commodity to "Not tied to a commodity" when empty', () => {
    const record = {
      commodity: '',
    };
    const result = sanitizeNulls(record);
    expect(result.commodity).toBe('Not tied to a commodity');
  });

  it('should set commodity to "Not tied to a commodity" when null', () => {
    const record = {
      commodity: null,
    };
    const result = sanitizeNulls(record);
    expect(result.commodity).toBe('Not tied to a commodity');
  });

  it('should preserve existing commodity value', () => {
    const record = {
      commodity: 'Gas',
    };
    const result = sanitizeNulls(record);
    expect(result.commodity).toBe('Gas');
  });

  it('should preserve existing string values', () => {
    const record = {
      land_class_code: 'Federal',
      state: 'TX',
      county_code_desc: 'Harris',
      commodity: 'Oil',
    };
    const result = sanitizeNulls(record);

    expect(result.land_class_code).toBe('Federal');
    expect(result.state).toBe('TX');
    expect(result.county_code_desc).toBe('Harris');
    expect(result.commodity).toBe('Oil');
  });

  it('should not mutate the original record', () => {
    const record = { land_class_code: null, commodity: 'Oil' };
    const result = sanitizeNulls(record);

    expect(record.land_class_code).toBeNull();
    expect(result.land_class_code).toBe('');
  });
});
