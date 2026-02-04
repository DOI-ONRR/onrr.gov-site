/**
 * Disbursement data update process.
 *
 * Processes a disbursement data file uploaded to Directus,
 * transforming and loading the reference data into the appropriate tables.
 */

import { getFileContents } from './getFileContents.js';
import { parseCsv } from './parseCsv.js';
import { DISBURSEMENT_FIELD_MAP } from './fieldMappings.js';
import {
  transformDisbursementRecord,
  transformFipsCode,
  createFipsCodeLookup,
  buildFundRecord,
  buildLocationRecord,
  buildPeriodRecord,
} from '../../transformers/disbursement/index.js';

/**
 * Main entry point for the disbursement update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @param {Object} context.services - Directus services (ItemsService, FilesService, etc.)
 * @param {Object} context.database - Knex database instance
 * @param {Object} context.schema - Database schema
 * @param {Object} context.accountability - User accountability info
 * @param {Object} context.getSchema - Function to get current schema
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processDisbursementUpdate(fileId, context) {
  const { services, database, schema, accountability } = context;

  const result = {
    fileId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    success: null,
    recordsProcessed: 0,
    recordsSkipped: 0,
    fundsCreated: 0,
    locationsCreated: 0,
    periodsCreated: 0,
    disbursementsCreated: 0,
    errors: [],
  };

  console.log('[Disbursement Update] Process started:', { fileId });

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = parseCsv(fileContents, DISBURSEMENT_FIELD_MAP);

    // Step 3 - Transform each record using disbursement transformers
    const { ItemsService } = services;
    const countyLookupService = new ItemsService('county_lookup', {
      schema,
      accountability,
    });
    const lookupFipsCode = createFipsCodeLookup(countyLookupService);

    const transformedRecords = [];
    for (const record of records) {
      // Apply synchronous transformations
      let transformed = transformDisbursementRecord(record);

      // Skip records filtered out by transformations (e.g., disbursement = '-')
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      // Apply async FIPS code lookup
      transformed = await transformFipsCode(transformed, lookupFipsCode);

      transformedRecords.push(transformed);
      result.recordsProcessed++;
    }

    // Steps 4-6: Build deduplicated reference data maps in a single pass
    // Maps store { record, id } - id is populated during insert/query phase
    const fundService = new ItemsService('fund', { schema, accountability });
    const locationService = new ItemsService('location', { schema, accountability });
    const periodService = new ItemsService('period', { schema, accountability });
    const commodityService = new ItemsService('commodity', { schema, accountability });

    const fundMap = new Map();
    const locationMap = new Map();
    const periodMap = new Map();
    const commodityMap = new Map();

    for (const record of transformedRecords) {
      // Build and deduplicate fund record
      const fundRecord = buildFundRecord(record);
      const fundKey = [
        fundRecord.fund_type,
        fundRecord.fund_class,
        fundRecord.recipient,
        fundRecord.revenue_type,
        fundRecord.source,
        fundRecord.disbursement_type,
      ].join('|');
      if (!fundMap.has(fundKey)) {
        fundMap.set(fundKey, { record: fundRecord, id: null });
      }

      // Build and deduplicate location record
      const locationRecord = buildLocationRecord(record);
      const locationKey = [
        locationRecord.land_class,
        locationRecord.land_category,
        locationRecord.state,
        locationRecord.county,
        locationRecord.fips_code,
      ].join('|');
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, { record: locationRecord, id: null });
      }

      // Build and deduplicate period record
      const periodRecord = buildPeriodRecord(record);
      if (periodRecord !== null) {
        const periodKey = periodRecord.period_date;
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, { record: periodRecord, id: null });
        }
      }

      // Track and deduplicate commodity
      if (!commodityMap.has(record.commodity)) {
        commodityMap.set(record.commodity, { commodity: record.commodity, id: null});
      }
    }

    // Step 4 - Query/insert fund records and store IDs
    for (const [key, entry] of fundMap.entries()) {
      try {
        // Check if fund already exists
        const existing = await fundService.readByQuery({
          filter: {
            type: { _eq: entry.record.type },
            class: { _eq: entry.record.class },
            recipient: { _eq: entry.record.recipient },
            revenue_type: { _eq: entry.record.revenue_type },
            source: { _eq: entry.record.source },
            disbursement_type: { _eq: entry.record.disbursement_type },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          const newId = await fundService.createOne(entry.record);
          entry.id = newId;
          result.fundsCreated++;
        }
      } catch (error) {
        result.errors.push({
          type: 'fund_insert',
          record: entry.record,
          message: error.message,
        });
      }
    }

    // Step 5 - Query/insert location records and store IDs
    for (const [key, entry] of locationMap.entries()) {
      try {
        // Check if location already exists
        const existing = await locationService.readByQuery({
          filter: {
            land_class: { _eq: entry.record.land_class },
            land_category: { _eq: entry.record.land_category },
            _and: [
              {_or: [
                {county: { _eq: entry.record.county }},
                {county: { _empty: true }}
              ]},
              {_or: [
                {state: { _eq: entry.record.state }},
                {state: { _empty: true }}
              ]},
              {_or: [
                {fips_code: { _eq: entry.record.fips_code }},
                {fips_code: { _empty: true }}
              ]}
            ],
            offshore_region: { _empty: true },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          const newId = await locationService.createOne(entry.record);
          entry.id = newId;
          result.locationsCreated++;
        }
      } catch (error) {
        result.errors.push({
          type: 'location_insert',
          record: entry.record,
          message: error.message,
        });
      }
    }

    // Step 6 - Query/insert period records and store IDs
    for (const [key, entry] of periodMap.entries()) {
      try {
        // Check if period already exists
        const existing = await periodService.readByQuery({
          filter: {
            period_date: { _eq: entry.record.period_date },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          const newId = await periodService.createOne(entry.record);
          entry.id = newId;
          result.periodsCreated++;
        }
      } catch (error) {
        result.errors.push({
          type: 'period_insert',
          record: entry.record,
          message: error.message,
        });
      }
    }

    // Step 7 - Retrieve commodity record
    for (const [key, entry] of commodityMap.entries()) {
      try {
        const commodity = await commodityService.readByQuery({
          filter: {
            name: { _eq: entry.commodity },
            _or: [
                { product: { _eq: entry.commodity } },
                { product: { _empty: true } }
            ],
            mineral_lease_type: { _empty: true }
          },
          fields: ['id'],
          limit: 1,
        });   

        entry.id = commodity[0].id;

      } catch (error) {
        result.errors.push({
          type: 'commodity_read',
          commodity: entry.commodity,
          message: error.message,
        });
      }
    }

    // Step 8 - Insert disbursement records using cached IDs
    const disbursementService = new ItemsService('disbursement', { schema, accountability });

    let disbursementRecords = [];

    for (const record of transformedRecords) {
      // Build the related records to get lookup keys
      const fundRecord = buildFundRecord(record);
      const locationRecord = buildLocationRecord(record);
      const periodRecord = buildPeriodRecord(record);

      if (periodRecord === null) {
        result.errors.push({
          type: 'disbursement_skip',
          message: 'Invalid period date',
          record: { month: record.month, calendar_year: record.calendar_year },
        });
        continue;
      }

      // Get fund ID from map
      const fundKey = [
        fundRecord.fund_type,
        fundRecord.fund_class,
        fundRecord.recipient,
        fundRecord.revenue_type,
        fundRecord.source,
        fundRecord.disbursement_type,
      ].join('|');
      const fundId = fundMap.get(fundKey)?.id;

      // Get location ID from map
      const locationKey = [
        locationRecord.land_class,
        locationRecord.land_category,
        locationRecord.state,
        locationRecord.county,
        locationRecord.fips_code,
      ].join('|');
      const locationId = locationMap.get(locationKey)?.id;

      // Get period ID from map
      const periodKey = periodRecord.period_date;
      const periodId = periodMap.get(periodKey)?.id;

      // Get commodity ID from map
      const commodityId = commodityMap.get(record.commodity)?.id;

      // Skip if any foreign key is missing
      if (!fundId || !locationId || !periodId || !commodityId) {
        result.errors.push({
          type: 'disbursement_skip',
          message: 'Missing foreign key',
          details: { fundId, locationId, periodId, commodityId },
        });
        continue;
      }

      // Parse disbursement amount
      const amount = parseFloat(record.disbursement?.replace(/,/g, '') || '0');

      disbursementRecords.push({
        fund: fundId,
        location: locationId,
        period: periodId,
        commodity: commodityId,
        amount,
        unit: record.unit || 'dollars',
        unit_abbr: record.unit_abbr || '$',
      });
    }

    // Aggregate disbursement data
    const disbursementAggregate = new Map();

    disbursementRecords.forEach(record => {
      const key = `${record.location}:${record.period}:${record.fund}:${record.commodity}`;
  
      if (disbursementAggregate.has(key)) {
        disbursementAggregate.get(key).amount += record.amount;
        disbursementAggregate.get(key).duplicate_no++;
      } else {
        disbursementAggregate.set(key, { 
          location: record.location,
          period: record.period,
          fund: record.fund,
          commodity: record.commodity,
          amount: record.amount,
          unit: record.unit,
          unit_abbr: record.unit_abbr,
          duplicate_no: 1
        });
      }
    });

    for (const disbursementRecord of disbursementAggregate.values()) {
      try {
        await disbursementService.createOne(disbursementRecord);
        result.disbursementsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'disbursement_insert',
          message: error.message,
        });
      }
    }

    // Step 9 - Update process status/log
    result.completedAt = new Date().toISOString();
    result.success = result.errors.length === 0;

    console.log('[Disbursement Update] Process completed:', {
      fileId: result.fileId,
      recordsProcessed: result.recordsProcessed,
      recordsSkipped: result.recordsSkipped,
      fundsCreated: result.fundsCreated,
      locationsCreated: result.locationsCreated,
      periodsCreated: result.periodsCreated,
      disbursementsCreated: result.disbursementsCreated,
      errorCount: result.errors.length,
      success: result.success,
    });

  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack,
    });
    result.success = false;
    result.completedAt = new Date().toISOString();

    console.error('[Disbursement Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
