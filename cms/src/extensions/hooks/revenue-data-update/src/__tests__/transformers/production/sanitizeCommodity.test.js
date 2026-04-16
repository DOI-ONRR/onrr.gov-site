import { describe, it, expect } from 'vitest';
import { sanitizeCommodity } from '../../../transformers/production/sanitizeCommodity.js';

describe('sanitizeCommodity', () => {
  it('should replace (ton) with (tons) for Coal commodities', () => {
    const record = { commodity: 'Coal (ton)' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('Coal (tons)');
  });

  it('should replace (ton) with (tons) for Coal-Bituminous', () => {
    const record = { commodity: 'Coal-Bituminous (ton)' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('Coal-Bituminous (tons)');
  });

  it('should not modify commodities that already have (tons)', () => {
    const record = { commodity: 'Coal (tons)' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('Coal (tons)');
  });

  it('should not modify non-Coal commodities', () => {
    const record = { commodity: 'Oil (bbl)' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('Oil (bbl)');
  });

  it('should not modify Gas commodities with (ton)', () => {
    const record = { commodity: 'Gas (ton)' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('Gas (ton)');
  });

  it('should handle null commodity', () => {
    const record = { commodity: null };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBeNull();
  });

  it('should handle undefined commodity', () => {
    const record = {};
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBeUndefined();
  });

  it('should handle empty string commodity', () => {
    const record = { commodity: '' };
    const result = sanitizeCommodity(record);
    expect(result.commodity).toBe('');
  });

  it('should preserve other record fields', () => {
    const record = { commodity: 'Coal (ton)', volume: '1000', land_class: 'Federal' };
    const result = sanitizeCommodity(record);
    expect(result.volume).toBe('1000');
    expect(result.land_class).toBe('Federal');
  });

  it('should be case-sensitive for Coal prefix', () => {
    const record = { commodity: 'coal (ton)' };
    const result = sanitizeCommodity(record);
    // Should not modify because it doesn't start with "Coal"
    expect(result.commodity).toBe('coal (ton)');
  });
});
