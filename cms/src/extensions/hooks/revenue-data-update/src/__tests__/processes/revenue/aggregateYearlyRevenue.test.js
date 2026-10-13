import { describe, it, expect } from 'vitest';
import { aggregateYearlyRevenue } from '../../../processes/revenue/index.js';

describe('aggregateYearlyRevenue', () => {
  it('sums string amounts numerically (pg returns numeric columns as strings)', () => {
    // Same (location, commodity, fund) across 5 months — the exact values that produced
    // "119.807158.7520.0080.00520.00" when summed as strings.
    const rows = [
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '119.80' },
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '7158.75' },
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '20.00' },
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '80.00' },
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '520.00' },
    ];

    const out = aggregateYearlyRevenue(rows, 'FY2020');

    expect(out).toHaveLength(1);
    expect(typeof out[0].amount).toBe('number');
    expect(out[0].amount).toBeCloseTo(7898.55, 2);
    expect(out[0]).toMatchObject({
      location: 'L1',
      commodity: 'C1',
      fund: 'F1',
      period: 'FY2020',
      unit: 'dollars',
      unit_abbr: '$',
      duplicate_no: 5,
    });
  });

  it('keeps distinct keys separate and tags each with the period id', () => {
    const rows = [
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '100' },
      { location: 'L2', commodity: 'C1', fund: 'F1', amount: '50' },
    ];

    const out = aggregateYearlyRevenue(rows, 'CY2021');

    expect(out).toHaveLength(2);
    expect(out.every((r) => r.period === 'CY2021')).toBe(true);
    expect(out.map((r) => r.amount).sort((a, b) => a - b)).toEqual([50, 100]);
  });

  it('treats missing/invalid amounts as 0', () => {
    const rows = [
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: null },
      { location: 'L1', commodity: 'C1', fund: 'F1', amount: '42.50' },
    ];

    const out = aggregateYearlyRevenue(rows, 'FY2022');

    expect(out).toHaveLength(1);
    expect(out[0].amount).toBeCloseTo(42.5, 2);
    expect(out[0].duplicate_no).toBe(2);
  });
});
