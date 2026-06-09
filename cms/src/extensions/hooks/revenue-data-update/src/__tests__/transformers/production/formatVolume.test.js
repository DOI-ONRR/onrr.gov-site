import { describe, it, expect } from 'vitest';
import { formatVolume } from '../../../transformers/production/formatVolume.js';

describe('formatVolume', () => {
  it('should convert accounting notation (123) to -123', () => {
    const record = { volume: '(123)' };
    const result = formatVolume(record);
    expect(result.volume).toBe('-123');
  });

  it('should convert accounting notation with decimals (123.45) to -123.45', () => {
    const record = { volume: '(123.45)' };
    const result = formatVolume(record);
    expect(result.volume).toBe('-123.45');
  });

  it('should leave positive numbers unchanged', () => {
    const record = { volume: '456' };
    const result = formatVolume(record);
    expect(result.volume).toBe('456');
  });

  it('should leave already negative numbers unchanged', () => {
    const record = { volume: '-789' };
    const result = formatVolume(record);
    expect(result.volume).toBe('-789');
  });

  it('should handle null volume', () => {
    const record = { volume: null };
    const result = formatVolume(record);
    expect(result.volume).toBeNull();
  });

  it('should handle undefined volume', () => {
    const record = {};
    const result = formatVolume(record);
    expect(result.volume).toBeUndefined();
  });

  it('should handle empty string volume', () => {
    const record = { volume: '' };
    const result = formatVolume(record);
    expect(result.volume).toBe('');
  });

  it('should preserve other record fields', () => {
    const record = { volume: '(100)', commodity: 'Oil', land_class: 'Federal' };
    const result = formatVolume(record);
    expect(result.commodity).toBe('Oil');
    expect(result.land_class).toBe('Federal');
  });
});
