import { describe, it, expect } from 'vitest';
import { parseRevenueAmount } from '../../../transformers/revenue/parseRevenueAmount.js';

describe('parseRevenueAmount', () => {
  it('parses a plain numeric string', () => {
    expect(parseRevenueAmount('8722.00')).toBe(8722);
    expect(parseRevenueAmount('8722')).toBe(8722);
    expect(parseRevenueAmount('0.25')).toBe(0.25);
  });

  it('tolerates grouping commas and surrounding whitespace', () => {
    expect(parseRevenueAmount('8,722.00')).toBe(8722);
    expect(parseRevenueAmount('1,234,567')).toBe(1234567);
    expect(parseRevenueAmount('  8,722.00  ')).toBe(8722);
  });

  it('handles negative amounts', () => {
    expect(parseRevenueAmount('-8,722.00')).toBe(-8722);
    expect(parseRevenueAmount('-5')).toBe(-5);
  });

  it('treats a blank value as 0', () => {
    expect(parseRevenueAmount('')).toBe(0);
    expect(parseRevenueAmount('   ')).toBe(0);
    expect(parseRevenueAmount(null)).toBe(0);
    expect(parseRevenueAmount(undefined)).toBe(0);
  });

  it('accepts a number passed through', () => {
    expect(parseRevenueAmount(8722)).toBe(8722);
  });

  it('rejects a currency-formatted amount', () => {
    expect(() => parseRevenueAmount('$8,722.00')).toThrow(/Invalid revenue amount "\$8,722\.00"/);
    expect(() => parseRevenueAmount('$8722')).toThrow(/must be numeric/);
  });

  it('rejects other non-numeric text', () => {
    expect(() => parseRevenueAmount('N/A')).toThrow(/Invalid revenue amount/);
    expect(() => parseRevenueAmount('8722 USD')).toThrow(/Invalid revenue amount/);
    expect(() => parseRevenueAmount('1.2.3')).toThrow(/Invalid revenue amount/);
    expect(() => parseRevenueAmount('(8722)')).toThrow(/Invalid revenue amount/);
  });
});
