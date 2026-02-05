import { describe, it, expect } from 'vitest';
import { transformFundType } from '../../../transformers/disbursement/transformFundType.js';

describe('transformFundType', () => {
  it('should normalize "BLM - Permit Processing and Improvement"', () => {
    const record = { fund_type: 'BLM - Permit Processing and Improvement' };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('Lease Process Improvement (BLM)');
  });

  it('should normalize "U.S. TreasuryAI" to Native American', () => {
    const record = { fund_type: 'U.S. TreasuryAI' };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('Native American Tribes & Allottees');
  });

  it('should normalize "American Indian Tribes" to Native American', () => {
    const record = { fund_type: 'American Indian Tribes' };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('Native American Tribes & Allottees');
  });

  it('should keep "Native American Tribes & Allottees" unchanged', () => {
    const record = { fund_type: 'Native American Tribes & Allottees' };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('Native American Tribes & Allottees');
  });

  it('should append " 8(g)" suffix when disbursement_type contains "8(g)"', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: '8(g) Offshore'
    };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('State 8(g)');
    expect(result.disbursement_type).toBe('8(g) offshore');
  });

  it('should append " - OCS Gulf" suffix when disbursement_type contains "GoMESA"', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: 'GoMESA'
    };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('State - OCS Gulf');
    expect(result.disbursement_type).toBe('OCS Gulf');
  });

  it('should append " - OCS Gulf" suffix when disbursement_type is "OCS Gulf"', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: 'OCS Gulf'
    };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('State - OCS Gulf');
    expect(result.disbursement_type).toBe('OCS Gulf');
  });

  it('should handle empty fund_type', () => {
    const record = { fund_type: '' };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('');
  });

  it('should handle missing fund_type', () => {
    const record = {};
    const result = transformFundType(record);
    expect(result.fund_type).toBe('');
  });

  it('should handle empty disbursement_type', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: ''
    };
    const result = transformFundType(record);
    expect(result.fund_type).toBe('State');
    expect(result.disbursement_type).toBe('');
  });

  it('should preserve other record fields', () => {
    const record = {
      fund_type: 'State',
      disbursement_type: 'Onshore',
      state: 'TX',
      county: 'Harris'
    };
    const result = transformFundType(record);
    expect(result.state).toBe('TX');
    expect(result.county).toBe('Harris');
  });
});
