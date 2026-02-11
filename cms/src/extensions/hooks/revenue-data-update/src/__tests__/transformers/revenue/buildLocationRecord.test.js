import { describe, it, expect } from 'vitest';
import { buildLocationRecord } from '../../../transformers/revenue/buildLocationRecord.js';

describe('buildLocationRecord', () => {
  it('should build location record from revenue record', () => {
    const record = {
      land_class_code: 'Federal',
      land_category_code_desc: 'Offshore',
      state: 'TX',
      county_code_desc: 'Harris',
      fips_code: '48201',
      agency_state_region_code_desc: 'Gulf of America',
    };
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: 'Federal',
      land_category: 'Offshore',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
      offshore_region: 'Gulf of America',
    });
  });

  it('should replace null values with empty strings', () => {
    const record = {
      land_class_code: null,
      land_category_code_desc: null,
      state: null,
      county_code_desc: null,
      fips_code: null,
      agency_state_region_code_desc: null,
    };
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: '',
      land_category: '',
      state: '',
      county: '',
      fips_code: '',
      offshore_region: '',
    });
  });

  it('should replace undefined values with empty strings', () => {
    const record = {};
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: '',
      land_category: '',
      state: '',
      county: '',
      fips_code: '',
      offshore_region: '',
    });
  });

  it('should preserve empty string values', () => {
    const record = {
      land_class_code: '',
      land_category_code_desc: '',
      state: '',
      county_code_desc: '',
      fips_code: '',
      agency_state_region_code_desc: '',
    };
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: '',
      land_category: '',
      state: '',
      county: '',
      fips_code: '',
      offshore_region: '',
    });
  });
});
