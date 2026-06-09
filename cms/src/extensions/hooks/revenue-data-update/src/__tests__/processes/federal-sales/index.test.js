import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFederalSalesUpdate } from '../../../processes/federal-sales/index.js';

// Mock shared utilities
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
}));

import { getFileContents, parseCsv } from '../../../processes/shared/index.js';

describe('processFederalSalesUpdate', () => {
  let mockContext;
  let mockFederalSalesService;

  const makeSalesRecord = (overrides = {}) => ({
    calendar_year: '2023',
    land_class: 'Federal',
    land_category: 'Offshore',
    state_offshore_region: 'Gulf of America',
    revenue_type: 'Royalties',
    commodity: 'Oil',
    sales_volume: '354736.48',
    gas_volume: '0',
    sales_value: '37418413.98',
    royalty_value_prior_to_allowance: '6236061.32',
    transportation_allowance: '-484896.14',
    processing_allowance: '0',
    royalty_value_less_allowance: '5751165.18',
    effective_royalty_rate: '0.15',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockFederalSalesService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };

    mockContext = {
      services: {
        ItemsService: vi.fn((collection) => {
          switch (collection) {
            case 'federal_sales':
              return mockFederalSalesService;
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

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result).toHaveProperty('fileId', 'test-file-id');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('recordsProcessed');
      expect(result).toHaveProperty('recordsSkipped');
      expect(result).toHaveProperty('recordsCreated');
      expect(result).toHaveProperty('recordsDeleted');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('file retrieval', () => {
    it('should call getFileContents with the file ID', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(getFileContents).toHaveBeenCalledWith('test-file-id', expect.any(Object));
    });
  });

  describe('CSV parsing', () => {
    it('should call parseCsv with file contents and field map', async () => {
      getFileContents.mockResolvedValue('csv content');
      parseCsv.mockReturnValue([]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(parseCsv).toHaveBeenCalledWith('csv content', expect.objectContaining({
        'Calendar Year': 'calendar_year',
        'Land Class': 'land_class',
        'Sales Volume': 'sales_volume',
        'Effective Royalty Rate': 'effective_royalty_rate',
      }));
    });
  });

  describe('record transformation', () => {
    it('should parse calendar_year as integer', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          calendar_year: 2023,
        })
      );
    });

    it('should parse numeric fields as floats', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          sales_volume: 354736.48,
          gas_volume: 0,
          sales_value: 37418413.98,
          royalty_value_prior_to_allowance: 6236061.32,
          transportation_allowance: -484896.14,
          processing_allowance: 0,
          royalty_value_less_allowance: 5751165.18,
          effective_royalty_rate: 0.15,
        })
      );
    });

    it('should handle comma-separated numeric values', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord({ sales_value: '1,234,567.89' })]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          sales_value: 1234567.89,
        })
      );
    });

    it('should pass string fields through as-is', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          land_class: 'Federal',
          land_category: 'Offshore',
          state_offshore_region: 'Gulf of America',
          revenue_type: 'Royalties',
          commodity: 'Oil',
        })
      );
    });

    it('should skip records with invalid calendar year', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord({ calendar_year: '' })]);

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result.recordsSkipped).toBe(1);
      expect(result.recordsProcessed).toBe(0);
      expect(mockFederalSalesService.createOne).not.toHaveBeenCalled();
    });
  });

  describe('deletion of prior year data', () => {
    it('should delete existing records for calendar years in upload', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      mockFederalSalesService.readByQuery.mockResolvedValue([
        { id: 'existing-1' },
        { id: 'existing-2' },
      ]);

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.readByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { calendar_year: { _eq: 2023 } },
        })
      );
      expect(mockFederalSalesService.deleteOne).toHaveBeenCalledTimes(2);
      expect(result.recordsDeleted).toBe(2);
    });

    it('should handle delete errors gracefully', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      mockFederalSalesService.readByQuery.mockRejectedValueOnce(new Error('Delete query failed'));

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'record_delete',
          message: 'Delete query failed',
        })
      );
    });
  });

  describe('record insertion', () => {
    it('should insert transformed records', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        makeSalesRecord(),
        makeSalesRecord({ commodity: 'Gas', gas_volume: '1000' }),
      ]);

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(mockFederalSalesService.createOne).toHaveBeenCalledTimes(2);
      expect(result.recordsCreated).toBe(2);
    });

    it('should handle insert errors gracefully', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([makeSalesRecord()]);

      mockFederalSalesService.createOne.mockRejectedValue(new Error('Insert failed'));

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result.recordsCreated).toBe(0);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'record_insert',
          message: 'Insert failed',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle file retrieval errors', async () => {
      getFileContents.mockRejectedValue(new Error('File not found'));

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('File not found');
    });

    it('should set success to true when no errors occur', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      const result = await processFederalSalesUpdate('test-file-id', mockContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
