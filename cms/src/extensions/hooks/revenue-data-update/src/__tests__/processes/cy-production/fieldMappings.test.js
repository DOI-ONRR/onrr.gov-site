import { describe, it, expect } from 'vitest';
import { CY_PRODUCTION_FIELD_MAP } from '../../../processes/cy-production/fieldMappings.js';

describe('CY_PRODUCTION_FIELD_MAP', () => {
  it('should map all CSV headers to snake_case property names', () => {
    expect(CY_PRODUCTION_FIELD_MAP['Calendar Year']).toBe('calendar_year');
    expect(CY_PRODUCTION_FIELD_MAP['Land Class']).toBe('land_class');
    expect(CY_PRODUCTION_FIELD_MAP['Land Category']).toBe('land_category');
    expect(CY_PRODUCTION_FIELD_MAP['State']).toBe('state');
    expect(CY_PRODUCTION_FIELD_MAP['County']).toBe('county');
    expect(CY_PRODUCTION_FIELD_MAP['FIPS Code']).toBe('fips_code');
    expect(CY_PRODUCTION_FIELD_MAP['Offshore Region']).toBe('offshore_region');
    expect(CY_PRODUCTION_FIELD_MAP['Product']).toBe('product');
    expect(CY_PRODUCTION_FIELD_MAP['Volume']).toBe('volume');
  });

  it('should have exactly 9 field mappings', () => {
    expect(Object.keys(CY_PRODUCTION_FIELD_MAP)).toHaveLength(9);
  });
});
