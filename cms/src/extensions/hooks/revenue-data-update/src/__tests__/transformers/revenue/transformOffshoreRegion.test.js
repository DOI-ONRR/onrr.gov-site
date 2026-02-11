import { describe, it, expect } from 'vitest';
import { transformOffshoreRegion } from '../../../transformers/revenue/transformOffshoreRegion.js';

describe('transformOffshoreRegion', () => {
  it('should transform ALASKA OCS to Alaska with FIPS AKR', () => {
    const record = { agency_state_region_code_desc: 'ALASKA OCS', fips_code: '' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('Alaska');
    expect(result.fips_code).toBe('AKR');
  });

  it('should transform PACIFIC OCS to Pacific with FIPS POR', () => {
    const record = { agency_state_region_code_desc: 'PACIFIC OCS', fips_code: '' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('Pacific');
    expect(result.fips_code).toBe('POR');
  });

  it('should transform ATLANTIC OCS to Atlantic with FIPS AOR', () => {
    const record = { agency_state_region_code_desc: 'ATLANTIC OCS', fips_code: '' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('Atlantic');
    expect(result.fips_code).toBe('AOR');
  });

  it('should transform GULF OF MEXICO to Gulf of America with FIPS GMR', () => {
    const record = { agency_state_region_code_desc: 'GULF OF MEXICO', fips_code: '' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('Gulf of America');
    expect(result.fips_code).toBe('GMR');
  });

  it('should transform GULF OF AMERICA to Gulf of America with FIPS GMR', () => {
    const record = { agency_state_region_code_desc: 'GULF OF AMERICA', fips_code: '' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('Gulf of America');
    expect(result.fips_code).toBe('GMR');
  });

  it('should clear NEW MEXICO region', () => {
    const record = { agency_state_region_code_desc: 'NEW MEXICO', fips_code: '12345' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.fips_code).toBe('12345');
  });

  it('should clear EAST STATES region', () => {
    const record = { agency_state_region_code_desc: 'EAST STATES', fips_code: '12345' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.fips_code).toBe('12345');
  });

  it('should clear region for Onshore land category', () => {
    const record = {
      agency_state_region_code_desc: 'SOME REGION',
      land_category_code_desc: 'Onshore',
      fips_code: '12345',
    };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.fips_code).toBe('12345');
  });

  it('should clear region for Not Tied to a Lease land category', () => {
    const record = {
      agency_state_region_code_desc: 'SOME REGION',
      land_category_code_desc: 'Not Tied to a Lease',
      fips_code: '12345',
    };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.fips_code).toBe('12345');
  });

  it('should preserve unknown region for Offshore land category', () => {
    const record = {
      agency_state_region_code_desc: 'UNKNOWN REGION',
      land_category_code_desc: 'Offshore',
      fips_code: '12345',
    };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('UNKNOWN REGION');
    expect(result.fips_code).toBe('12345');
  });

  it('should handle empty offshore region', () => {
    const record = { agency_state_region_code_desc: '', fips_code: '12345' };
    const result = transformOffshoreRegion(record);
    expect(result.agency_state_region_code_desc).toBe('');
    expect(result.fips_code).toBe('12345');
  });

  it('should not mutate the original record', () => {
    const record = { agency_state_region_code_desc: 'ALASKA OCS', fips_code: '' };
    const result = transformOffshoreRegion(record);

    expect(record.agency_state_region_code_desc).toBe('ALASKA OCS');
    expect(result.agency_state_region_code_desc).toBe('Alaska');
  });
});
