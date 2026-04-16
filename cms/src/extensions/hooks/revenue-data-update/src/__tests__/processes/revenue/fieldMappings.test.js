import { describe, it, expect } from 'vitest';
import { REVENUE_FIELD_MAP } from '../../../processes/revenue/fieldMappings.js';

describe('REVENUE_FIELD_MAP', () => {
  it('should map all CSV headers to snake_case property names', () => {
    expect(REVENUE_FIELD_MAP['Accept Date']).toBe('accept_date');
    expect(REVENUE_FIELD_MAP['Land Class Code']).toBe('land_class_code');
    expect(REVENUE_FIELD_MAP['Land Category Code Desc']).toBe('land_category_code_desc');
    expect(REVENUE_FIELD_MAP['State']).toBe('state');
    expect(REVENUE_FIELD_MAP['County Code Desc']).toBe('county_code_desc');
    expect(REVENUE_FIELD_MAP['FIPS Code']).toBe('fips_code');
    expect(REVENUE_FIELD_MAP['Agency State Region Code Desc']).toBe('agency_state_region_code_desc');
    expect(REVENUE_FIELD_MAP['Revenue Type']).toBe('revenue_type');
    expect(REVENUE_FIELD_MAP['Mineral Production Code Desc']).toBe('mineral_production_code_desc');
    expect(REVENUE_FIELD_MAP['Commodity']).toBe('commodity');
    expect(REVENUE_FIELD_MAP['Product Code Desc']).toBe('product_code_desc');
    expect(REVENUE_FIELD_MAP['Revenue']).toBe('revenue');
  });

  it('should have exactly 12 field mappings', () => {
    expect(Object.keys(REVENUE_FIELD_MAP)).toHaveLength(12);
  });
});
