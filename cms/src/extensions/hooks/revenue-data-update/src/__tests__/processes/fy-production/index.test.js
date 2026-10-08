import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFYProductionUpdate } from '../../../processes/fy-production/index.js';

// Mock shared utilities
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
  // Real behavior for the batch helpers so the bulk-insert path runs; yield is a no-op.
  yieldToEventLoop: () => Promise.resolve(),
  chunk: (items, size) => {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  },
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

    // The FY loader preloads commodities (mineral_lease_type empty) keyed by lowercased
    // product; the real transformFYProductionRecord title-cases 'Gas (Mcf)' -> 'Gas (mcf)',
    // so the preloaded commodity's product must match case-insensitively.
    mockCommodityService = {
      readByQuery: vi.fn().mockResolvedValue([{ id: 1, product: 'Gas (mcf)' }]),
    };

    mockProductionService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
      createMany: vi.fn().mockResolvedValue([]),
      deleteOne: vi.fn().mockResolvedValue(undefined),
      deleteMany: vi.fn().mockResolvedValue([]),
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
    it('preloads commodities by product and resolves case-insensitively', async () => {
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

      // One preload query scoped to mineral_lease_type empty (not a per-key name/product lookup).
      expect(mockCommodityService.readByQuery).toHaveBeenCalledWith(expect.objectContaining({
        filter: expect.objectContaining({ mineral_lease_type: { _empty: true } }),
      }));
      const inserted = mockProductionService.createMany.mock.calls.flatMap((c) => c[0]);
      expect(inserted).toHaveLength(1);
      expect(inserted[0].commodity).toBe(1);
    });

    it('drops (does not error) an unmatched product, mirroring the inner join', async () => {
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

      expect(result.errors.some(e => e.type === 'commodity_not_found')).toBe(false);
      expect(result.commoditiesUnmatched).toBe(1);
      expect(mockProductionService.createMany).not.toHaveBeenCalled();
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

      // Should create only one production record (aggregated), bulk-inserted via createMany.
      expect(mockProductionService.createMany).toHaveBeenCalledTimes(1);
      expect(mockProductionService.createMany).toHaveBeenCalledWith([
        expect.objectContaining({
          volume: 500,
          duplicate_no: 2,
        }),
      ]);
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

  describe('bulk insert', () => {
    it('inserts every distinct aggregated row via createMany (count parity)', async () => {
      const mk = (year) => ({
        fiscal_year: year, land_class: 'Federal', land_category: 'Offshore',
        state: '', county: '', fips_code: '', offshore_region: 'Offshore Gulf of America',
        product: 'Gas (Mcf)', volume: '100',
      });
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([mk('2021'), mk('2022'), mk('2023')]);
      // Three distinct fiscal years → three distinct periods → three distinct natural keys.
      mockPeriodService.readByQuery.mockResolvedValue([]);
      mockPeriodService.createOne
        .mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(3);

      const result = await processFYProductionUpdate('test-file-id', mockContext);

      const inserted = mockProductionService.createMany.mock.calls.flatMap((c) => c[0]);
      expect(inserted).toHaveLength(3);
      expect(result.productionCreated).toBe(3);
    });
  });
});
