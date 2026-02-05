import { describe, it, expect } from 'vitest';
import { transformCounty } from '../../../transformers/disbursement/transformCounty.js';

describe('transformCounty', () => {
  it('should return empty string when county is null', () => {
    const record = { county: null };
    const result = transformCounty(record);
    expect(result.county).toBe('');
  });

  it('should return empty string when county is undefined', () => {
    const record = {};
    const result = transformCounty(record);
    expect(result.county).toBe('');
  });

  it('should fix "Hidalgo Caounty" typo', () => {
    const record = { county: 'Hidalgo Caounty' };
    const result = transformCounty(record);
    expect(result.county).toBe('Hidalgo');
  });

  it('should remove " County" suffix (case-insensitive)', () => {
    const record = { county: 'Harris County' };
    const result = transformCounty(record);
    expect(result.county).toBe('Harris');
  });

  it('should remove " county" suffix (lowercase)', () => {
    const record = { county: 'Harris county' };
    const result = transformCounty(record);
    expect(result.county).toBe('Harris');
  });

  it('should remove " Parish" suffix', () => {
    const record = { county: 'Orleans Parish' };
    const result = transformCounty(record);
    expect(result.county).toBe('Orleans');
  });

  it('should remove " Borough" suffix', () => {
    const record = { county: 'Anchorage Borough' };
    const result = transformCounty(record);
    expect(result.county).toBe('Anchorage');
  });

  it('should remove " Paris" partial match', () => {
    const record = { county: 'Test Paris' };
    const result = transformCounty(record);
    expect(result.county).toBe('Test');
  });

  it('should preserve county names without suffixes', () => {
    const record = { county: 'Harris' };
    const result = transformCounty(record);
    expect(result.county).toBe('Harris');
  });

  it('should handle empty string', () => {
    const record = { county: '' };
    const result = transformCounty(record);
    expect(result.county).toBe('');
  });

  it('should preserve other record fields', () => {
    const record = {
      county: 'Harris County',
      state: 'TX',
      fund_type: 'State'
    };
    const result = transformCounty(record);
    expect(result.state).toBe('TX');
    expect(result.fund_type).toBe('State');
  });
});
