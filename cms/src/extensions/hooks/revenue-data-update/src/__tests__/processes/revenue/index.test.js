import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processRevenueUpdate } from '../../../processes/revenue/index.js';

// Mock shared utilities. yieldToEventLoop/chunk get real-enough stand-ins (the barrel is
// fully mocked, so the real exports aren't loaded): yield resolves immediately, chunk splits.
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
  yieldToEventLoop: vi.fn().mockResolvedValue(undefined),
  chunk: (items, size) => {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  },
}));

import { getFileContents, parseCsv } from '../../../processes/shared/index.js';

describe('processRevenueUpdate', () => {
  let mockContext;
  let mockFundService;
  let mockLocationService;
  let mockPeriodService;
  let mockCommodityService;
  let mockRevenueService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFundService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
    };

    mockLocationService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
    };

    mockPeriodService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
    };

    mockCommodityService = {
      readByQuery: vi.fn().mockResolvedValue([{ id: 1 }]),
    };

    mockRevenueService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
      createMany: vi.fn().mockResolvedValue([]),
      deleteOne: vi.fn().mockResolvedValue(undefined),
      deleteByQuery: vi.fn().mockResolvedValue([]),
    };

    mockContext = {
      services: {
        ItemsService: vi.fn((collection) => {
          switch (collection) {
            case 'fund':
              return mockFundService;
            case 'location':
              return mockLocationService;
            case 'period':
              return mockPeriodService;
            case 'commodity':
              return mockCommodityService;
            case 'revenue':
              return mockRevenueService;
            default:
              return {};
          }
        }),
      },
      database: {},
      schema: {},
      accountability: {},
    };
  });

  describe('result structure', () => {
    it('should return a result object with expected properties', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result).toHaveProperty('fileId', 'test-file-id');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('recordsProcessed');
      expect(result).toHaveProperty('recordsSkipped');
      expect(result).toHaveProperty('fundsCreated');
      expect(result).toHaveProperty('locationsCreated');
      expect(result).toHaveProperty('periodsCreated');
      expect(result).toHaveProperty('revenueCreated');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('file retrieval', () => {
    it('should call getFileContents with the file ID', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      await processRevenueUpdate('test-file-id', mockContext);

      expect(getFileContents).toHaveBeenCalledWith('test-file-id', expect.any(Object));
    });
  });

  describe('CSV parsing', () => {
    it('should call parseCsv with file contents and field map', async () => {
      getFileContents.mockResolvedValue('csv content');
      parseCsv.mockReturnValue([]);

      await processRevenueUpdate('test-file-id', mockContext);

      expect(parseCsv).toHaveBeenCalledWith('csv content', expect.objectContaining({
        'Accept Date': 'accept_date',
        'Revenue': 'revenue',
      }));
    });
  });

  describe('record transformation', () => {
    it('should skip empty records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        { accept_date: null, revenue: null, commodity: null },
      ]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.recordsSkipped).toBe(1);
      expect(result.recordsProcessed).toBe(0);
    });

    it('should process valid records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.recordsProcessed).toBe(1);
    });
  });

  describe('Native American aggregation', () => {
    it('should aggregate Indian land class records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Indian',
          land_category_code_desc: 'Onshore',
          state: 'OK',
          county_code_desc: 'Osage',
          fips_code: '40113',
          agency_state_region_code_desc: '',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
        {
          accept_date: '1/1/2026',
          land_class_code: 'Indian',
          land_category_code_desc: 'Onshore',
          state: 'OK',
          county_code_desc: 'Creek',
          fips_code: '40037',
          agency_state_region_code_desc: '',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '500.00',
        },
      ]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      // Should process both records
      expect(result.recordsProcessed).toBe(2);
      // But should only create one revenue record (aggregated), bulk-inserted via createMany.
      const inserted = mockRevenueService.createMany.mock.calls.flatMap((c) => c[0]);
      expect(inserted).toHaveLength(1);
    });
  });

  describe('fund handling', () => {
    it('should create fund when not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);
      mockFundService.readByQuery.mockResolvedValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(mockFundService.createOne).toHaveBeenCalled();
      expect(result.fundsCreated).toBeGreaterThan(0);
    });

    it('should use existing fund when found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);
      mockFundService.readByQuery.mockResolvedValue([{ id: 99 }]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(mockFundService.createOne).not.toHaveBeenCalled();
      expect(result.fundsCreated).toBe(0);
    });
  });

  describe('location handling', () => {
    it('should create location when not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);
      mockLocationService.readByQuery.mockResolvedValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(mockLocationService.createOne).toHaveBeenCalled();
      expect(result.locationsCreated).toBeGreaterThan(0);
    });
  });

  describe('period handling', () => {
    it('should create monthly period when not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);
      mockPeriodService.readByQuery.mockResolvedValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(mockPeriodService.createOne).toHaveBeenCalled();
      expect(result.periodsCreated).toBeGreaterThan(0);
    });
  });

  describe('commodity handling', () => {
    it('should lookup commodity', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);

      await processRevenueUpdate('test-file-id', mockContext);

      expect(mockCommodityService.readByQuery).toHaveBeenCalledWith(expect.objectContaining({
        filter: expect.objectContaining({
          name: { _eq: 'Oil' },
        }),
      }));
    });

    it('should add error when commodity not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Unknown Commodity',
          product_code_desc: 'Unknown',
          revenue: '1000.00',
        },
      ]);
      mockCommodityService.readByQuery.mockResolvedValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.errors.some(e => e.type === 'commodity_not_found')).toBe(true);
    });
  });

  describe('revenue aggregation', () => {
    it('should aggregate duplicate revenue records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '500.00',
        },
      ]);

      await processRevenueUpdate('test-file-id', mockContext);

      // Should create only one revenue record (aggregated), bulk-inserted via createMany.
      const inserted = mockRevenueService.createMany.mock.calls.flatMap((c) => c[0]);
      expect(inserted).toHaveLength(1);
      // The aggregated amount should be 1500, written to the `amount` column
      // (the revenue collection has no `revenue` field — Directus would silently
      // drop it and leave amount NULL).
      expect(inserted[0]).toEqual(
        expect.objectContaining({
          amount: 1500,
          duplicate_no: 2,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle file retrieval errors', async () => {
      getFileContents.mockRejectedValue(new Error('File not found'));

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('File not found');
    });

    it('should handle fund creation errors', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);
      mockFundService.readByQuery.mockResolvedValue([]);
      mockFundService.createOne.mockRejectedValue(new Error('Database error'));

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.errors.some(e => e.type === 'fund_insert')).toBe(true);
    });
  });

  describe('offshore region transformation', () => {
    it('should transform GULF OF AMERICA to Gulf of America', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          accept_date: '1/1/2026',
          land_class_code: 'Federal',
          land_category_code_desc: 'Offshore',
          state: '',
          county_code_desc: '',
          fips_code: '',
          agency_state_region_code_desc: 'GULF OF AMERICA',
          revenue_type: 'Royalties',
          mineral_production_code_desc: 'Oil & Gas',
          commodity: 'Oil',
          product_code_desc: 'Oil',
          revenue: '1000.00',
        },
      ]);

      await processRevenueUpdate('test-file-id', mockContext);

      expect(mockLocationService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          offshore_region: 'Gulf of America',
          fips_code: 'GMR',
        })
      );
    });
  });

  describe('true-up revenue deletion', () => {
    const makeRevenueRecord = (acceptDate = '1/1/2026') => ({
      accept_date: acceptDate,
      land_class_code: 'Federal',
      land_category_code_desc: 'Offshore',
      state: '',
      county_code_desc: '',
      fips_code: '',
      agency_state_region_code_desc: 'GULF OF AMERICA',
      revenue_type: 'Royalties',
      mineral_production_code_desc: 'Oil & Gas',
      commodity: 'Oil',
      product_code_desc: 'Oil',
      revenue: '1000.00',
    });

    it('should delete revenue records when period is true-up', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeRevenueRecord('3/1/2026')]);

      // Period query returns periods >= min accept_date
      mockPeriodService.readByQuery
        .mockResolvedValueOnce([{ id: 'period-1' }, { id: 'period-2' }]) // true-up period lookup
        .mockResolvedValueOnce([]) // subsequent period queries
        .mockResolvedValue([]);

      // Revenue query for deletion returns existing records
      mockRevenueService.readByQuery
        .mockResolvedValueOnce([{ id: 'rev-1' }, { id: 'rev-2' }, { id: 'rev-3' }]) // true-up revenue lookup
        .mockResolvedValue([]);

      const result = await processRevenueUpdate('test-file-id', mockContext, { period: 'true-up' });

      // One bulk delete (deleteByQuery) rather than a deleteOne per row; count preserved.
      expect(mockRevenueService.deleteByQuery).toHaveBeenCalledTimes(1);
      expect(mockRevenueService.deleteOne).not.toHaveBeenCalled();
      expect(result.revenueDeleted).toBe(3);
    });

    it('should not delete revenue records when period is not true-up', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeRevenueRecord()]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(result.revenueDeleted).toBe(0);
    });

    it('should handle true-up delete errors gracefully', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeRevenueRecord()]);

      // Period query fails
      mockPeriodService.readByQuery.mockRejectedValueOnce(new Error('Delete query failed'));

      const result = await processRevenueUpdate('test-file-id', mockContext, { period: 'true-up' });

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'true_up_delete',
          message: 'Delete query failed',
        })
      );
    });

    it('should bound true-up deletion by the file accept_date range (min..max)', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        makeRevenueRecord('6/1/2026'),
        makeRevenueRecord('3/1/2026'),
        makeRevenueRecord('9/1/2026'),
      ]);

      mockPeriodService.readByQuery.mockResolvedValue([]);
      mockRevenueService.readByQuery.mockResolvedValue([]);

      await processRevenueUpdate('test-file-id', mockContext, { period: 'true-up' });

      // Should query periods within the file's range (min 2026-03-01, max 2026-09-01),
      // so periods outside the file (e.g. later months) are left untouched.
      expect(mockPeriodService.readByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            period_date: { _gte: '2026-03-01', _lte: '2026-09-01' },
          }),
        })
      );
    });
  });

  describe('bulk insert', () => {
    it('bulk-inserts every distinct aggregated revenue row in createMany batches (count parity)', async () => {
      const rec = (acceptDate) => ({
        accept_date: acceptDate,
        land_class_code: 'Federal',
        land_category_code_desc: 'Offshore',
        state: '',
        county_code_desc: '',
        fips_code: '',
        agency_state_region_code_desc: 'GULF OF AMERICA',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '1000.00',
      });
      getFileContents.mockResolvedValue('');
      // Three different months → three distinct monthly periods → three distinct natural keys.
      parseCsv.mockReturnValue([rec('1/1/2026'), rec('2/1/2026'), rec('3/1/2026')]);

      // Distinct period ids so the three rows don't collapse onto a shared period FK.
      let pid = 0;
      mockPeriodService.createOne.mockImplementation(() => Promise.resolve(++pid));

      const result = await processRevenueUpdate('test-file-id', mockContext);

      // Count parity: as many rows inserted (across all createMany batches) as distinct keys.
      const inserted = mockRevenueService.createMany.mock.calls.flatMap((c) => c[0]);
      expect(inserted).toHaveLength(3);
      expect(result.revenueCreated).toBe(3);
    });

    it('skips a revenue row that already exists (idempotent monthly re-run)', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([{
        accept_date: '1/1/2026',
        land_class_code: 'Federal',
        land_category_code_desc: 'Offshore',
        state: '',
        county_code_desc: '',
        fips_code: '',
        agency_state_region_code_desc: 'GULF OF AMERICA',
        revenue_type: 'Royalties',
        mineral_production_code_desc: 'Oil & Gas',
        commodity: 'Oil',
        product_code_desc: 'Oil',
        revenue: '1000.00',
      }]);
      // A plain monthly load does no delete, so the Step 11 existence check must skip a row
      // that already exists for its natural key (location+period+commodity+fund all resolve
      // to 1 with the default mocks) — preventing a duplicate on re-run.
      mockRevenueService.readByQuery.mockResolvedValue([
        { location: 1, period: 1, commodity: 1, fund: 1 },
      ]);

      const result = await processRevenueUpdate('test-file-id', mockContext);

      expect(mockRevenueService.createMany).not.toHaveBeenCalled();
      expect(result.revenueCreated).toBe(0);
      expect(result.revenueSkipped).toBe(1);
    });
  });
});
