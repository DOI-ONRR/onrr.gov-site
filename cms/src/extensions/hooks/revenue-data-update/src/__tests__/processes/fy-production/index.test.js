import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFYProductionUpdate } from '../../../processes/fy-production/index.js';

// Mock shared utilities
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
}));

import { getFileContents, parseCsv } from '../../../processes/shared/index.js';

describe('processFYProductionUpdate', () => {
  let mockContext;
  let mockLocationService;
  let mockPeriodService;
  let mockCommodityService;
  let mockProductionService;
  let mockCountyLookupService;

  beforeEach(() => {
    vi.clearAllMocks();

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

    mockProductionService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };

    mockCountyLookupService = {
      readByQuery: vi.fn().mockResolvedValue([]),
    };

    mockContext = {
      services: {
        ItemsService: vi.fn((collection) => {
          switch (collection) {
            case 'location':
              return mockLocationService;
            case 'period':
              return mockPeriodService;
            case 'commodity':
              return mockCommodityService;
            case 'production':
              return mockProductionService;
            case 'county_lookup':
              return mockCountyLookupService;
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

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(result).toHaveProperty('fileId', 'test-file-id');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('recordsProcessed');
      expect(result).toHaveProperty('recordsSkipped');
      expect(result).toHaveProperty('locationsCreated');
      expect(result).toHaveProperty('periodsCreated');
      expect(result).toHaveProperty('productionCreated');
      expect(result).toHaveProperty('productionDeleted');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('file retrieval', () => {
    it('should call getFileContents with the file ID', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      await processFYProductionUpdate('test-file-id', mockContext);

      expect(getFileContents).toHaveBeenCalledWith('test-file-id', expect.any(Object));
    });
  });

  describe('CSV parsing', () => {
    it('should call parseCsv with file contents and field map', async () => {
      getFileContents.mockResolvedValue('csv content');
      parseCsv.mockReturnValue([]);

      await processFYProductionUpdate('test-file-id', mockContext);

      expect(parseCsv).toHaveBeenCalledWith('csv content', expect.objectContaining({
        'Fiscal Year': 'fiscal_year',
        'Volume': 'volume',
      }));
    });
  });

  describe('record transformation', () => {
    it('should skip empty records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        { fiscal_year: null, volume: null, product: null },
      ]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(result.recordsSkipped).toBe(1);
      expect(result.recordsProcessed).toBe(0);
    });

    it('should process valid records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(result.recordsProcessed).toBe(1);
    });
  });

  describe('offshore region transformation', () => {
    it('should transform Offshore Gulf of America', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);

      await processFYProductionUpdate('test-file-id', mockContext);

      expect(mockLocationService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          offshore_region: 'Gulf of America',
          fips_code: 'GMR',
        })
      );
    });
  });

  describe('location handling', () => {
    it('should create location when not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);
      mockLocationService.readByQuery.mockResolvedValue([]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(mockLocationService.createOne).toHaveBeenCalled();
      expect(result.locationsCreated).toBeGreaterThan(0);
    });

    it('should use existing location when found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);
      mockLocationService.readByQuery.mockResolvedValue([{ id: 99 }]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(mockLocationService.createOne).not.toHaveBeenCalled();
      expect(result.locationsCreated).toBe(0);
    });
  });

  describe('period handling', () => {
    it('should create Fiscal Year period when not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);
      mockPeriodService.readByQuery.mockResolvedValue([]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(mockPeriodService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Fiscal Year',
          calendar_year: 2023,
          period_date: '2023-01-01',
        })
      );
      expect(result.periodsCreated).toBeGreaterThan(0);
    });
  });

  describe('commodity handling', () => {
    it('should lookup commodity', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '1000',
        },
      ]);

      await processFYProductionUpdate('test-file-id', mockContext);

      expect(mockCommodityService.readByQuery).toHaveBeenCalledWith(expect.objectContaining({
        filter: expect.objectContaining({
          name: { _eq: 'Gas' },
        }),
      }));
    });

    it('should add error when commodity not found', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Unknown (unit)',
          volume: '1000',
        },
      ]);
      mockCommodityService.readByQuery.mockResolvedValue([]);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(result.errors.some(e => e.type === 'commodity_not_found')).toBe(true);
    });
  });

  describe('production aggregation', () => {
    it('should aggregate duplicate production records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '500',
        },
        {
          fiscal_year: '2023',
          land_class: 'Federal',
          land_category: 'Offshore',
          state: '',
          county: '',
          fips_code: '',
          offshore_region: 'Offshore Gulf of America',
          product: 'Gas (Mcf)',
          volume: '500',
        },
      ]);

      await processFYProductionUpdate('test-file-id', mockContext);

      // Should create only one production record (aggregated)
      expect(mockProductionService.createOne).toHaveBeenCalledTimes(1);
      expect(mockProductionService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          volume: 500,
          duplicate_no: 2,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle file retrieval errors', async () => {
      getFileContents.mockRejectedValue(new Error('File not found'));

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('File not found');
    });
  });
});
