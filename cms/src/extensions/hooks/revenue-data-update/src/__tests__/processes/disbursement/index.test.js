import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processDisbursementUpdate } from '../../../processes/disbursement/index.js';

// Mock all dependencies
vi.mock('../../../processes/shared/getFileContents.js', () => ({
  getFileContents: vi.fn(),
}));

vi.mock('../../../processes/shared/parseCsv.js', () => ({
  parseCsv: vi.fn(),
}));

vi.mock('../../../processes/disbursement/fieldMappings.js', () => ({
  DISBURSEMENT_FIELD_MAP: {
    'Month': 'month',
    'Calendar Year': 'calendar_year',
  },
}));

vi.mock('../../../transformers/disbursement/index.js', () => ({
  transformDisbursementRecord: vi.fn(),
  transformFipsCode: vi.fn(),
  createFipsCodeLookup: vi.fn(),
  buildFundRecord: vi.fn(),
  buildLocationRecord: vi.fn(),
  buildPeriodRecord: vi.fn(),
}));

// Import mocked modules
import { getFileContents } from '../../../processes/shared/getFileContents.js';
import { parseCsv } from '../../../processes/shared/parseCsv.js';
import {
  transformDisbursementRecord,
  transformFipsCode,
  createFipsCodeLookup,
  buildFundRecord,
  buildLocationRecord,
  buildPeriodRecord,
} from '../../../transformers/disbursement/index.js';

// Mock ItemsService class
const createMockItemsService = () => ({
  readByQuery: vi.fn(),
  createOne: vi.fn(),
});

