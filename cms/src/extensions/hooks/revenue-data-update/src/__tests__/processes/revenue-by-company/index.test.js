import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processRevenueByCompanyUpdate } from '../../../processes/revenue-by-company/index.js';

// Mock shared utilities
vi.mock('../../../processes/shared/index.js', () => ({
  getFileContents: vi.fn(),
  parseCsv: vi.fn(),
}));

import { getFileContents, parseCsv } from '../../../processes/shared/index.js';

describe('processRevenueByCompanyUpdate', () => {
  let mockContext;
  let mockRevenueByCompanyService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRevenueByCompanyService = {
      readByQuery: vi.fn().mockResolvedValue([]),
      createOne: vi.fn().mockResolvedValue(1),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };

    mockContext = {
      services: {
        ItemsService: vi.fn((collection) => {
          switch (collection) {
            case 'federal_revenue_by_company':
              return mockRevenueByCompanyService;
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

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

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

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(getFileContents).toHaveBeenCalledWith('test-file-id', expect.any(Object));
    });
  });

  describe('CSV parsing', () => {
    it('should call parseCsv with file contents and field map', async () => {
      getFileContents.mockResolvedValue('csv content');
      parseCsv.mockReturnValue([]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(parseCsv).toHaveBeenCalledWith('csv content', expect.objectContaining({
        'Calendar Year': 'calendar_year',
        'Corporate Name': 'corporate_name',
        'Revenue Type': 'revenue_agency_type',
        'Commodity': 'commodity',
        'Revenues': 'raw_revenue',
      }));
    });
  });

  describe('record transformation', () => {
    it('should transform commodity order for known commodities', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '$1,000.00',
        },
      ]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity: 'Oil',
          commodity_order: '1',
        })
      );
    });

    it('should transform Oil & Gas to Oil & gas (pre-production)', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil & Gas',
          raw_revenue: '$500.00',
        },
      ]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity: 'Oil & gas (pre-production)',
          commodity_order: '3',
        })
      );
    });

    it('should parse revenue from accounting notation', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '($1,234.56)',
        },
      ]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          raw_revenue: '-$1,234.56',
          revenue: -1234.56,
        })
      );
    });

    it('should split revenue_agency_type into agency and type', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Gas',
          raw_revenue: '$100.00',
        },
      ]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          revenue_agency: 'ONRR',
          revenue_type: 'Royalties',
        })
      );
    });

    it('should use first 5 chars as commodity_order for unknown commodities', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Geothermal',
          raw_revenue: '$100.00',
        },
      ]);

      await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity_order: 'Geoth',
        })
      );
    });
  });

  describe('deletion of prior year data', () => {
    it('should delete existing records for calendar years in upload', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '$1,000.00',
        },
      ]);

      mockRevenueByCompanyService.readByQuery.mockResolvedValue([
        { id: 'existing-1' },
        { id: 'existing-2' },
      ]);

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.readByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { calendar_year: { _eq: 2023 } },
        })
      );
      expect(mockRevenueByCompanyService.deleteOne).toHaveBeenCalledTimes(2);
      expect(result.recordsDeleted).toBe(2);
    });

    it('should handle delete errors gracefully', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '$1,000.00',
        },
      ]);

      mockRevenueByCompanyService.readByQuery.mockRejectedValueOnce(new Error('Delete query failed'));

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

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
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '$1,000.00',
        },
        {
          calendar_year: '2023',
          corporate_name: 'Other Corp',
          revenue_agency_type: 'ONRR - Rents',
          commodity: 'Gas',
          raw_revenue: '$500.00',
        },
      ]);

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(mockRevenueByCompanyService.createOne).toHaveBeenCalledTimes(2);
      expect(result.recordsCreated).toBe(2);
    });

    it('should handle insert errors gracefully', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([
        {
          calendar_year: '2023',
          corporate_name: 'Test Corp',
          revenue_agency_type: 'ONRR - Royalties',
          commodity: 'Oil',
          raw_revenue: '$1,000.00',
        },
      ]);

      mockRevenueByCompanyService.createOne.mockRejectedValue(new Error('Insert failed'));

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

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

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('File not found');
    });

    it('should set success to true when no errors occur', async () => {
      getFileContents.mockResolvedValue('');
      parseCsv.mockReturnValue([]);

      const result = await processRevenueByCompanyUpdate('test-file-id', mockContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
