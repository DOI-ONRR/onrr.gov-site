import { describe, it, expect } from 'vitest';
import { transformCommodity } from '../../../transformers/revenue/transformCommodity.js';

describe('transformCommodity', () => {
  it('should transform CO2 to Carbon dioxide', () => {
    const record = { commodity: 'CO2' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Carbon dioxide');
  });

  it('should transform Carbon Dioxide to Carbon dioxide', () => {
    const record = { commodity: 'Carbon Dioxide' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Carbon dioxide');
  });

  it('should transform NGL to Natural gas liquids', () => {
    const record = { commodity: 'NGL' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Natural gas liquids');
  });

  it('should transform Oil & Gas to Oil & gas (pre-production)', () => {
    const record = { commodity: 'Oil & Gas' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Oil & gas (pre-production)');
  });

  it('should capitalize first letter and lowercase rest for other commodities', () => {
    const record = { commodity: 'OIL' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Oil');
  });

  it('should handle mixed case commodities', () => {
    const record = { commodity: 'NATURAL GAS' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Natural gas');
  });

  it('should handle already correct case', () => {
    const record = { commodity: 'Oil' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('Oil');
  });

  it('should return record unchanged when commodity is empty', () => {
    const record = { commodity: '' };
    const result = transformCommodity(record);
    expect(result.commodity).toBe('');
  });

  it('should return record unchanged when commodity is null', () => {
    const record = { commodity: null };
    const result = transformCommodity(record);
    expect(result.commodity).toBeNull();
  });

  it('should not mutate the original record', () => {
    const record = { commodity: 'CO2' };
    const result = transformCommodity(record);

    expect(record.commodity).toBe('CO2');
    expect(result.commodity).toBe('Carbon dioxide');
  });
});
