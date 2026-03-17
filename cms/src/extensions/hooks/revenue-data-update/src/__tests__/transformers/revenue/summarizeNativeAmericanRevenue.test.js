import { describe, it, expect } from 'vitest';
import { summarizeNativeAmericanRevenue } from '../../../transformers/revenue/index.js';

describe('summarizeNativeAmericanRevenue', () => {
  it('should aggregate records with Indian land class', () => {
    const records = [
      {
        accept_date: '1/1/2026',
        land_class_code: 'Indian',
        land_category_code_desc: 'Onshore',
        state: 'OK',
        county_code_desc: 'Osage',
        fips_code: '40113',
        agency_state_region_code_desc: '',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '1000.00',
      },
      {
        accept_date: '1/1/2026',
        land_class_code: 'Indian',
        land_category_code_desc: 'Onshore',
        state: 'OK',
        county_code_desc: 'Creek',
        fips_code: '40037',
        agency_state_region_code_desc: '',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '500.00',
      },
    ];

    const result = summarizeNativeAmericanRevenue(records);

    expect(result).toHaveLength(1);
    expect(result[0].land_class_code).toBe('Native American');
    expect(result[0].state).toBe('Native American');
    expect(result[0].county_code_desc).toBe('');
    expect(result[0].fips_code).toBe('NA');
    expect(parseFloat(result[0].revenue)).toBe(1500);
  });

  it('should keep non-Indian records unchanged', () => {
    const records = [
      {
        accept_date: '1/1/2026',
        land_class_code: 'Federal',
        land_category_code_desc: 'Offshore',
        state: '',
        county_code_desc: '',
        fips_code: 'GMR',
        agency_state_region_code_desc: 'Gulf of America',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '2000.00',
      },
    ];

    const result = summarizeNativeAmericanRevenue(records);

    expect(result).toHaveLength(1);
    expect(result[0].land_class_code).toBe('Federal');
    expect(result[0].revenue).toBe('2000.00');
  });

  it('should aggregate records with "Mixed Exploratory" Indian land class', () => {
    const records = [
      {
        accept_date: '1/1/2026',
        land_class_code: 'Mixed Exploratory Indian',
        land_category_code_desc: 'Onshore',
        state: 'OK',
        county_code_desc: '',
        fips_code: '',
        agency_state_region_code_desc: '',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '300.00',
      },
    ];

    const result = summarizeNativeAmericanRevenue(records);

    expect(result).toHaveLength(1);
    expect(result[0].land_class_code).toBe('Native American');
  });

  it('should keep Indian and non-Indian records separate in aggregation', () => {
    const records = [
      {
        accept_date: '1/1/2026',
        land_class_code: 'Federal',
        land_category_code_desc: 'Offshore',
        state: '',
        county_code_desc: '',
        fips_code: 'GMR',
        agency_state_region_code_desc: 'Gulf of America',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '2000.00',
      },
      {
        accept_date: '1/1/2026',
        land_class_code: 'Indian',
        land_category_code_desc: 'Onshore',
        state: 'OK',
        county_code_desc: 'Osage',
        fips_code: '40113',
        agency_state_region_code_desc: '',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '1000.00',
      },
    ];

    const result = summarizeNativeAmericanRevenue(records);

    expect(result).toHaveLength(2);

    const federalRecord = result.find(r => r.land_class_code === 'Federal');
    const nativeAmericanRecord = result.find(r => r.land_class_code === 'Native American');

    expect(federalRecord).toBeDefined();
    expect(federalRecord.revenue).toBe('2000.00');

    expect(nativeAmericanRecord).toBeDefined();
    expect(parseFloat(nativeAmericanRecord.revenue)).toBe(1000);
  });

  it('should aggregate by key fields for Indian records', () => {
    const records = [
      {
        accept_date: '1/1/2026',
        land_class_code: 'Indian',
        land_category_code_desc: 'Onshore',
        state: 'OK',
        county_code_desc: '',
        fips_code: '',
        agency_state_region_code_desc: '',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '1000.00',
      },
      {
        accept_date: '1/1/2026',
        land_class_code: 'Indian',
        land_category_code_desc: 'Onshore',
        state: 'NM',
        county_code_desc: '',
        fips_code: '',
        agency_state_region_code_desc: '',
        revenue_type: 'Rents', // Different revenue type
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '500.00',
      },
    ];

    const result = summarizeNativeAmericanRevenue(records);

    // Should have 2 Native American records (different revenue types)
    const nativeAmericanRecords = result.filter(r => r.land_class_code === 'Native American');
    expect(nativeAmericanRecords).toHaveLength(2);
  });

  it('should return empty array for empty input', () => {
    const result = summarizeNativeAmericanRevenue([]);
    expect(result).toEqual([]);
  });
});
