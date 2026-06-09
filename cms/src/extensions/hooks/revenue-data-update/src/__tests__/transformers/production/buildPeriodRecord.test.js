import { describe, it, expect } from 'vitest';
import { buildPeriodRecord } from '../../../transformers/production/buildPeriodRecord.js';

describe('buildPeriodRecord', () => {
  it('should build a period record for January', () => {
    const record = { production_date: '2024-01-01' };
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
    const record = { production_date: '2024-10-01' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2024);
    expect(result.calendar_month).toBe(10);
    expect(result.fiscal_year).toBe(2025); // Oct 2024 is FY 2025
    expect(result.fiscal_month).toBe(1); // October is fiscal month 1
    expect(result.period_date).toBe('2024-10-01');
  });

  it('should build a period record for September', () => {
    const record = { production_date: '2024-09-01' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(9);
    expect(result.fiscal_year).toBe(2024);
    expect(result.fiscal_month).toBe(12); // September is fiscal month 12
  });

  it('should build a period record for December', () => {
    const record = { production_date: '2024-12-01' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(12);
    expect(result.fiscal_year).toBe(2025); // Dec 2024 is FY 2025
    expect(result.fiscal_month).toBe(3); // December is fiscal month 3
  });

  it('should build a period record for November', () => {
    const record = { production_date: '2024-11-01' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(11);
    expect(result.fiscal_year).toBe(2025); // Nov 2024 is FY 2025
    expect(result.fiscal_month).toBe(2); // November is fiscal month 2
  });

  it('should return null for empty period_date', () => {
    const record = { production_date: '' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for missing production_date', () => {
    const record = {};
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for null production_date', () => {
    const record = { production_date: null };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should return null for invalid date format', () => {
    const record = { production_date: 'invalid-date' };
    const result = buildPeriodRecord(record);

    expect(result).toBeNull();
  });

  it('should handle dates with different day values', () => {
    const record = { production_date: '2024-06-15' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_month).toBe(6);
    expect(result.month_long).toBe('June');
    expect(result.period_date).toBe('2024-06-15');
  });

  // Tests for m/d/yyyy format
  it('should parse m/d/yyyy format for January', () => {
    const record = { production_date: '1/1/2013' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.type).toBe('Monthly');
    expect(result.calendar_year).toBe(2013);
    expect(result.calendar_month).toBe(1);
    expect(result.month_long).toBe('January');
    expect(result.fiscal_year).toBe(2013);
    expect(result.fiscal_month).toBe(4);
    expect(result.period_date).toBe('2013-01-01');
  });

  it('should parse m/d/yyyy format for October (fiscal year boundary)', () => {
    const record = { production_date: '10/1/2024' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2024);
    expect(result.calendar_month).toBe(10);
    expect(result.fiscal_year).toBe(2025);
    expect(result.fiscal_month).toBe(1);
    expect(result.period_date).toBe('2024-10-01');
  });

  it('should parse m/d/yyyy format with single digit month and day', () => {
    const record = { production_date: '6/5/2020' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2020);
    expect(result.calendar_month).toBe(6);
    expect(result.month_long).toBe('June');
    expect(result.period_date).toBe('2020-06-05');
  });

  it('should parse m/d/yyyy format with double digit month and day', () => {
    const record = { production_date: '12/31/2023' };
    const result = buildPeriodRecord(record);

    expect(result).not.toBeNull();
    expect(result.calendar_year).toBe(2023);
    expect(result.calendar_month).toBe(12);
    expect(result.fiscal_year).toBe(2024);
    expect(result.period_date).toBe('2023-12-31');
  });
});
