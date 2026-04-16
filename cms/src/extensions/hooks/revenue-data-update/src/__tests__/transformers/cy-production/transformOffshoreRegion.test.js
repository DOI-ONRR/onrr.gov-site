import { describe, it, expect } from 'vitest';
import { transformOffshoreRegion } from '../../../transformers/cy-production/transformOffshoreRegion.js';

describe('transformOffshoreRegion', () => {
  it('should transform Offshore Alaska', () => {
    const record = {
      offshore_region: 'Offshore Alaska',
      fips_code: '',
      county: 'SomeCounty',
      state: 'AK',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('Alaska');
    expect(result.fips_code).toBe('AKR');
    expect(result.county).toBe('');
    expect(result.state).toBe('');
  });

  it('should transform Offshore Pacific', () => {
    const record = {
      offshore_region: 'Offshore Pacific',
      fips_code: '',
      county: '',
      state: '',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('Pacific');
    expect(result.fips_code).toBe('POR');
  });

  it('should transform Offshore Atlantic', () => {
    const record = {
      offshore_region: 'Offshore Atlantic',
      fips_code: '',
      county: '',
      state: '',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('Atlantic');
    expect(result.fips_code).toBe('AOR');
  });

  it('should transform Offshore Gulf of America', () => {
    const record = {
      offshore_region: 'Offshore Gulf of America',
      fips_code: '',
      county: '',
      state: '',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('Gulf of America');
    expect(result.fips_code).toBe('GMR');
  });

  it('should preserve unknown offshore regions', () => {
    const record = {
      offshore_region: 'Unknown Region',
      fips_code: '12345',
      county: 'Harris',
      state: 'TX',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('Unknown Region');
    expect(result.fips_code).toBe('12345');
    expect(result.county).toBe('Harris');
    expect(result.state).toBe('TX');
  });

  it('should handle empty offshore region', () => {
    const record = {
      offshore_region: '',
      fips_code: '48201',
      county: 'Harris',
      state: 'TX',
    };
    const result = transformOffshoreRegion(record);
    expect(result.offshore_region).toBe('');
    expect(result.fips_code).toBe('48201');
  });
});
