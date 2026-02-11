import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processRevenueUpdate } from '../../../processes/revenue/index.js';

// Mock shared utilities
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
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
      // But should only create one revenue record (aggregated)
      expect(mockRevenueService.createOne).toHaveBeenCalledTimes(1);
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

      // Should create only one revenue record (aggregated)
      expect(mockRevenueService.createOne).toHaveBeenCalledTimes(1);
      // The aggregated amount should be 1500
      expect(mockRevenueService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          revenue: 1500,
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
});
