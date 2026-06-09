import { describe, it, expect } from 'vitest';
import { buildLocationRecord } from '../../../transformers/cy-production/buildLocationRecord.js';

describe('buildLocationRecord', () => {
  it('should build location record from production record', () => {
    const record = {
      land_class: 'Federal',
      land_category: 'Offshore',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
      offshore_region: 'Gulf of America',
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

  it('should use null for nullable fields when values are empty', () => {
    const record = {
      land_class: 'Federal',
      land_category: 'Onshore',
      state: '',
      county: '',
      fips_code: '',
      offshore_region: '',
    };
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: 'Federal',
      land_category: 'Onshore',
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
    });
  });

  it('should handle null values', () => {
    const record = {
      land_class: null,
      land_category: null,
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
    };
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: '',
      land_category: '',
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
    });
  });

  it('should handle undefined values', () => {
    const record = {};
    const result = buildLocationRecord(record);

    expect(result).toEqual({
      land_class: '',
      land_category: '',
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
    });
  });
});