describe('processDisbursementUpdate', () => {
  let mockContext;
  let mockServices;
  let mockFundService;
  let mockLocationService;
  let mockPeriodService;
  let mockCommodityService;
  let mockDisbursementService;
  let mockCountyLookupService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock services
    mockFundService = createMockItemsService();
    mockLocationService = createMockItemsService();
    mockPeriodService = createMockItemsService();
    mockCommodityService = createMockItemsService();
    mockDisbursementService = createMockItemsService();
    mockCountyLookupService = createMockItemsService();

    // Track which service is created for which collection
    const serviceMap = {
      fund: mockFundService,
      location: mockLocationService,
      period: mockPeriodService,
      commodity: mockCommodityService,
      disbursement: mockDisbursementService,
      county_lookup: mockCountyLookupService,
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
    createFipsCodeLookup.mockReturnValue(vi.fn());
    transformDisbursementRecord.mockImplementation((record) => record);
    transformFipsCode.mockImplementation((record) => Promise.resolve(record));
  });

  it('should return result object with expected structure', async () => {
    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result).toHaveProperty('fileId', 'test-file-id');
    expect(result).toHaveProperty('startedAt');
    expect(result).toHaveProperty('completedAt');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('recordsProcessed');
    expect(result).toHaveProperty('recordsSkipped');
    expect(result).toHaveProperty('fundsCreated');
    expect(result).toHaveProperty('locationsCreated');
    expect(result).toHaveProperty('periodsCreated');
    expect(result).toHaveProperty('disbursementsCreated');
    expect(result).toHaveProperty('errors');
  });

  it('should call getFileContents with correct parameters', async () => {
    await processDisbursementUpdate('test-file-id', mockContext);

    expect(getFileContents).toHaveBeenCalledWith('test-file-id', {
      services: mockServices,
      schema: {},
      accountability: {},
    });
  });

  it('should call parseCsv with file contents and field map', async () => {
    getFileContents.mockResolvedValue('Month,Calendar Year\nJanuary,2024');

    await processDisbursementUpdate('test-file-id', mockContext);

    expect(parseCsv).toHaveBeenCalledWith(
      'Month,Calendar Year\nJanuary,2024',
      expect.objectContaining({ Month: 'month' })
    );
  });

  it('should skip records when transformDisbursementRecord returns null', async () => {
    parseCsv.mockReturnValue([
      { month: 'January', calendar_year: '2024', disbursement: '100' },
      { month: 'February', calendar_year: '2024', disbursement: '-' },
    ]);

    transformDisbursementRecord
      .mockReturnValueOnce({ month: 'January', calendar_year: '2024', disbursement: '100' })
      .mockReturnValueOnce(null); // Second record filtered out

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.recordsProcessed).toBe(1);
    expect(result.recordsSkipped).toBe(1);
  });

  it('should create new fund record when it does not exist', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
      type: 'Monthly',
    });

    // Fund does not exist
    mockFundService.readByQuery.mockResolvedValue([]);
    mockFundService.createOne.mockResolvedValue('new-fund-id');

    // Location exists
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);

    // Period exists
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);

    // Commodity exists
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    // Disbursement insert succeeds
    mockDisbursementService.createOne.mockResolvedValue('new-disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(mockFundService.createOne).toHaveBeenCalled();
    expect(result.fundsCreated).toBe(1);
  });

  it('should use existing fund record when it exists', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    // Fund already exists
    mockFundService.readByQuery.mockResolvedValue([{ id: 'existing-fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('new-disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(mockFundService.createOne).not.toHaveBeenCalled();
    expect(result.fundsCreated).toBe(0);
  });

  it('should create new location record when it does not exist', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'existing-fund-id' }]);

    // Location does not exist
    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('new-location-id');

    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('new-disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(mockLocationService.createOne).toHaveBeenCalled();
    expect(result.locationsCreated).toBe(1);
  });

  it('should create new period record when it does not exist', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'existing-fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);

    // Period does not exist
    mockPeriodService.readByQuery.mockResolvedValue([]);
    mockPeriodService.createOne.mockResolvedValue('new-period-id');

    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('new-disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(mockPeriodService.createOne).toHaveBeenCalled();
    expect(result.periodsCreated).toBe(1);
  });

  it('should handle fund insert error gracefully', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    // Fund read fails
    mockFundService.readByQuery.mockRejectedValue(new Error('Database error'));

    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'fund_insert',
        message: 'Database error',
      })
    );
  });

  it('should skip disbursement when foreign keys are missing', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    // Fund insert fails (no ID)
    mockFundService.readByQuery.mockRejectedValue(new Error('Database error'));
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'existing-period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    // Disbursement should be skipped due to missing fund ID
    expect(result.disbursementsCreated).toBe(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'disbursement_skip',
        message: 'Missing foreign key',
      })
    );
  });

  it('should skip disbursement when period record is null', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    // Period record is null (invalid date)
    buildPeriodRecord.mockReturnValue(null);

    mockFundService.readByQuery.mockResolvedValue([{ id: 'existing-fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'existing-location-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'existing-commodity-id' }]);

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'disbursement_skip',
        message: 'Invalid period date',
      })
    );
  });

  it('should aggregate duplicate disbursement records', async () => {
    // Two records with same fund, location, period, commodity
    const mockRecord1 = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };
    const mockRecord2 = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '500',
    };

    parseCsv.mockReturnValue([mockRecord1, mockRecord2]);
    transformDisbursementRecord.mockImplementation((record) => record);
    transformFipsCode.mockImplementation((record) => Promise.resolve(record));

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    // Only one disbursement should be created (aggregated)
    expect(mockDisbursementService.createOne).toHaveBeenCalledTimes(1);
    expect(mockDisbursementService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1500, // 1000 + 500
        duplicate_no: 2,
      })
    );
    expect(result.disbursementsCreated).toBe(1);
  });

  it('should handle fatal error and return error in result', async () => {
    getFileContents.mockRejectedValue(new Error('File not found'));

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: 'File not found',
      })
    );
    expect(result.completedAt).not.toBeNull();
  });

  it('should deduplicate fund records with same key', async () => {
    // Two records that produce the same fund key
    const mockRecord1 = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };
    const mockRecord2 = {
      month: 'February',
      calendar_year: '2024',
      commodity: 'Gas',
      disbursement: '500',
    };

    parseCsv.mockReturnValue([mockRecord1, mockRecord2]);
    transformDisbursementRecord.mockImplementation((record) => record);
    transformFipsCode.mockImplementation((record) => Promise.resolve(record));

    // Both records produce the same fund record
    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    // Different location records
    buildLocationRecord
      .mockReturnValueOnce({
        land_class: 'Onshore',
        land_category: 'Public',
        state: 'TX',
        county: 'Harris',
        fips_code: '48201',
      })
      .mockReturnValueOnce({
        land_class: 'Onshore',
        land_category: 'Public',
        state: 'NM',
        county: 'Lea',
        fips_code: '35025',
      });

    buildPeriodRecord
      .mockReturnValueOnce({ period_date: '2024-01-01' })
      .mockReturnValueOnce({ period_date: '2024-02-01' });

    mockFundService.readByQuery.mockResolvedValue([]);
    mockFundService.createOne.mockResolvedValue('fund-id');
    mockLocationService.readByQuery.mockResolvedValue([]);
    mockLocationService.createOne.mockResolvedValue('location-id');
    mockPeriodService.readByQuery.mockResolvedValue([]);
    mockPeriodService.createOne.mockResolvedValue('period-id');
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    // Fund should only be created once (deduplicated)
    expect(mockFundService.readByQuery).toHaveBeenCalledTimes(1);
    expect(result.fundsCreated).toBe(1);
  });

  it('should set success to true when no errors occur', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('disbursement-id');

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle disbursement insert error', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockDisbursementService.createOne.mockRejectedValue(new Error('Insert failed'));

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.disbursementsCreated).toBe(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'disbursement_insert',
        message: 'Insert failed',
      })
    );
  });

  it('should parse disbursement amount correctly', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Oil',
      disbursement: '1,234,567.89',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockResolvedValue([{ id: 'commodity-id' }]);
    mockDisbursementService.createOne.mockResolvedValue('disbursement-id');

    await processDisbursementUpdate('test-file-id', mockContext);

    expect(mockDisbursementService.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1234567.89,
      })
    );
  });

  it('should handle empty records array', async () => {
    parseCsv.mockReturnValue([]);

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.recordsProcessed).toBe(0);
    expect(result.recordsSkipped).toBe(0);
    expect(result.success).toBe(true);
  });

  it('should handle commodity read error', async () => {
    const mockRecord = {
      month: 'January',
      calendar_year: '2024',
      commodity: 'Unknown Commodity',
      disbursement: '1000',
    };

    parseCsv.mockReturnValue([mockRecord]);
    transformDisbursementRecord.mockReturnValue(mockRecord);
    transformFipsCode.mockResolvedValue(mockRecord);

    buildFundRecord.mockReturnValue({
      fund_type: 'TestFund',
      fund_class: 'Class1',
      recipient: 'Recipient1',
      revenue_type: 'Revenue1',
      source: 'Source1',
      disbursement_type: 'Type1',
    });

    buildLocationRecord.mockReturnValue({
      land_class: 'Onshore',
      land_category: 'Public',
      state: 'TX',
      county: 'Harris',
      fips_code: '48201',
    });

    buildPeriodRecord.mockReturnValue({
      period_date: '2024-01-01',
    });

    mockFundService.readByQuery.mockResolvedValue([{ id: 'fund-id' }]);
    mockLocationService.readByQuery.mockResolvedValue([{ id: 'location-id' }]);
    mockPeriodService.readByQuery.mockResolvedValue([{ id: 'period-id' }]);
    mockCommodityService.readByQuery.mockRejectedValue(new Error('Commodity not found'));

    const result = await processDisbursementUpdate('test-file-id', mockContext);

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'commodity_read',
        commodity: 'Unknown Commodity',
        message: 'Commodity not found',
      })
    );
  });
});
