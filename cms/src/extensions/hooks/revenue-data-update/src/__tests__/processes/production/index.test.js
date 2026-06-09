import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processProductionUpdate } from '../../../processes/production/index.js';

// Mock all dependencies
vi.mock('../../../processes/shared/getFileContents.js', () => ({
  getFileContents: vi.fn(),
}));

vi.mock('../../../processes/shared/parseCsv.js', () => ({
  parseCsv: vi.fn(),
}));

vi.mock('../../../processes/production/fieldMappings.js', () => ({
  PRODUCTION_FIELD_MAP: {
    'Production Date': 'production_date',
    'Land Class': 'land_class',
  },
}));

vi.mock('../../../transformers/production/index.js', () => ({
  transformProductionRecord: vi.fn(),
  buildPeriodRecord: vi.fn(),
}));

// Import mocked modules
import { getFileContents } from '../../../processes/shared/getFileContents.js';
import { parseCsv } from '../../../processes/shared/parseCsv.js';
import {
  transformProductionRecord,
  buildPeriodRecord,
} from '../../../transformers/production/index.js';

// Mock ItemsService class
const createMockItemsService = () => ({
  readByQuery: vi.fn(),
  createOne: vi.fn(),
  deleteOne: vi.fn(),
});

describe('processProductionUpdate', () => {
  let mockContext;
  let mockServices;
  let mockLocationService;
  let mockPeriodService;
  let mockCommodityService;
  let mockProductionService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock services
    mockLocationService = createMockItemsService();
    mockPeriodService = createMockItemsService();
    mockCommodityService = createMockItemsService();
    mockProductionService = createMockItemsService();

    // Track which service is created for which collection
    const serviceMap = {
      location: mockLocationService,
      period: mockPeriodService,
      commodity: mockCommodityService,
      production: mockProductionService,
    };

    mockServices = {
      ItemsService: vi.fn((collection) => serviceMap[collection]),
    };

    mockContext = {
      services: mockServices,
      database: {},
      schema: {},
      accountability: {},
    };

    // Default mock implementations
    getFileContents.mockResolvedValue('mock,csv,content');
    parseCsv.mockReturnValue([]);
    transformProductionRecord.mockImplementation((record) => record);
  });

  it('should return result object with expected structure', async () => {
    const result = await processProductionUpdate('test-file-id', mockContext);

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

  it('should call getFileContents with correct parameters', async () => {
    await processProductionUpdate('test-file-id', mockContext);

    expect(getFileContents).toHaveBeenCalledWith('test-file-id', {
      services: mockServices,
      schema: {},
      accountability: {},
    });
  });

  it('should call parseCsv with file contents and field map', async () => {
    getFileContents.mockResolvedValue('Production Date,Land Class\n1/1/2024,Federal');

    await processProductionUpdate('test-file-id', mockContext);

    expect(parseCsv).toHaveBeenCalledWith(
      'Production Date,Land Class\n1/1/2024,Federal',
      expect.objectContaining({ 'Production Date': 'production_date' })
    );
  });

  it('should skip records when transformProductionRecord returns null', async () => {
    parseCsv.mockReturnValue([
      { production_date: '1/1/2024', land_class: 'Federal', commodity: 'Oil Prod Vol (bbl)', volume: '100' },
      { production_date: '', land_class: '', commodity: '', volume: '' },
    ]);

    transformProductionRecord
      .mockReturnValueOnce({ production_date: '1/1/2024', land_class: 'Federal', commodity: 'Oil Prod Vol (bbl)', volume: '100' })
      .mockReturnValueOnce(null); // Second record filtered out

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.recordsProcessed).toBe(1);
    expect(result.recordsSkipped).toBe(1);
  });

  it('should create new location record when it does not exist', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    // Location does not exist
    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('new-location-id');

    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('new-production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(mockLocationService.createOne).toHaveBeenCalled();
    expect(result.locationsCreated).toBe(1);
  });

  it('should use existing location record when it exists', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    // Location already exists
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('new-production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(mockLocationService.createOne).not.toHaveBeenCalled();
    expect(result.locationsCreated).toBe(0);
  });

  it('should create new period record when it does not exist', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);

    // Period does not exist
    mockPeriodService.readByQuery
      .mockResolvedValueOnce([]) // First call: check if period exists
      .mockResolvedValueOnce([]); // Second call: get periods to delete
    mockPeriodService.createOne.mockResolvedValue('new-period-id');

    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('new-production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(mockPeriodService.createOne).toHaveBeenCalled();
    expect(result.periodsCreated).toBe(1);
  });

  it('should handle location insert error gracefully', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    // Location read fails
    mockLocationService.readByQuery.mockRejectedValue(new Error('Database error'));

    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'location_insert',
        message: 'Database error',
      })
    );
  });

  it('should skip production when foreign keys are missing', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    // Location insert fails (no ID)
    mockLocationService.readByQuery.mockRejectedValue(new Error('Database error'));
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processProductionUpdate('test-file-id', mockContext);

    // Production should be skipped due to missing location ID
    expect(result.productionCreated).toBe(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'production_skip',
        message: 'Missing foreign key',
      })
    );
  });

  it('should skip production when period record is null', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    // Period record is null (invalid date)
    buildPeriodRecord.mockReturnValue(null);

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'production_skip',
        message: 'Invalid period date',
      })
    );
  });

  it('should aggregate duplicate production records', async () => {
    // Two records with same location, period, commodity
    const mockRecord1 = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };
    const mockRecord2 = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '500',
    };

    parseCsv.mockReturnValue([mockRecord1, mockRecord2]);
    transformProductionRecord.mockImplementation((record) => record);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    // Only one production should be created (aggregated)
    expect(mockProductionService.createOne).toHaveBeenCalledTimes(1);
    expect(mockProductionService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        volume: 1500, // 1000 + 500
        duplicate_no: 2,
      })
    );
    expect(result.productionCreated).toBe(1);
  });

  it('should handle fatal error and return error in result', async () => {
    getFileContents.mockRejectedValue(new Error('File not found'));

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: 'File not found',
      })
    );
    expect(result.completedAt).not.toBeNull();
  });

  it('should deduplicate location records with same key', async () => {
    // Two records that produce the same location key
    const mockRecord1 = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };
    const mockRecord2 = {
      production_date: '2/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Gas Prod Vol (mcf)',
      volume: '500',
    };

    parseCsv.mockReturnValue([mockRecord1, mockRecord2]);
    transformProductionRecord.mockImplementation((record) => record);

    buildPeriodRecord
      .mockReturnValueOnce({ period_date: '2024-01-01', type: 'Monthly' })
      .mockReturnValueOnce({ period_date: '2024-02-01', type: 'Monthly' });

    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('location-id');
    mockPeriodService.readByQuery.mockResolvedValue([]);
    mockPeriodService.createOne.mockResolvedValue('period-id');
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    // Location should only be created once (deduplicated)
    expect(mockLocationService.readByQuery).toHaveBeenCalledTimes(1);
    expect(result.locationsCreated).toBe(1);
  });

  it('should set success to true when no errors occur', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle production insert error', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockRejectedValue(new Error('Insert failed'));

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.productionCreated).toBe(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'production_insert',
        message: 'Insert failed',
      })
    );
  });

  it('should parse volume correctly with commas', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1,234,567.89',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    await processProductionUpdate('test-file-id', mockContext);

    expect(mockProductionService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        volume: 1234567.89,
      })
    );
  });

  it('should handle empty records array', async () => {
    parseCsv.mockReturnValue([]);

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.recordsProcessed).toBe(0);
    expect(result.recordsSkipped).toBe(0);
    expect(result.success).toBe(true);
  });

  it('should handle commodity not found error', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Unknown Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    // Commodity not found
    mockCommodityService.readByQuery.mockResolvedValue([]);

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'commodity_not_found',
        name: 'Unknown',
        product: 'Unknown (bbl)',
      })
    );
  });

  it('should handle commodity read error', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockRejectedValue(new Error('Commodity read failed'));

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'commodity_read',
        name: 'Oil',
        product: 'Oil (bbl)',
        message: 'Commodity read failed',
      })
    );
  });

  it('should delete existing production records for the date range', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);

    // First call: check if period exists, Second call: get periods to delete
    mockPeriodService.readByQuery
      .mockResolvedValueOnce([{ id: 'period-id' }])
      .mockResolvedValueOnce([{ id: 'period-id-1' }, { id: 'period-id-2' }]);

    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);

    // Existing production records to delete
    mockProductionService.readByQuery.mockResolvedValue([
      { id: 'prod-1' },
      { id: 'prod-2' },
    ]);
    mockProductionService.deleteOne.mockResolvedValue(true);
    mockProductionService.createOne.mockResolvedValue('new-production-id');

    const result = await processProductionUpdate('test-file-id', mockContext);

    expect(mockProductionService.deleteOne).toHaveBeenCalledTimes(2);
    expect(result.productionDeleted).toBe(2);
  });

  it('should extract unit from commodity string', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    await processProductionUpdate('test-file-id', mockContext);

    expect(mockProductionService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        unit: 'bbl',
        unit_abbr: 'bbl',
      })
    );
  });

  it('should derive state as Nationwide for Federal land class', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Federal',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('location-id');
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    await processProductionUpdate('test-file-id', mockContext);

    expect(mockLocationService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'Nationwide',
      })
    );
  });

  it('should derive state as Native American for non-Federal land class', async () => {
    const mockRecord = {
      production_date: '1/1/2024',
      land_class: 'Indian',
      land_category: 'Onshore',
      commodity: 'Oil Prod Vol (bbl)',
      volume: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformProductionRecord.mockReturnValue(mockRecord);

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('location-id');
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockProductionService.readByQuery.mockResolvedValue([]);
    mockProductionService.createOne.mockResolvedValue('production-id');

    await processProductionUpdate('test-file-id', mockContext);

    expect(mockLocationService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'Native American',
      })
    );
  });
});
