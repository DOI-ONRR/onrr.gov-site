import { describe, it, expect } from 'vitest';
import { transformCommodity } from '../../../transformers/disbursement/transformCommodity.js';

describe('transformCommodity', () => {
  it('should return "Not tied to a commodity" when commodity is missing', () => {
    const record = { fund_type: 'State' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Not tied to a commodity');
  });

  it('should return "Not tied to a commodity" when commodity is empty', () => {
    const record = { commodity: '' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Not tied to a commodity');
  });

  it('should convert CO2 to Carbon dioxide', () => {
    const record = { commodity: 'CO2' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Carbon dioxide');
  });

  it('should convert CO2 with suffix to Carbon dioxide with suffix', () => {
    const record = { commodity: 'CO2 (Gas)' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Carbon dioxide (gas)');
  });

  it('should convert Carbon Dioxide to Carbon dioxide', () => {
    const record = { commodity: 'Carbon Dioxide' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Carbon dioxide');
  });

  it('should convert NGL to Natural gas liquids', () => {
    const record = { commodity: 'NGL' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Natural gas liquids');
  });

  it('should convert Oil & Gas to Oil & gas (pre-production)', () => {
    const record = { commodity: 'Oil & Gas' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Oil & gas (pre-production)');
  });

  it('should capitalize first letter and lowercase rest', () => {
    const record = { commodity: 'OIL' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Oil');
  });

  it('should handle mixed case input', () => {
    const record = { commodity: 'NATURAL GAS' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Natural gas');
  });

  it('should preserve other record fields', () => {
    const record = {
      commodity: 'Oil',
      fund_type: 'State',
      state: 'TX'
    };
    const result = transformCommodity(record);
    expect(result.fund_type).toBe('State');
    expect(result.state).toBe('TX');
  });
});
