import { describe, it, expect } from 'vitest';
import { buildFundRecord } from '../../../transformers/revenue/buildFundRecord.js';

describe('buildFundRecord', () => {
  it('should build fund record from revenue record', () => {
    const record = {
      revenue_type: 'Royalties',
      land_category_code_desc: 'Offshore',
    };
    const result = buildFundRecord(record);

    expect(result).toEqual({
      revenue_type: 'Royalties',
      source: 'Offshore',
      fund_type: null,
      fund_class: null,
      recipient: null,
      disbursement_type: null,
    });
  });

  it('should replace null values with null', () => {
    const record = {
      revenue_type: null,
      land_category_code_desc: null,
    };
    const result = buildFundRecord(record);

    expect(result).toEqual({
      revenue_type: null,
      source: null,
      fund_type: null,
      fund_class: null,
      recipient: null,
      disbursement_type: null,
    });
  });

  it('should replace undefined values with null', () => {
    const record = {};
    const result = buildFundRecord(record);

    expect(result).toEqual({
      revenue_type: null,
      source: null,
      fund_type: null,
      fund_class: null,
      recipient: null,
      disbursement_type: null,
    });
  });

  it('should handle various revenue types', () => {
    expect(buildFundRecord({ revenue_type: 'Rents', land_category_code_desc: 'Onshore' })).toEqual({
      revenue_type: 'Rents',
      source: 'Onshore',
      fund_type: null,
      fund_class: null,
      recipient: null,
      disbursement_type: null,
    });

    expect(buildFundRecord({ revenue_type: 'Other revenues', land_category_code_desc: 'Not Tied to a Lease' })).toEqual({
      revenue_type: 'Other revenues',
      source: 'Not Tied to a Lease',
      fund_type: null,
      fund_class: null,
      recipient: null,
      disbursement_type: null,
    });
  });
});
