import { describe, it, expect } from 'vitest';
import { buildPeriodRecords } from '../../../transformers/revenue/buildPeriodRecord.js';

describe('buildPeriodRecords', () => {
  it('should create Monthly period for a regular month', () => {
    const record = { accept_date: '1/15/2026' };
    const result = buildPeriodRecords(record);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'Monthly',
      calendar_year: 2026,
      fiscal_year: 2026,
      calendar_month: 1,
      month_long: 'January',
      month_short: 'Jan',
      fiscal_month: 4,
      period_date: '2026-01-15',
    });
  });

  it('should create Monthly and Fiscal Year periods for September', () => {
    // September 2025 is the last month of Fiscal Year 2025 (FY runs Oct-Sep)
    const record = { accept_date: '9/1/2025' };
    const result = buildPeriodRecords(record);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('Monthly');
    expect(result[0].calendar_month).toBe(9);
    expect(result[0].fiscal_year).toBe(2025); // September 2025 is in FY 2025
    expect(result[0].fiscal_month).toBe(12);  // September is fiscal month 12

    expect(result[1].type).toBe('Fiscal Year');
    expect(result[1].fiscal_year).toBe(2025); // FY 2025 ends September 30, 2025
    expect(result[1].calendar_year).toBe(2025);
    expect(result[1].calendar_month).toBe(0);
    expect(result[1].period_date).toBe('2025-01-01');
  });

  it('should create Monthly and Calendar Year periods for December', () => {
    const record = { accept_date: '12/1/2025' };
    const result = buildPeriodRecords(record);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('Monthly');
    expect(result[0].calendar_month).toBe(12);
    expect(result[0].fiscal_year).toBe(2026);

    expect(result[1].type).toBe('Calendar Year');
    expect(result[1].calendar_year).toBe(2025);
    expect(result[1].fiscal_year).toBe(2025);
    expect(result[1].calendar_month).toBe(0);
    expect(result[1].period_date).toBe('2025-01-01');
  });

  it('should calculate fiscal year correctly for October', () => {
    const record = { accept_date: '10/1/2025' };
    const result = buildPeriodRecords(record);

    expect(result[0].calendar_year).toBe(2025);
    expect(result[0].fiscal_year).toBe(2026);
    expect(result[0].fiscal_month).toBe(1);
  });

  it('should calculate fiscal year correctly for November', () => {
    const record = { accept_date: '11/1/2025' };
    const result = buildPeriodRecords(record);

    expect(result[0].fiscal_year).toBe(2026);
    expect(result[0].fiscal_month).toBe(2);
  });

  it('should calculate fiscal month correctly for various months', () => {
    // October = fiscal month 1
    expect(buildPeriodRecords({ accept_date: '10/1/2025' })[0].fiscal_month).toBe(1);
    // November = fiscal month 2
    expect(buildPeriodRecords({ accept_date: '11/1/2025' })[0].fiscal_month).toBe(2);
    // December = fiscal month 3
    expect(buildPeriodRecords({ accept_date: '12/1/2025' })[0].fiscal_month).toBe(3);
    // January = fiscal month 4
    expect(buildPeriodRecords({ accept_date: '1/1/2026' })[0].fiscal_month).toBe(4);
    // September = fiscal month 12
    expect(buildPeriodRecords({ accept_date: '9/1/2025' })[0].fiscal_month).toBe(12);
  });

  it('should handle YYYY-MM-DD format', () => {
    const record = { accept_date: '2026-01-15' };
    const result = buildPeriodRecords(record);

    expect(result).toHaveLength(1);
    expect(result[0].calendar_year).toBe(2026);
    expect(result[0].calendar_month).toBe(1);
  });

  it('should return empty array for empty accept_date', () => {
    const record = { accept_date: '' };
    const result = buildPeriodRecords(record);
    expect(result).toEqual([]);
  });

  it('should return empty array for null accept_date', () => {
    const record = { accept_date: null };
    const result = buildPeriodRecords(record);
    expect(result).toEqual([]);
  });

  it('should return empty array for invalid date format', () => {
    const record = { accept_date: 'invalid' };
    const result = buildPeriodRecords(record);
    expect(result).toEqual([]);
  });
});
