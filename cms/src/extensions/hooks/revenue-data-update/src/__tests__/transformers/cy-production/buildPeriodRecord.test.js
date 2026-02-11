import { describe, it, expect } from 'vitest';
import { buildPeriodRecord } from '../../../transformers/cy-production/buildPeriodRecord.js';

describe('buildPeriodRecord', () => {
  it('should build a Calendar Year period record', () => {
    const record = { calendar_year: '2023' };
    const result = buildPeriodRecord(record);

    expect(result).toEqual({
      type: 'Calendar Year',
      calendar_year: 2023,
      fiscal_year: 2023,
      calendar_month: 0,
      month_long: '',
      month_short: '',
      fiscal_month: 0,
      period_date: '2023-01-01',
    });
  });

  it('should handle numeric calendar_year', () => {
    const record = { calendar_year: 2024 };
    const result = buildPeriodRecord(record);

    expect(result.calendar_year).toBe(2024);
    expect(result.period_date).toBe('2024-01-01');
  });

  it('should return null for empty calendar_year', () => {
    const record = { calendar_year: '' };
    const result = buildPeriodRecord(record);
    expect(result).toBeNull();
  });

  it('should return null for null calendar_year', () => {
    const record = { calendar_year: null };
    const result = buildPeriodRecord(record);
    expect(result).toBeNull();
  });

  it('should return null for invalid calendar_year', () => {
    const record = { calendar_year: 'invalid' };
    const result = buildPeriodRecord(record);
    expect(result).toBeNull();
  });
});
