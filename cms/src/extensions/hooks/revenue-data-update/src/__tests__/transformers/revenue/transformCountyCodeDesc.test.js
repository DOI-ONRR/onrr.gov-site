import { describe, it, expect } from 'vitest';
import { transformCountyCodeDesc } from '../../../transformers/revenue/transformCountyCodeDesc.js';

describe('transformCountyCodeDesc', () => {
  it('should fix Santa Barbar typo', () => {
    const record = { county_code_desc: 'Santa Barbar' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Santa Barbara');
  });

  it('should fix Pt. Coupee typo', () => {
    const record = { county_code_desc: 'Pt. Coupee' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Pointe Coupee');
  });

  it('should fix Point Coupee typo', () => {
    const record = { county_code_desc: 'Point Coupee' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Pointe Coupee');
  });

  it('should fix E Baton Rouge typo', () => {
    const record = { county_code_desc: 'E Baton Rouge' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('East Baton Rouge');
  });

  it('should fix Grand Trvse typo', () => {
    const record = { county_code_desc: 'Grand Trvse' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Grand Traverse');
  });

  it('should fix Jeffer Davis typo', () => {
    const record = { county_code_desc: 'Jeffer Davis' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Jefferson Davis');
  });

  it('should fix San Augustin typo', () => {
    const record = { county_code_desc: 'San Augustin' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('San Augustine');
  });

  it('should fix San Pete typo', () => {
    const record = { county_code_desc: 'San Pete' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Sanpete');
  });

  it('should fix St Charles typo', () => {
    const record = { county_code_desc: 'St Charles' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('St. Charles');
  });

  it('should fix St Clair typo', () => {
    const record = { county_code_desc: 'St Clair' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('St. Clair');
  });

  it('should fix St Martin typo', () => {
    const record = { county_code_desc: 'St Martin' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('St. Martin');
  });

  it('should fix St Mary typo', () => {
    const record = { county_code_desc: 'St Mary' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('St. Mary');
  });

  it('should fix Golden Valle with FIPS 38033', () => {
    const record = { county_code_desc: 'Golden Valle', fips_code: '38033' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Golden Valley');
  });

  it('should fix Golden Vally with FIPS 30037', () => {
    const record = { county_code_desc: 'Golden Vally', fips_code: '30037' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Golden Valley');
  });

  it('should not fix Golden Valle with different FIPS', () => {
    const record = { county_code_desc: 'Golden Valle', fips_code: '12345' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Golden Valle');
  });

  it('should preserve correct county names', () => {
    const record = { county_code_desc: 'Harris' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('Harris');
  });

  it('should return record unchanged when county is empty', () => {
    const record = { county_code_desc: '' };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBe('');
  });

  it('should return record unchanged when county is null', () => {
    const record = { county_code_desc: null };
    const result = transformCountyCodeDesc(record);
    expect(result.county_code_desc).toBeNull();
  });

  it('should not mutate the original record', () => {
    const record = { county_code_desc: 'Santa Barbar' };
    const result = transformCountyCodeDesc(record);

    expect(record.county_code_desc).toBe('Santa Barbar');
    expect(result.county_code_desc).toBe('Santa Barbara');
  });
});
