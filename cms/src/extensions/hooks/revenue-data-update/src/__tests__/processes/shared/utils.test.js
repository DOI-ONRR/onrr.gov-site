import { describe, it, expect } from 'vitest';
import { mapHeader } from '../../../processes/shared/utils.js';

describe('mapHeader', () => {
  it('should return mapped value when header exists in map', () => {
    const fieldMap = { 'Calendar Year': 'calendar_year' };
    const result = mapHeader('Calendar Year', fieldMap);
    expect(result).toBe('calendar_year');
  });

  it('should return snake_case fallback for unmapped header', () => {
    const result = mapHeader('Unknown Header', {});
    expect(result).toBe('unknown_header');
  });

  it('should handle headers with multiple spaces', () => {
    const result = mapHeader('Some  Long  Header', {});
    expect(result).toBe('some_long_header');
  });

  it('should handle single word header', () => {
    const result = mapHeader('Name', {});
    expect(result).toBe('name');
  });

  it('should handle empty string header', () => {
    const result = mapHeader('', {});
    expect(result).toBe('');
  });

  it('should use exact match from map', () => {
    const customMap = { 'My Header': 'custom_field' };
    const result = mapHeader('My Header', customMap);
    expect(result).toBe('custom_field');
  });

  it('should be case-sensitive for map lookup', () => {
    const fieldMap = { 'Calendar Year': 'calendar_year' };
    const result = mapHeader('calendar year', fieldMap);
    // Should not match 'Calendar Year', so falls back to snake_case
    expect(result).toBe('calendar_year');
  });
});
