import { describe, it, expect } from 'vitest';
import { transformRevenueType } from '../../../transformers/revenue/transformRevenueType.js';

describe('transformRevenueType', () => {
  it('should transform empty string to Other revenues', () => {
    const record = { revenue_type: '' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Other revenues');
  });

  it('should transform null to Other revenues', () => {
    const record = { revenue_type: null };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Other revenues');
  });

  it('should transform undefined to Other revenues', () => {
    const record = { revenue_type: undefined };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Other revenues');
  });

  it('should transform Civil Penalty to Civil penalties', () => {
    const record = { revenue_type: 'Civil Penalty' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Civil penalties');
  });

  it('should capitalize first letter and lowercase rest', () => {
    const record = { revenue_type: 'ROYALTIES' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Royalties');
  });

  it('should handle mixed case', () => {
    const record = { revenue_type: 'Other Revenues' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Other revenues');
  });

  it('should handle already correct case', () => {
    const record = { revenue_type: 'Royalties' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Royalties');
  });

  it('should transform Rents', () => {
    const record = { revenue_type: 'Rents' };
    const result = transformRevenueType(record);
    expect(result.revenue_type).toBe('Rents');
  });

  it('should not mutate the original record', () => {
    const record = { revenue_type: 'Civil Penalty' };
    const result = transformRevenueType(record);

    expect(record.revenue_type).toBe('Civil Penalty');
    expect(result.revenue_type).toBe('Civil penalties');
  });
});
