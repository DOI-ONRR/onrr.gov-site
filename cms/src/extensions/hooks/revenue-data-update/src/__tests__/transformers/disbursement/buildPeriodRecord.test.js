import { describe, it, expect } from 'vitest';
import { buildPeriodRecord } from '../../../transformers/disbursement/buildPeriodRecord.js';

describe('buildPeriodRecord', () => {
  it('should build a period record for January', () => {
    const record = { month: 'January', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.type).toBe('Monthly');
    expect(result.calendar_year).toBe(2024);
    expect(result.calendar_month).toBe(1);
    expect(result.month_long).toBe('January');
    expect(result.month_short).toBe('Jan');
    expect(result.fiscal_year).toBe(2024);
    expect(result.fiscal_month).toBe(4); // January is fiscal month 4
    expect(result.period_date).toBe('2024-01-01');
  });

  it('should build a period record for October (fiscal year boundary)', () => {
    const record = { month: 'October', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2024);
    expect(result.calendar_month).toBe(10);
    expect(result.fiscal_year).toBe(2025); // Oct 2024 is FY 2025
    expect(result.fiscal_month).toBe(1); // October is fiscal month 1
    expect(result.period_date).toBe('2024-10-01');
  });

  it('should build a period record for September', () => {
    const record = { month: 'September', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(9);
    expect(result.fiscal_year).toBe(2024);
    expect(result.fiscal_month).toBe(12); // September is fiscal month 12
  });

  it('should build a period record for December', () => {
    const record = { month: 'December', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(12);
    expect(result.fiscal_year).toBe(2025); // Dec 2024 is FY 2025
    expect(result.fiscal_month).toBe(3); // December is fiscal month 3
  });

  it('should handle lowercase month names', () => {
    const record = { month: 'january', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(1);
  });

  it('should handle mixed case month names', () => {
    const record = { month: 'JANUARY', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(1);
  });

  it('should return null for empty month', () => {
    const record = { month: '', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for missing month', () => {
    const record = { calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for invalid month name', () => {
    const record = { month: 'NotAMonth', calendar_year: '2024' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for invalid calendar year', () => {
    const record = { month: 'January', calendar_year: 'invalid' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for missing calendar year', () => {
    const record = { month: 'January' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should handle numeric calendar year', () => {
    const record = { month: 'January', calendar_year: 2024 };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2024);
  });
});
