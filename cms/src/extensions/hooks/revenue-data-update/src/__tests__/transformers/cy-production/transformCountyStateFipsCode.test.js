import { describe, it, expect } from 'vitest';
import { transformCountyStateFipsCode } from '../../../transformers/cy-production/transformCountyStateFipsCode.js';

describe('transformCountyStateFipsCode', () => {
  it('should remove County suffix', () => {
    const record = {
      county: 'Harris County',
      state: 'TX',
      fips_code: '48201',
      land_category: 'Onshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.county).toBe('Harris');
  });

  it('should remove Parish suffix', () => {
    const record = {
      county: 'St. Martin Parish',
      state: 'LA',
      fips_code: '22099',
      land_category: 'Onshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.county).toBe('St. Martin');
  });

  it('should remove Borough suffix', () => {
    const record = {
      county: 'Kenai Borough',
      state: 'AK',
      fips_code: '02122',
      land_category: 'Onshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.county).toBe('Kenai');
  });

  it('should handle LA offshore special case', () => {
    const record = {
      county: 'Some County',
      state: 'LA',
      fips_code: '22001',
      land_category: 'Offshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.state).toBe('');
    expect(result.county).toBe('');
    expect(result.fips_code).toBe('GMR');
    expect(result.offshore_region).toBe('Gulf of Mexico');
  });

  it('should fix Santa Barbar typo', () => {
    const record = {
      county: 'Santa Barbar',
      state: 'CA',
      fips_code: '06083',
      land_category: 'Onshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.county).toBe('Santa Barbara');
  });

  it('should left-pad FIPS code when county is present', () => {
    const record = {
      county: 'Harris',
      state: 'TX',
      fips_code: '201',
      land_category: 'Onshore',
      offshore_region: '',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.fips_code).toBe('00201');
  });

  it('should not pad FIPS code when county is empty', () => {
    const record = {
      county: '',
      state: 'TX',
      fips_code: 'GMR',
      land_category: 'Offshore',
      offshore_region: 'Gulf of America',
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.fips_code).toBe('GMR');
  });

  it('should handle null values', () => {
    const record = {
      county: null,
      state: null,
      fips_code: null,
      land_category: 'Onshore',
      offshore_region: null,
    };
    const result = transformCountyStateFipsCode(record);
    expect(result.county).toBe('');
    expect(result.state).toBe('');
    expect(result.fips_code).toBe('');
  });
});
