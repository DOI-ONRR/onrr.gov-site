/**
 * Fiscal Year Production data update process.
 *
 * Processes a fiscal year production data file uploaded to Directus,
 * transforming and loading the data into the appropriate tables.
 */

import { getFileContents, parseCsv, yieldToEventLoop, chunk } from '../shared/index.js';
import { FY_PRODUCTION_FIELD_MAP } from './fieldMappings.js';
import {
  transformFYProductionRecord,
  transformCountyStateFipsCodeWithLookup,
  createFipsCodeLookup,
  extractUnit,
  extractUnitAbbr,
  buildPeriodRecord,
  buildLocationRecord,
} from '../../transformers/fy-production/index.js';

/**
 * Main entry point for the fiscal year production update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
// Insert batch size for the production fact table, and how often to yield to the event loop
// inside the synchronous transform/aggregate loops (see ../shared/batch.js).
const INSERT_CHUNK_SIZE = 500;
const YIELD_EVERY = 500;

export async function processFYProductionUpdate(fileId, context) {
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
    commoditiesUnmatched: 0,
    errors: [],
  };

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = await parseCsv(fileContents, FY_PRODUCTION_FIELD_MAP);

    // Step 3 - Transform each record using FY production transformers
    const { ItemsService } = services;
    const countyLookupService = new ItemsService('county_lookup', { schema, accountability });
    const lookupFipsCode = createFipsCodeLookup(countyLookupService);

    const transformedRecords = [];
    let transformCount = 0;
    for (const record of records) {
      // Apply synchronous transformations
      let transformed = transformFYProductionRecord(record);

      // Skip records filtered out by transformations
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      // Apply async FIPS code lookup if needed (memoized per county/state in the lookup)
      transformed = await transformCountyStateFipsCodeWithLookup(transformed, lookupFipsCode);

      transformedRecords.push(transformed);
      result.recordsProcessed++;

      if (++transformCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Initialize services
    const locationService = new ItemsService('location', { schema, accountability });
    const periodService = new ItemsService('period', { schema, accountability });
    const commodityService = new ItemsService('commodity', { schema, accountability });
    const productionService = new ItemsService('production', { schema, accountability });

    // Preload commodities (mineral_lease_type empty) keyed by lowercased product. nrrd's
    // load_production_fiscal_year matches LOWER(e.product)=LOWER(c.product) after the FY
    // transform_product trigger normalizes the spelling (which transformFYProductionRecord
    // mirrors), so a case-insensitive product lookup is all that's needed — no name match.
    const commodityRows = await commodityService.readByQuery({
      filter: { mineral_lease_type: { _empty: true } },
      fields: ['id', 'product'],
      limit: -1,
    });
    const commodityByProduct = new Map(
      (commodityRows ?? []).map((c) => [String(c.product ?? '').toLowerCase(), c.id]),
    );

    // Build deduplicated reference data maps
    const locationMap = new Map();
    const periodMap = new Map();

    let dedupCount = 0;
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

      if (++dedupCount % YIELD_EVERY === 0) await yieldToEventLoop();
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
          console.log('[FY Production Update] Adding location:', entry.record);
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
          console.log('[FY Production Update] Adding period:', entry.record);
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

    // Commodity is resolved per record in the build step via the preloaded product map.

    // Step 7 - Delete existing production from the minimum year onwards
    const fiscalYears = transformedRecords.map(r => parseInt(r.fiscal_year, 10)).filter(y => !isNaN(y));
    if (fiscalYears.length > 0) {
      const minYear = Math.min(...fiscalYears);
      const minDate = `${minYear}-01-01`;

      try {
        // Get period IDs for Fiscal Year periods from minDate onwards
        const periodsToDelete = await periodService.readByQuery({
          filter: {
            type: { _eq: 'Fiscal Year' },
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

          if (existingProduction.length > 0) {
            // One bulk delete instead of a deleteOne per row.
            await productionService.deleteMany(existingProduction.map((p) => p.id));
            result.productionDeleted += existingProduction.length;
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

    let buildCount = 0;
    for (const record of transformedRecords) {
      const locationRecord = buildLocationRecord(record);
      const periodRecord = buildPeriodRecord(record);

      if (periodRecord === null) {
        result.errors.push({
          type: 'production_skip',
          message: 'Invalid period',
          record: { fiscal_year: record.fiscal_year },
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

      // Resolve commodity by case-insensitive product (post-transform). An unmatched product
      // is dropped (not an error), mirroring nrrd's inner join — tracked for visibility.
      const commodityId = commodityByProduct.get(String(record.product ?? '').toLowerCase()) ?? null;
      if (!commodityId) {
        result.commoditiesUnmatched++;
        continue;
      }

      // location/period are created above, so a miss here is a real problem.
      if (!locationId || !periodId) {
        result.errors.push({
          type: 'production_skip',
          message: 'Missing foreign key',
          details: { locationId, periodId },
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

      if (++buildCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 9 - Aggregate production records
    const productionAggregate = new Map();

    let aggregateCount = 0;
    for (const record of productionRecords) {
      const key = `${record.location}:${record.period}:${record.commodity}`;

      if (productionAggregate.has(key)) {
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

      if (++aggregateCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 10 - Bulk-insert production records (delete-then-insert above means no
    // per-row existence check is needed) in chunks, yielding between batches.
    for (const batch of chunk([...productionAggregate.values()], INSERT_CHUNK_SIZE)) {
      try {
        await productionService.createMany(batch);
        result.productionCreated += batch.length;
      } catch (error) {
        result.errors.push({
          type: 'production_insert',
          message: error.message,
        });
      }
      await yieldToEventLoop();
    }

    // Final status
    result.completedAt = new Date().toISOString();
    result.success = result.errors.length === 0;

    console.log('[FY Production Update] Process completed:', {
      fileId: result.fileId,
      recordsProcessed: result.recordsProcessed,
      recordsSkipped: result.recordsSkipped,
      locationsCreated: result.locationsCreated,
      periodsCreated: result.periodsCreated,
      productionDeleted: result.productionDeleted,
      productionCreated: result.productionCreated,
      commoditiesUnmatched: result.commoditiesUnmatched,
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

    console.error('[FY Production Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
