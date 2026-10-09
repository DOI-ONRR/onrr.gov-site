import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock every dataset process so we test only the dispatch routing in runDatasetUpdate.
vi.mock('../../processes/disbursement/index.js', () => ({
  processDisbursementUpdate: vi.fn(() => Promise.resolve({ tag: 'disbursement' })),
}));
vi.mock('../../processes/production/index.js', () => ({
  processProductionUpdate: vi.fn(() => Promise.resolve({ tag: 'production' })),
}));
vi.mock('../../processes/revenue/index.js', () => ({
  processRevenueUpdate: vi.fn((file, ctx, opts) => Promise.resolve({ tag: 'revenue', opts })),
}));
vi.mock('../../processes/cy-production/index.js', () => ({
  processCYProductionUpdate: vi.fn(() => Promise.resolve({ tag: 'cy-production' })),
}));
vi.mock('../../processes/fy-production/index.js', () => ({
  processFYProductionUpdate: vi.fn(() => Promise.resolve({ tag: 'fy-production' })),
}));
vi.mock('../../processes/revenue-by-company/index.js', () => ({
  processRevenueByCompanyUpdate: vi.fn(() => Promise.resolve({ tag: 'revenue-by-company' })),
}));
vi.mock('../../processes/federal-sales/index.js', () => ({
  processFederalSalesUpdate: vi.fn(() => Promise.resolve({ tag: 'federal-sales' })),
}));

import { runDatasetUpdate } from '../../processes/runUpdate.js';
import { processDisbursementUpdate } from '../../processes/disbursement/index.js';
import { processProductionUpdate } from '../../processes/production/index.js';
import { processRevenueUpdate } from '../../processes/revenue/index.js';
import { processCYProductionUpdate } from '../../processes/cy-production/index.js';
import { processFYProductionUpdate } from '../../processes/fy-production/index.js';
import { processRevenueByCompanyUpdate } from '../../processes/revenue-by-company/index.js';
import { processFederalSalesUpdate } from '../../processes/federal-sales/index.js';

const ctx = { services: {}, database: {}, schema: {}, accountability: {} };

describe('runDatasetUpdate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('routes disbursement to the disbursement process', async () => {
    const result = await runDatasetUpdate({ dataset: 'disbursement', file: 'f1' }, ctx);
    expect(result).toEqual({ tag: 'disbursement' });
    expect(processDisbursementUpdate).toHaveBeenCalledWith('f1', ctx);
  });

  it('routes monthly production (no period) to the monthly process', async () => {
    const result = await runDatasetUpdate({ dataset: 'production', file: 'f2' }, ctx);
    expect(result).toEqual({ tag: 'production' });
    expect(processProductionUpdate).toHaveBeenCalledWith('f2', ctx);
    expect(processCYProductionUpdate).not.toHaveBeenCalled();
    expect(processFYProductionUpdate).not.toHaveBeenCalled();
  });

  it('routes calendar-year production to the CY process', async () => {
    const result = await runDatasetUpdate({ dataset: 'production', period: 'calendar-year', file: 'f3' }, ctx);
    expect(result).toEqual({ tag: 'cy-production' });
    expect(processCYProductionUpdate).toHaveBeenCalledWith('f3', ctx);
    expect(processProductionUpdate).not.toHaveBeenCalled();
  });

  it('routes fiscal-year production to the FY process', async () => {
    const result = await runDatasetUpdate({ dataset: 'production', period: 'fiscal-year', file: 'f4' }, ctx);
    expect(result).toEqual({ tag: 'fy-production' });
    expect(processFYProductionUpdate).toHaveBeenCalledWith('f4', ctx);
    expect(processProductionUpdate).not.toHaveBeenCalled();
  });

  it('routes revenue and forwards the period option', async () => {
    const result = await runDatasetUpdate({ dataset: 'revenue', period: 'true-up', file: 'f5' }, ctx);
    expect(result).toEqual({ tag: 'revenue', opts: { period: 'true-up' } });
    expect(processRevenueUpdate).toHaveBeenCalledWith('f5', ctx, { period: 'true-up' });
  });

  it('routes federal-revenue-by-company', async () => {
    const result = await runDatasetUpdate({ dataset: 'federal-revenue-by-company', file: 'f6' }, ctx);
    expect(result).toEqual({ tag: 'revenue-by-company' });
    expect(processRevenueByCompanyUpdate).toHaveBeenCalledWith('f6', ctx);
  });

  it('routes federal-sales', async () => {
    const result = await runDatasetUpdate({ dataset: 'federal-sales', file: 'f7' }, ctx);
    expect(result).toEqual({ tag: 'federal-sales' });
    expect(processFederalSalesUpdate).toHaveBeenCalledWith('f7', ctx);
  });

  it('returns null for an unknown dataset and calls no process', async () => {
    const result = await runDatasetUpdate({ dataset: 'nope', file: 'f8' }, ctx);
    expect(result).toBeNull();
    expect(processDisbursementUpdate).not.toHaveBeenCalled();
    expect(processProductionUpdate).not.toHaveBeenCalled();
    expect(processRevenueUpdate).not.toHaveBeenCalled();
  });
});
