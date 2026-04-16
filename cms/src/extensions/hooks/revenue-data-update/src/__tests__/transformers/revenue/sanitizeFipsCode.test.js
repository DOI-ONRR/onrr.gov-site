import { describe, it, expect } from 'vitest';
import { sanitizeFipsCode } from '../../../transformers/revenue/sanitizeFipsCode.js';

describe('sanitizeFipsCode', () => {
  it('should left-pad FIPS code to 5 digits when county is present', () => {
    const record = {
      county_code_desc: 'Harris',
      fips_code: '123',
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('00123');
  });

  it('should not modify FIPS code when already 5 digits', () => {
    const record = {
      county_code_desc: 'Harris',
      fips_code: '48201',
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('48201');
  });

  it('should not modify FIPS code when county is empty', () => {
    const record = {
      county_code_desc: '',
      fips_code: '123',
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('123');
  });

  it('should not modify FIPS code when county is null', () => {
    const record = {
      county_code_desc: null,
      fips_code: '123',
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('123');
  });

  it('should handle empty FIPS code with county present', () => {
    const record = {
      county_code_desc: 'Harris',
      fips_code: '',
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('00000');
  });

  it('should handle null FIPS code with county present', () => {
    const record = {
      county_code_desc: 'Harris',
      fips_code: null,
    };
    const result = sanitizeFipsCode(record);
    expect(result.fips_code).toBe('00000');
  });

  it('should not mutate the original record', () => {
    const record = { county_code_desc: 'Harris', fips_code: '123' };
    const result = sanitizeFipsCode(record);

    expect(record.fips_code).toBe('123');
    expect(result.fips_code).toBe('00123');
  });
});
