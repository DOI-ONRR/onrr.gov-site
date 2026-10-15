import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFiscalYearDisbursement } from '../../../processes/disbursement/index.js';

// Helper: 12 monthly period stubs.
const twelveMonths = Array.from({ length: 12 }, (_, i) => ({ id: `m${i + 1}` }));

describe('loadFiscalYearDisbursement', () => {
  let periodService, disbursementService, result;

  beforeEach(() => {
    periodService = { readByQuery: vi.fn() };
    disbursementService = {
      readByQuery: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue(undefined),
      createMany: vi.fn().mockResolvedValue([]),
    };
    result = { disbursementsCreated: 0, errors: [] };
  });

  it('sums monthly amounts numerically (decimal columns come back as strings) and refreshes', async () => {
    periodService.readByQuery
      .mockResolvedValueOnce([{ id: 'fy2024', fiscal_year: 2024 }]) // Fiscal Year periods
      .mockResolvedValueOnce(twelveMonths); // Monthly periods for FY2024
    disbursementService.readByQuery
      .mockResolvedValueOnce([{ id: 'old1' }, { id: 'old2' }]) // existing FY rows → delete-and-refresh
      .mockResolvedValueOnce([
        // same (location, commodity, fund) across two months → must SUM, not concat
        { location: 'L1', commodity: 'C1', fund: 'F1', amount: '100.00' },
        { location: 'L1', commodity: 'C1', fund: 'F1', amount: '50.50' },
        { location: 'L2', commodity: 'C1', fund: 'F1', amount: '25.00' },
      ]);

    await loadFiscalYearDisbursement(periodService, disbursementService, result);

    // Delete-and-refresh: the year's existing FY rows are cleared first.
    expect(disbursementService.deleteMany).toHaveBeenCalledWith(['old1', 'old2']);

    const inserted = disbursementService.createMany.mock.calls.flatMap((c) => c[0]);
    const l1 = inserted.find((r) => r.location === 'L1');
    expect(typeof l1.amount).toBe('number');
    expect(l1.amount).toBeCloseTo(150.5, 2); // 100.00 + 50.50, not "100.0050.50"
    expect(l1.duplicate_no).toBe(2);
    expect(l1.period).toBe('fy2024');
    expect(inserted.find((r) => r.location === 'L2').amount).toBeCloseTo(25, 2);
    expect(result.disbursementsCreated).toBe(2);
    // This year already had FY rows → a refresh, not a newly-completed year.
    expect(result.fiscalYearsCompleted || []).toEqual([]);
  });

  it('records a fiscal year whose final month was just processed (no prior FY rows)', async () => {
    periodService.readByQuery
      .mockResolvedValueOnce([{ id: 'fy2026', fiscal_year: 2026 }])
      .mockResolvedValueOnce(twelveMonths);
    disbursementService.readByQuery
      .mockResolvedValueOnce([]) // no existing FY rows → newly completed
      .mockResolvedValueOnce([{ location: 'L1', commodity: 'C1', fund: 'F1', amount: '100.00' }]);

    await loadFiscalYearDisbursement(periodService, disbursementService, result);

    expect(result.fiscalYearsCompleted).toEqual([2026]);
    expect(disbursementService.deleteMany).not.toHaveBeenCalled(); // nothing to delete
    expect(disbursementService.createMany).toHaveBeenCalled();
  });

  it('skips fiscal years without all 12 monthly periods (and does not delete/insert)', async () => {
    periodService.readByQuery
      .mockResolvedValueOnce([{ id: 'fy2025', fiscal_year: 2025 }])
      .mockResolvedValueOnce([{ id: 'm1' }, { id: 'm2' }]); // only 2 months → incomplete

    await loadFiscalYearDisbursement(periodService, disbursementService, result);

    expect(disbursementService.deleteMany).not.toHaveBeenCalled();
    expect(disbursementService.createMany).not.toHaveBeenCalled();
    expect(result.disbursementsCreated).toBe(0);
  });
});
