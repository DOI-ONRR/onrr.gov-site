import { describe, it, expect } from 'vitest';
import { ignoreEmptyRevenue } from '../../../transformers/revenue/ignoreEmptyRevenue.js';

describe('ignoreEmptyRevenue', () => {
  it('should return null when all fields are null', () => {
    const record = {
      accept_date: null,
      land_class_code: null,
      land_category_code_desc: null,
      state: null,
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
      revenue_type: null,
      mineral_production_code_desc: null,
      commodity: null,
      product_code_desc: null,
      revenue: null,
    };
    expect(ignoreEmptyRevenue(record)).toBeNull();
  });

  it('should return null when all fields are empty strings', () => {
    const record = {
      accept_date: '',
      land_class_code: '',
      land_category_code_desc: '',
      state: '',
      county_code_desc: '',
      fips_code: '',
      agency_state_region_code_desc: '',
      revenue_type: '',
      mineral_production_code_desc: '',
      commodity: '',
      product_code_desc: '',
      revenue: '',
    };
    expect(ignoreEmptyRevenue(record)).toBeNull();
  });

  it('should return null when all fields are undefined', () => {
    const record = {
      accept_date: undefined,
      land_class_code: undefined,
      land_category_code_desc: undefined,
      state: undefined,
      county_code_desc: undefined,
      fips_code: undefined,
      agency_state_region_code_desc: undefined,
      revenue_type: undefined,
      mineral_production_code_desc: undefined,
      commodity: undefined,
      product_code_desc: undefined,
      revenue: undefined,
    };
    expect(ignoreEmptyRevenue(record)).toBeNull();
  });

  it('should return the record when accept_date has a value', () => {
    const record = {
      accept_date: '1/1/2026',
      land_class_code: null,
      land_category_code_desc: null,
      state: null,
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
      revenue_type: null,
      mineral_production_code_desc: null,
      commodity: null,
      product_code_desc: null,
      revenue: null,
    };
    expect(ignoreEmptyRevenue(record)).toBe(record);
  });

  it('should return the record when revenue has a value', () => {
    const record = {
      accept_date: null,
      land_class_code: null,
      land_category_code_desc: null,
      state: null,
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
      revenue_type: null,
      mineral_production_code_desc: null,
      commodity: null,
      product_code_desc: null,
      revenue: '1000.00',
    };
    expect(ignoreEmptyRevenue(record)).toBe(record);
  });

  it('should return the record when any field has a value', () => {
    const record = {
      accept_date: null,
      land_class_code: null,
      land_category_code_desc: null,
      state: 'TX',
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
      revenue_type: null,
      mineral_production_code_desc: null,
      commodity: null,
      product_code_desc: null,
      revenue: null,
    };
    expect(ignoreEmptyRevenue(record)).toBe(record);
  });
});
