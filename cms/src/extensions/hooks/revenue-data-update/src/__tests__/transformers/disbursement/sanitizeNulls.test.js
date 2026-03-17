import { describe, it, expect } from 'vitest';
import { sanitizeNulls } from '../../../transformers/disbursement/sanitizeNulls.js';

describe('sanitizeNulls', () => {
  it('should replace null values with empty strings', () => {
    const record = {
      fund_type: null,
      disbursement_type: null,
      land_category: null,
      state: null,
      county: null,
      fund_class: null,
      recipient: null,
      category: null,
    };
    const result = sanitizeNulls(record);

    expect(result.fund_type).toBe('');
    expect(result.disbursement_type).toBe('');
    expect(result.land_category).toBe('');
    expect(result.state).toBe('');
    expect(result.county).toBe('');
    expect(result.fund_class).toBe('');
    expect(result.recipient).toBe('');
    expect(result.category).toBe('');
  });

  it('should replace undefined values with empty strings', () => {
    const record = {
      fund_type: undefined,
      state: undefined,
    };
    const result = sanitizeNulls(record);

    expect(result.fund_type).toBe('');
    expect(result.state).toBe('');
  });

  it('should preserve existing string values', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: 'Onshore',
      state: 'TX',
      county: 'Harris',
    };
    const result = sanitizeNulls(record);

    expect(result.fund_type).toBe('State');
    expect(result.disbursement_type).toBe('Onshore');
    expect(result.state).toBe('TX');
    expect(result.county).toBe('Harris');
  });

  it('should preserve empty string values', () => {
    const record = {
      fund_type: '',
      state: '',
    };
    const result = sanitizeNulls(record);

    expect(result.fund_type).toBe('');
    expect(result.state).toBe('');
  });

  it('should not modify fields not in the sanitize list', () => {
    const record = {
      disbursement: null,
      calendar_year: null,
      month: null,
    };
    const result = sanitizeNulls(record);

    expect(result.disbursement).toBeNull();
    expect(result.calendar_year).toBeNull();
    expect(result.month).toBeNull();
  });

  it('should not mutate the original record', () => {
    const record = { fund_type: null };
    const result = sanitizeNulls(record);

    expect(record.fund_type).toBeNull();
    expect(result.fund_type).toBe('');
  });
});
