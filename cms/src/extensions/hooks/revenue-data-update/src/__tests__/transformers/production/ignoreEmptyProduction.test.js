import { describe, it, expect } from 'vitest';
import { ignoreEmptyProduction } from '../../../transformers/production/ignoreEmptyProduction.js';

describe('ignoreEmptyProduction', () => {
  it('should return null when all key fields are null', () => {
    const record = {
      period_date: null,
      land_class: null,
      land_category: null,
      commodity: null,
      volume: null,
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toBeNull();
  });

  it('should return null when all key fields are undefined', () => {
    const record = {};
    const result = ignoreEmptyProduction(record);
    expect(result).toBeNull();
  });

  it('should return null when all key fields are empty strings', () => {
    const record = {
      period_date: '',
      land_class: '',
      land_category: '',
      commodity: '',
      volume: '',
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toBeNull();
  });

  it('should return record when period_date has value', () => {
    const record = {
      period_date: '2024-01-01',
      land_class: null,
      land_category: null,
      commodity: null,
      volume: null,
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should return record when land_class has value', () => {
    const record = {
      period_date: null,
      land_class: 'Federal',
      land_category: null,
      commodity: null,
      volume: null,
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should return record when land_category has value', () => {
    const record = {
      period_date: null,
      land_class: null,
      land_category: 'Onshore',
      commodity: null,
      volume: null,
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should return record when commodity has value', () => {
    const record = {
      period_date: null,
      land_class: null,
      land_category: null,
      commodity: 'Oil',
      volume: null,
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should return record when volume has value', () => {
    const record = {
      period_date: null,
      land_class: null,
      land_category: null,
      commodity: null,
      volume: '1000',
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should return record when all fields have values', () => {
    const record = {
      period_date: '2024-01-01',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil',
      volume: '1000',
    };
    const result = ignoreEmptyProduction(record);
    expect(result).toEqual(record);
  });

  it('should preserve non-key fields in returned record', () => {
    const record = {
      period_date: '2024-01-01',
      land_class: null,
      land_category: null,
      commodity: null,
      volume: null,
      other_field: 'value',
    };
    const result = ignoreEmptyProduction(record);
    expect(result.other_field).toBe('value');
  });
});
