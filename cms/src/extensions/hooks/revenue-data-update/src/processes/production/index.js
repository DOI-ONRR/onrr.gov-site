/**
 * Production data update process.
 *
 * Processes a production data file uploaded to Directus,
 * transforming and loading the data into the appropriate tables.
 */

import { getFileContents, parseCsv } from '../shared/index.js';
import { PRODUCTION_FIELD_MAP } from './fieldMappings.js';
import {
  transformProductionRecord,
  buildPeriodRecord,
} from '../../transformers/production/index.js';

/**
 * Extracts commodity name from the full commodity string.
 * e.g., "Oil Prod Vol (bbl)" -> "Oil"
 *
 * @param {string} commodity - Full commodity string
 * @returns {string} - Commodity name (first word)
 */
function extractCommodityName(commodity) {
  if (!commodity) return '';
  return commodity.split(' ')[0];
}

/**
 * Extracts product from the full commodity string.
 * e.g., "Oil Prod Vol (bbl)" -> "Oil Prod Vol (bbl)" with "Prod Vol " removed -> "Oil (bbl)"
 *
 * @param {string} commodity - Full commodity string
 * @returns {string} - Product string
 */
function extractProduct(commodity) {
  if (!commodity) return '';
  return commodity.replace('Prod Vol ', '');
}

/**
 * Extracts unit from the full commodity string.
 * e.g., "Oil Prod Vol (bbl)" -> "bbl"
 *
 * @param {string} commodity - Full commodity string
 * @returns {string} - Unit string without parentheses
 */
function extractUnit(commodity) {
  if (!commodity) return '';
  const match = commodity.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
}

/**
 * Derives state from land_class.
 * Federal -> "Nationwide", otherwise -> "Native American"
 *
 * @param {string} landClass - The land class
 * @returns {string} - Derived state
 */
function deriveState(landClass) {
  return landClass === 'Federal' ? 'Nationwide' : 'Native American';
}

/**
 * Builds a location record for production data.
 *
 * @param {Object} record - The production record
 * @returns {Object} - Location record for lookup/insert
 */
function buildLocationRecord(record) {
  return {
    land_class: record.land_class || '',
    land_category: record.land_category || '',
    state: deriveState(record.land_class),
    county: '',
    fips_code: '',
  };
}

/**
 * Main entry point for the production update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processProductionUpdate(fileId, context) {
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
    const records = parseCsv(fileContents, PRODUCTION_FIELD_MAP);

    // Step 3 - Transform each record using production transformers
    const transformedRecords = [];
    for (const record of records) {
      let transformed = transformProductionRecord(record);

      // Skip records filtered out by transformations
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      transformedRecords.push(transformed);
      result.recordsProcessed++;
    }

    // Initialize services
    const { ItemsService } = services;
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
        locationRecord.state,
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

      // Track commodity (using extracted name and product)
      const commodityName = extractCommodityName(record.commodity);
      const product = extractProduct(record.commodity);
      const commodityKey = `${commodityName}|${product}`;
      if (!commodityMap.has(commodityKey)) {
        commodityMap.set(commodityKey, {
          name: commodityName,
          product: product,
          id: null
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
            county: { _eq: '' },
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

    // Step 5 - Query/insert period records and store IDs
    for (const [key, entry] of periodMap.entries()) {
      try {
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

    // Step 6 - Retrieve commodity records
    for (const [key, entry] of commodityMap.entries()) {
      try {
        const commodity = await commodityService.readByQuery({
          filter: {
            name: { _eq: entry.name },
            product: { _eq: entry.product },
            mineral_lease_type: { _empty: true },
          },
          fields: ['id'],
          limit: 1,
        });

        if (commodity.length > 0) {
          entry.id = commodity[0].id;
        } else {
          result.errors.push({
            type: 'commodity_not_found',
            name: entry.name,
            product: entry.product,
            message: `Commodity not found: ${entry.name} / ${entry.product}`,
          });
        }
      } catch (error) {
        result.errors.push({
          type: 'commodity_read',
          name: entry.name,
          product: entry.product,
          message: error.message,
        });
      }
    }

    // Step 7 - Delete existing production for the date range
    const periodDates = Array.from(periodMap.keys());
    if (periodDates.length > 0) {
      const minDate = periodDates.sort()[0];

      try {
        // Get period IDs for Monthly periods from minDate onwards
        const periodsToDelete = await periodService.readByQuery({
          filter: {
            type: { _eq: 'Monthly' },
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
          message: 'Invalid period date',
          record: { period_date: record.period_date },
        });
        continue;
      }

      // Get location ID from map
      const locationKey = [
        locationRecord.land_class,
        locationRecord.land_category,
        locationRecord.state,
      ].join('|');
      const locationId = locationMap.get(locationKey)?.id;

      // Get period ID from map
      const periodKey = periodRecord.period_date;
      const periodId = periodMap.get(periodKey)?.id;

      // Get commodity ID from map
      const commodityName = extractCommodityName(record.commodity);
      const product = extractProduct(record.commodity);
      const commodityKey = `${commodityName}|${product}`;
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

      // Parse volume
      const volume = parseFloat(record.volume?.replace(/,/g, '') || '0');
      const unit = extractUnit(record.commodity);

      productionRecords.push({
        location: locationId,
        period: periodId,
        commodity: commodityId,
        volume,
        unit,
        unit_abbr: unit,
      });
    }

    // Step 9 - Aggregate production data
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

    console.log('[Production Update] Process completed:', {
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

    console.error('[Production Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
