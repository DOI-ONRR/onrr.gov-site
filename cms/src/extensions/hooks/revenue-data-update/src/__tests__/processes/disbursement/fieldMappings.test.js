import { describe, it, expect } from 'vitest';
import { DISBURSEMENT_FIELD_MAP } from '../../../processes/disbursement/fieldMappings.js';

describe('DISBURSEMENT_FIELD_MAP', () => {
  it('should map "Month" to "month"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Month']).toBe('month');
  });

  it('should map "Calendar Year" to "calendar_year"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Calendar Year']).toBe('calendar_year');
  });

  it('should map "Fund Type" to "fund_type"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Fund Type']).toBe('fund_type');
  });

  it('should map "Treasury Fund" to "treasury_fund"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Treasury Fund']).toBe('treasury_fund');
  });

  it('should map "Land Category" to "land_category"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Land Category']).toBe('land_category');
  });

  it('should map "Disbursement Type" to "disbursement_type"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Disbursement Type']).toBe('disbursement_type');
  });

  it('should map "State" to "state"', () => {
    expect(DISBURSEMENT_FIELD_MAP['State']).toBe('state');
  });

  it('should map "County" to "county"', () => {
    expect(DISBURSEMENT_FIELD_MAP['County']).toBe('county');
  });

  it('should map "Commodity" to "commodity"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Commodity']).toBe('commodity');
  });

  it('should map "Category" to "category"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Category']).toBe('category');
  });

  it('should map "Disbursement" to "disbursement"', () => {
    expect(DISBURSEMENT_FIELD_MAP['Disbursement']).toBe('disbursement');
  });
});
