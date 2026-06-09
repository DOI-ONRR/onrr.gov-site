import { describe, it, expect } from 'vitest';
import { ignoreEmptyProductionCY } from '../../../transformers/cy-production/ignoreEmptyProductionCY.js';

describe('ignoreEmptyProductionCY', () => {
  it('should return null when all fields are null', () => {
    const record = {
      calendar_year: null,
      land_class: null,
      land_category: null,
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
      product: null,
      volume: null,
    };
    expect(ignoreEmptyProductionCY(record)).toBeNull();
  });

  it('should return null when all fields are empty strings', () => {
    const record = {
      calendar_year: '',
      land_class: '',
      land_category: '',
      state: '',
      county: '',
      fips_code: '',
      offshore_region: '',
      product: '',
      volume: '',
    };
    expect(ignoreEmptyProductionCY(record)).toBeNull();
  });

  it('should return the record when calendar_year has a value', () => {
    const record = {
      calendar_year: '2023',
      land_class: null,
      land_category: null,
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
      product: null,
      volume: null,
    };
    expect(ignoreEmptyProductionCY(record)).toBe(record);
  });

  it('should return the record when volume has a value', () => {
    const record = {
      calendar_year: null,
      land_class: null,
      land_category: null,
      state: null,
      county: null,
      fips_code: null,
      offshore_region: null,
      product: null,
      volume: '1000',
    };
    expect(ignoreEmptyProductionCY(record)).toBe(record);
  });

  it('should return the record when any field has a value', () => {
    const record = {
      calendar_year: null,
      land_class: null,
      land_category: null,
      state: 'TX',
      county: null,
      fips_code: null,
      offshore_region: null,
      product: null,
      volume: null,
    };
    expect(ignoreEmptyProductionCY(record)).toBe(record);
  });
});
