import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateDatasetMetadata,
  sourceCollectionForDataset,
  grainForPeriod,
  lastDayOfMonth,
} from '../../processes/updateDatasetMetadata.js';

describe('helpers', () => {
  it('sourceCollectionForDataset swaps hyphens for underscores', () => {
    expect(sourceCollectionForDataset('revenue')).toBe('revenue');
    expect(sourceCollectionForDataset('federal-sales')).toBe('federal_sales');
    expect(sourceCollectionForDataset('federal-revenue-by-company')).toBe('federal_revenue_by_company');
  });

  it('grainForPeriod maps CY/FY to yearly, everything else to monthly', () => {
    expect(grainForPeriod('calendar-year')).toBe('yearly');
    expect(grainForPeriod('fiscal-year')).toBe('yearly');
    expect(grainForPeriod('monthly')).toBe('monthly');
    expect(grainForPeriod('true-up')).toBe('monthly');
    expect(grainForPeriod(undefined)).toBe('monthly');
  });

  it('lastDayOfMonth returns the final day of the containing month', () => {
    expect(lastDayOfMonth('2026-08-15')).toBe('2026-08-31');
    expect(lastDayOfMonth('2024-02-10')).toBe('2024-02-29'); // leap year
    expect(lastDayOfMonth('2026-12-01')).toBe('2026-12-31');
    expect(lastDayOfMonth(new Date(Date.UTC(2026, 7, 3)))).toBe('2026-08-31');
  });
});

// Chainable knex-ish mock: database('dataset_metadata')…select() resolves to metadataRows;
// database(fact)…max().first() resolves to the aggregate ({d} monthly, {y} yearly).
function makeDb({ metadataRows = [], maxMonthly = null, maxYear = null } = {}) {
  return (table) => {
    const b = {
      where: () => b,
      whereIn: () => b,
      join: () => b,
      select: () => Promise.resolve(metadataRows),
      max(expr) { b._max = String(expr); return b; },
      first: () =>
        Promise.resolve(b._max && b._max.includes('calendar_year') ? (maxYear ? { y: maxYear } : {}) : (maxMonthly ? { d: maxMonthly } : {})),
    };
    return b;
  };
}

function makeServices() {
  const updateMany = vi.fn().mockResolvedValue(undefined);
  class ItemsService { constructor() {} updateMany(...a) { return updateMany(...a); } }
  return { services: { ItemsService }, updateMany };
}

const ok = (overrides = {}) => ({ success: true, completedAt: '2026-10-15T12:00:00.000Z', ...overrides });

describe('updateDatasetMetadata', () => {
  let services, updateMany;
  beforeEach(() => { ({ services, updateMany } = makeServices()); });

  it('no-ops when the result is not a success', async () => {
    const database = makeDb({ metadataRows: [{ id: 'm1' }], maxMonthly: '2026-08-01' });
    await updateDatasetMetadata({ dataset: 'revenue', period: 'monthly' }, { database, services, schema: {}, accountability: {} }, { success: false });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('monthly load stamps coverage_end (last day of max Monthly period) + dataset_last_updated', async () => {
    const database = makeDb({ metadataRows: [{ id: 'm1' }], maxMonthly: '2026-08-01' });
    await updateDatasetMetadata({ dataset: 'production', period: 'monthly' }, { database, services, schema: {}, accountability: {} }, ok());
    expect(updateMany).toHaveBeenCalledWith(['m1'], {
      dataset_last_updated: '2026-10-15T12:00:00.000Z',
      coverage_end: '2026-08-31',
    });
  });

  it('updates every matched row (production maps to monthly + annual rows)', async () => {
    const database = makeDb({ metadataRows: [{ id: 'monthly-prod' }, { id: 'yearly-prod' }], maxMonthly: '2026-08-01' });
    await updateDatasetMetadata({ dataset: 'production', period: 'calendar-year' }, { database, services, schema: {}, accountability: {} }, ok());
    expect(updateMany).toHaveBeenCalledWith(['monthly-prod', 'yearly-prod'], expect.objectContaining({ coverage_end: '2026-08-31' }));
  });

  it('annual-only dataset uses Dec 31 of the max calendar_year', async () => {
    const database = makeDb({ metadataRows: [{ id: 'fs' }], maxYear: 2025 });
    await updateDatasetMetadata({ dataset: 'federal-sales', period: null }, { database, services, schema: {}, accountability: {} }, ok());
    expect(updateMany).toHaveBeenCalledWith(['fs'], expect.objectContaining({ coverage_end: '2025-12-31' }));
  });

  it('skips coverage_end (but keeps dataset_last_updated) when the fact table has no rows', async () => {
    const database = makeDb({ metadataRows: [{ id: 'm1' }], maxMonthly: null });
    await updateDatasetMetadata({ dataset: 'revenue', period: 'monthly' }, { database, services, schema: {}, accountability: {} }, ok());
    expect(updateMany).toHaveBeenCalledWith(['m1'], { dataset_last_updated: '2026-10-15T12:00:00.000Z' });
  });

  it('does not update when no dataset_metadata row matches', async () => {
    const database = makeDb({ metadataRows: [], maxMonthly: '2026-08-01' });
    await updateDatasetMetadata({ dataset: 'revenue', period: 'monthly' }, { database, services, schema: {}, accountability: {} }, ok());
    expect(updateMany).not.toHaveBeenCalled();
  });
});
