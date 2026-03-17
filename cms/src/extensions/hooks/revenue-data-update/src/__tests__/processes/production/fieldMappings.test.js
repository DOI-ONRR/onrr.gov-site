import { describe, it, expect } from 'vitest';
import { PRODUCTION_FIELD_MAP } from '../../../processes/production/fieldMappings.js';

describe('PRODUCTION_FIELD_MAP', () => {
  it('should map "Production Date" to "production_date"', () => {
    expect(PRODUCTION_FIELD_MAP['Production Date']).toBe('production_date');
  });

  it('should map "Land Class" to "land_class"', () => {
    expect(PRODUCTION_FIELD_MAP['Land Class']).toBe('land_class');
  });

  it('should map "Land Category" to "land_category"', () => {
    expect(PRODUCTION_FIELD_MAP['Land Category']).toBe('land_category');
  });

  it('should map "Commodity" to "commodity"', () => {
    expect(PRODUCTION_FIELD_MAP['Commodity']).toBe('commodity');
  });

  it('should map "Volume" to "volume"', () => {
    expect(PRODUCTION_FIELD_MAP['Volume']).toBe('volume');
  });

  it('should have exactly 5 mappings', () => {
    expect(Object.keys(PRODUCTION_FIELD_MAP)).toHaveLength(5);
  });
});
