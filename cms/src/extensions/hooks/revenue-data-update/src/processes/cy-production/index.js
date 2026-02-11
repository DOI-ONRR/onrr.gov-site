/**
 * Calendar Year Production data update process.
 *
 * Processes a calendar year production data file uploaded to Directus,
 * transforming and loading the data into the appropriate tables.
 */

import { getFileContents, parseCsv } from '../shared/index.js';
import { CY_PRODUCTION_FIELD_MAP } from './fieldMappings.js';
import {
  transformCYProductionRecord,
  transformCountyStateFipsCodeWithLookup,
  createFipsCodeLookup,
  extractCommodity,
  extractUnit,
  extractUnitAbbr,
  buildPeriodRecord,
  buildLocationRecord,
} from '../../transformers/cy-production/index.js';

/**
 * Main entry point for the calendar year production update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processCYProductionUpdate(fileId, context) {
  const { services, database, schema, accountability } = context;

  const result = {
    fileId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    success: null,
    recordsProcessed: 0,
    recordsSkipped: 0,
    locationsCreated: 0,
    periodsCreated: 0,
    productionCreated: 0,
    productionDeleted: 0,
    errors: [],
  };

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = parseCsv(fileContents, CY_PRODUCTION_FIELD_MAP);

    // Step 3 - Transform each record using CY production transformers
    const { ItemsService } = services;
    const countyLookupService = new ItemsService('county_lookup', { schema, accountability });
    const lookupFipsCode = createFipsCodeLookup(countyLookupService);

    const transformedRecords = [];
    for (const record of records) {
      // Apply synchronous transformations
      let transformed = transformCYProductionRecord(record);

      // Skip records filtered out by transformations
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      // Apply async FIPS code lookup if needed
      transformed = await transformCountyStateFipsCodeWithLookup(transformed, lookupFipsCode);

      transformedRecords.push(transformed);
      result.recordsProcessed++;
    }

    // Initialize services
    const locationService = new ItemsService('location', { schema, accountability });
    const periodService = new ItemsService('period', { schema, accountability });
    const commodityService = new ItemsService('commodity', { schema, accountability });
    const productionService = new ItemsService('production', { schema, accountability });

    // Build deduplicated reference data maps
    const locationMap = new Map();
    const periodMap = new Map();
    const commodityMap = new Map();

    for (const record of transformedRecords) {
      // Build and deduplicate location record
      const locationRecord = buildLocationRecord(record);
      const locationKey = [
        locationRecord.land_class,
        locationRecord.land_category,
        locationRecord.state || '',
        locationRecord.county || '',
        locationRecord.fips_code || '',
        locationRecord.offshore_region || '',
      ].join('|');
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, { record: locationRecord, id: null });
      }

      // Build and deduplicate period record
      const periodRecord = buildPeriodRecord(record);
      if (periodRecord !== null) {
        const periodKey = `${periodRecord.type}|${periodRecord.period_date}`;
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, { record: periodRecord, id: null });
        }
      }

      // Track commodity (extract from product)
      const commodity = extractCommodity(record.product);
      const commodityKey = `${commodity}|${record.product}`;
      if (!commodityMap.has(commodityKey)) {
        commodityMap.set(commodityKey, {
          commodity,
          product: record.product,
          id: null,
        });
      }
    }

    // Step 4 - Query/insert location records and store IDs
    for (const [key, entry] of locationMap.entries()) {
      try {
        const existing = await locationService.readByQuery({
          filter: {
            land_class: { _eq: entry.record.land_class },
            land_category: { _eq: entry.record.land_category },
            state: { _eq: entry.record.state },
            county: { _eq: entry.record.county },
            fips_code: { _eq: entry.record.fips_code },
            offshore_region: { _eq: entry.record.offshore_region },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          console.log('[CY Production Update] Adding location:', entry.record);
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

    // Step 5 - Query/insert period records and store IDs
    for (const [key, entry] of periodMap.entries()) {
      try {
        const existing = await periodService.readByQuery({
          filter: {
            type: { _eq: entry.record.type },
            period_date: { _eq: entry.record.period_date },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          console.log('[CY Production Update] Adding period:', entry.record);
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

    // Step 6 - Retrieve commodity records
    for (const [key, entry] of commodityMap.entries()) {
      try {
        const commodity = await commodityService.readByQuery({
          filter: {
            commodity: { _eq: entry.commodity },
            product: { _eq: entry.product },
            mineral_lease_type: { _eq: '' },
          },
          fields: ['id'],
          limit: 1,
        });

        if (commodity.length > 0) {
          entry.id = commodity[0].id;
        } else {
          result.errors.push({
            type: 'commodity_not_found',
            commodity: entry.commodity,
            product: entry.product,
            message: `Commodity not found: ${entry.commodity} / ${entry.product}`,
          });
        }
      } catch (error) {
        result.errors.push({
          type: 'commodity_read',
          commodity: entry.commodity,
          product: entry.product,
          message: error.message,
        });
      }
    }

    // Step 7 - Delete existing production from the minimum year onwards
    const calendarYears = transformedRecords.map(r => parseInt(r.calendar_year, 10)).filter(y => !isNaN(y));
    if (calendarYears.length > 0) {
      const minYear = Math.min(...calendarYears);
      const minDate = `${minYear}-01-01`;

      try {
        // Get period IDs for Calendar Year periods from minDate onwards
        const periodsToDelete = await periodService.readByQuery({
          filter: {
            type: { _eq: 'Calendar Year' },
            period_date: { _gte: minDate },
          },
          fields: ['id'],
          limit: -1,
        });

        if (periodsToDelete.length > 0) {
          const periodIds = periodsToDelete.map(p => p.id);

          // Delete production records for these periods
          const existingProduction = await productionService.readByQuery({
            filter: {
              period: { _in: periodIds },
            },
            fields: ['id'],
            limit: -1,
          });

          for (const prod of existingProduction) {
            await productionService.deleteOne(prod.id);
            result.productionDeleted++;
          }
        }
      } catch (error) {
        result.errors.push({
          type: 'production_delete',
          message: error.message,
        });
      }
    }

    // Step 8 - Build production records
    const productionRecords = [];

    for (const record of transformedRecords) {
      const locationRecord = buildLocationRecord(record);
      const periodRecord = buildPeriodRecord(record);

      if (periodRecord === null) {
        result.errors.push({
          type: 'production_skip',
          message: 'Invalid period',
          record: { calendar_year: record.calendar_year },
        });
        continue;
      }

      // Get location ID from map
      const locationKey = [
        locationRecord.land_class,
        locationRecord.land_category,
        locationRecord.state || '',
        locationRecord.county || '',
        locationRecord.fips_code || '',
        locationRecord.offshore_region || '',
      ].join('|');
      const locationId = locationMap.get(locationKey)?.id;

      // Get period ID from map
      const periodKey = `${periodRecord.type}|${periodRecord.period_date}`;
      const periodId = periodMap.get(periodKey)?.id;

      // Get commodity ID from map
      const commodity = extractCommodity(record.product);
      const commodityKey = `${commodity}|${record.product}`;
      const commodityId = commodityMap.get(commodityKey)?.id;

      // Skip if any foreign key is missing
      if (!locationId || !periodId || !commodityId) {
        result.errors.push({
          type: 'production_skip',
          message: 'Missing foreign key',
          details: { locationId, periodId, commodityId },
        });
        continue;
      }

      // Parse volume (remove commas)
      const volume = parseFloat(record.volume?.toString().replace(/,/g, '') || '0');
      const unit = extractUnit(record.product);
      const unitAbbr = extractUnitAbbr(record.product);

      productionRecords.push({
        location: locationId,
        period: periodId,
        commodity: commodityId,
        volume,
        unit,
        unit_abbr: unitAbbr,
      });
    }

    // Step 9 - Aggregate production records
    const productionAggregate = new Map();

    productionRecords.forEach(record => {
      const key = `${record.location}:${record.period}:${record.commodity}`;

      if (productionAggregate.has(key)) {
        productionAggregate.get(key).volume += record.volume;
        productionAggregate.get(key).duplicate_no++;
      } else {
        productionAggregate.set(key, {
          location: record.location,
          period: record.period,
          commodity: record.commodity,
          volume: record.volume,
          unit: record.unit,
          unit_abbr: record.unit_abbr,
          duplicate_no: 1,
        });
      }
    });

    // Step 10 - Insert production records
    for (const productionRecord of productionAggregate.values()) {
      try {
        await productionService.createOne(productionRecord);
        result.productionCreated++;
      } catch (error) {
        result.errors.push({
          type: 'production_insert',
          message: error.message,
        });
      }
    }

    // Final status
    result.completedAt = new Date().toISOString();
    result.success = result.errors.length === 0;

    console.log('[CY Production Update] Process completed:', {
      fileId: result.fileId,
      recordsProcessed: result.recordsProcessed,
      recordsSkipped: result.recordsSkipped,
      locationsCreated: result.locationsCreated,
      periodsCreated: result.periodsCreated,
      productionDeleted: result.productionDeleted,
      productionCreated: result.productionCreated,
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

    console.error('[CY Production Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
