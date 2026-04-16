import { describe, it, expect } from 'vitest';
import { formatNegativeDisbursement } from '../../../transformers/disbursement/formatNegativeDisbursement.js';

describe('formatNegativeDisbursement', () => {
  it('should return record unchanged if disbursement is missing', () => {
    const record = { fund_type: 'State' };
    const result = formatNegativeDisbursement(record);
    expect(result).toEqual(record);
  });

  it('should return record unchanged if disbursement is empty', () => {
    const record = { disbursement: '' };
    const result = formatNegativeDisbursement(record);
    expect(result).toEqual(record);
  });

  it('should return null for disbursement that is just a dash', () => {
    const record = { disbursement: '-' };
    const result = formatNegativeDisbursement(record);
    expect(result).toBeNull();
  });

  it('should return null for disbursement that is a dash with whitespace', () => {
    const record = { disbursement: ' - ' };
    const result = formatNegativeDisbursement(record);
    expect(result).toBeNull();
  });

  it('should convert accounting notation (123) to -123', () => {
    const record = { disbursement: '(123.45)' };
    const result = formatNegativeDisbursement(record);
    expect(result.disbursement).toBe('-123.45');
  });

  it('should convert accounting notation with commas', () => {
    const record = { disbursement: '(1,234.56)' };
    const result = formatNegativeDisbursement(record);
    expect(result.disbursement).toBe('-1,234.56');
  });

  it('should preserve positive values', () => {
    const record = { disbursement: '1234.56' };
    const result = formatNegativeDisbursement(record);
    expect(result.disbursement).toBe('1234.56');
  });

  it('should preserve other record fields', () => {
    const record = {
      disbursement: '(100)',
      fund_type: 'State',
      state: 'TX'
    };
    const result = formatNegativeDisbursement(record);
    expect(result.fund_type).toBe('State');
    expect(result.state).toBe('TX');
    expect(result.disbursement).toBe('-100');
  });
});
