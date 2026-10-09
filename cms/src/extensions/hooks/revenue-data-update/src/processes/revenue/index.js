/**
 * Revenue data update process.
 *
 * Processes a revenue data file uploaded to Directus,
 * transforming and loading the data into the appropriate tables.
 */

import { getFileContents, parseCsv, yieldToEventLoop, chunk } from '../shared/index.js';
import { REVENUE_FIELD_MAP } from './fieldMappings.js';

// Insert batch size for the revenue fact table, and how often to yield to the event loop
// inside the synchronous transform/aggregate loops (see ../shared/batch.js).
const INSERT_CHUNK_SIZE = 500;
const YIELD_EVERY = 500;
import {
  transformRevenueRecord,
  summarizeNativeAmericanRevenue,
  buildPeriodRecords,
  buildLocationRecord,
  buildFundRecord,
} from '../../transformers/revenue/index.js';

/**
 * Main entry point for the revenue update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processRevenueUpdate(fileId, context, options = {}) {
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
    revenueDeleted: 0,
    revenueCreated: 0,
    revenueSkipped: 0,
    errors: [],
  };

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = await parseCsv(fileContents, REVENUE_FIELD_MAP);

    // Step 3 - Transform each record using revenue transformers
    const transformedRecords = [];
    let transformCount = 0;
    for (const record of records) {
      let transformed = transformRevenueRecord(record);

      // Skip records filtered out by transformations
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      transformedRecords.push(transformed);
      result.recordsProcessed++;

      // Yield periodically so a large synchronous transform doesn't stall the event loop.
      if (++transformCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 3b - Delete existing revenue for true-up period
    if (options.period === 'true-up') {
      await deleteTrueUpRevenue(transformedRecords, services, schema, accountability, result);
    }

    // Step 4 - Summarize Native American revenue
    const summarizedRecords = summarizeNativeAmericanRevenue(transformedRecords);

    // Initialize services
    const { ItemsService } = services;
    const fundService = new ItemsService('fund', { schema, accountability });
    const locationService = new ItemsService('location', { schema, accountability });
    const periodService = new ItemsService('period', { schema, accountability });
    const commodityService = new ItemsService('commodity', { schema, accountability });
    const revenueService = new ItemsService('revenue', { schema, accountability });

    // Build deduplicated reference data maps
    const fundMap = new Map();
    const locationMap = new Map();
    const periodMap = new Map();
    const commodityMap = new Map();

    let dedupCount = 0;
    for (const record of summarizedRecords) {
      // Build and deduplicate fund record
      const fundRecord = buildFundRecord(record);
      const fundKey = [
        fundRecord.revenue_type,
        fundRecord.source,
        fundRecord.fund_type,
        fundRecord.fund_class,
        fundRecord.recipient,
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
        locationRecord.offshore_region,
      ].join('|');
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, { record: locationRecord, id: null });
      }

      // Build and deduplicate period records (Monthly, and optionally Fiscal/Calendar Year)
      const periodRecords = buildPeriodRecords(record);
      for (const periodRecord of periodRecords) {
        const periodKey = `${periodRecord.type}|${periodRecord.period_date}`;
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, { record: periodRecord, id: null });
        }
      }

      // Track commodity (mineral_lease_type = mineral_production_code_desc, product = product_code_desc)
      const commodityKey = `${record.commodity}|${record.mineral_production_code_desc}|${record.product_code_desc}`;
      if (!commodityMap.has(commodityKey)) {
        commodityMap.set(commodityKey, {
          commodity: record.commodity,
          mineral_lease_type: record.mineral_production_code_desc,
          product: record.product_code_desc,
          id: null,
        });
      }

      if (++dedupCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 5 - Query/insert fund records and store IDs
    for (const [key, entry] of fundMap.entries()) {
      try {
        const existing = await fundService.readByQuery({
          filter: {
            revenue_type: { _eq: entry.record.revenue_type },
            source: { _eq: entry.record.source },
            type: { _eq: entry.record.fund_type },
            class: { _eq: entry.record.fund_class },
            recipient: { _eq: entry.record.recipient },
            disbursement_type: { _eq: entry.record.disbursement_type },
          },
          fields: ['id'],
          limit: 1,
        });

        if (existing.length > 0) {
          entry.id = existing[0].id;
        } else {
          console.log('[Revenue update process]: adding fund', entry.record);
          const newId = await fundService.createOne({
            revenue_type: entry.record.revenue_type,
            source: entry.record.source,
            type: entry.record.fund_type,
            class: entry.record.fund_class,
            recipient: entry.record.recipient,
            disbursement_type: entry.record.disbursement_type,
          });
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

    // Step 6 - Query/insert location records and store IDs
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
          console.log('[Revenue update process]: adding location', entry.record);
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

    // Step 7 - Query/insert period records and store IDs
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

    // Step 8 - Retrieve commodity records
    for (const [key, entry] of commodityMap.entries()) {
      try {
        const commodity = await commodityService.readByQuery({
          filter: {
            name: { _eq: entry.commodity },
            mineral_lease_type: { _eq: (entry.mineral_lease_type || null) },
            product: { _eq: (entry.product || null) },
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
            mineral_lease_type: entry.mineral_lease_type,
            product: entry.product,
            message: `Commodity not found: ${entry.commodity} / ${entry.mineral_lease_type} / ${entry.product}`,
          });
        }
      } catch (error) {
        result.errors.push({
          type: 'commodity_read',
          commodity: entry.commodity,
          message: error.message,
        });
      }
    }

    // Step 9 - Build monthly revenue records
    const monthlyRevenueRecords = [];

    let buildCount = 0;
    for (const record of summarizedRecords) {
      const fundRecord = buildFundRecord(record);
      const locationRecord = buildLocationRecord(record);
      const periodRecords = buildPeriodRecords(record);

      // Find monthly period
      const monthlyPeriod = periodRecords.find(p => p.type === 'Monthly');
      if (!monthlyPeriod) {
        result.errors.push({
          type: 'revenue_skip',
          message: 'No monthly period found',
          record: { accept_date: record.accept_date },
        });
        continue;
      }

      // Get fund ID from map
      const fundKey = [
        fundRecord.revenue_type,
        fundRecord.source,
        fundRecord.fund_type,
        fundRecord.fund_class,
        fundRecord.recipient,
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
        locationRecord.offshore_region,
      ].join('|');
      const locationId = locationMap.get(locationKey)?.id;

      // Get period ID from map
      const periodKey = `Monthly|${monthlyPeriod.period_date}`;
      const periodId = periodMap.get(periodKey)?.id;

      // Get commodity ID from map
      const commodityKey = `${record.commodity}|${record.mineral_production_code_desc}|${record.product_code_desc}`;
      const commodityId = commodityMap.get(commodityKey)?.id;

      // Skip if any foreign key is missing
      if (!fundId || !locationId || !periodId || !commodityId) {
        result.errors.push({
          type: 'revenue_skip',
          message: 'Missing foreign key',
          details: { fundId, locationId, periodId, commodityId },
        });
        continue;
      }

      // Parse revenue amount
      const amount = parseFloat(record.revenue?.toString().replace(/,/g, '') || '0');

      monthlyRevenueRecords.push({
        location: locationId,
        period: periodId,
        commodity: commodityId,
        fund: fundId,
        amount,
        unit: 'dollars',
        unit_abbr: '$',
      });

      if (++buildCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 10 - Aggregate monthly revenue records
    const revenueAggregate = new Map();

    let aggregateCount = 0;
    for (const record of monthlyRevenueRecords) {
      const key = `${record.location}:${record.period}:${record.commodity}:${record.fund}`;

      if (revenueAggregate.has(key)) {
        revenueAggregate.get(key).amount += record.amount;
        revenueAggregate.get(key).duplicate_no++;
      } else {
        revenueAggregate.set(key, {
          location: record.location,
          period: record.period,
          commodity: record.commodity,
          fund: record.fund,
          amount: record.amount,
          unit: record.unit,
          unit_abbr: record.unit_abbr,
          duplicate_no: 1,
        });
      }

      if (++aggregateCount % YIELD_EVERY === 0) await yieldToEventLoop();
    }

    // Step 11 - Idempotent bulk insert, mirroring nrrd's load_revenue_monthly
    // (INSERT ... ON CONFLICT DO NOTHING on the natural key location+period+commodity+fund):
    // fetch every existing revenue row for this load's periods in one query, skip the rows
    // that already exist, and bulk-insert the rest. For a true-up load deleteTrueUpRevenue
    // already cleared the overlap so nothing is skipped; for a plain monthly load this is what
    // prevents duplicates on a re-run (the monthly path does no delete).
    const aggregatedRows = [...revenueAggregate.values()];
    const loadPeriodIds = [...new Set(aggregatedRows.map((r) => r.period))];

    const naturalKey = (r) => `${r.location}:${r.period}:${r.commodity}:${r.fund}`;
    const existingKeys = new Set();
    let existenceReadFailed = false;

    if (loadPeriodIds.length > 0) {
      try {
        const existingRows = await revenueService.readByQuery({
          filter: { period: { _in: loadPeriodIds } },
          fields: ['location', 'period', 'commodity', 'fund'],
          limit: -1,
        });
        for (const r of existingRows) existingKeys.add(naturalKey(r));
      } catch (error) {
        // Don't risk duplicating rows we couldn't verify — skip the insert phase on a read
        // failure rather than inserting blind.
        existenceReadFailed = true;
        result.errors.push({ type: 'revenue_insert', message: error.message });
      }
    }

    if (!existenceReadFailed) {
      const toInsert = [];
      for (const row of aggregatedRows) {
        if (existingKeys.has(naturalKey(row))) {
          result.revenueSkipped++;
        } else {
          toInsert.push(row);
        }
      }

      for (const batch of chunk(toInsert, INSERT_CHUNK_SIZE)) {
        try {
          await revenueService.createMany(batch);
          result.revenueCreated += batch.length;
        } catch (error) {
          result.errors.push({ type: 'revenue_insert', message: error.message });
        }
        await yieldToEventLoop();
      }
    }

    // Step 12 - Load fiscal year revenue
    await loadFiscalYearRevenue(periodService, revenueService, result);

    // Step 13 - Load calendar year revenue
    await loadCalendarYearRevenue(periodService, revenueService, result);

    // Final status
    result.completedAt = new Date().toISOString();
    result.success = result.errors.length === 0;

    console.log('[Revenue Update] Process completed:', {
      fileId: result.fileId,
      recordsProcessed: result.recordsProcessed,
      recordsSkipped: result.recordsSkipped,
      fundsCreated: result.fundsCreated,
      locationsCreated: result.locationsCreated,
      periodsCreated: result.periodsCreated,
      revenueDeleted: result.revenueDeleted,
      revenueCreated: result.revenueCreated,
      revenueSkipped: result.revenueSkipped,
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

    console.error('[Revenue Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}

/**
 * Deletes existing revenue records for a true-up update.
 * Based on: delete_revenue.sql
 *
 * Finds the minimum accept_date from the uploaded records, then deletes
 * all revenue records whose period has a period_date >= that date.
 *
 * @param {Object[]} transformedRecords - Records after transformation
 * @param {Object} services - Directus services
 * @param {Object} schema - Database schema
 * @param {Object} accountability - User accountability info
 * @param {Object} result - Result object to update
 */
async function deleteTrueUpRevenue(transformedRecords, services, schema, accountability, result) {
  const { ItemsService } = services;
  const periodService = new ItemsService('period', { schema, accountability });
  const revenueService = new ItemsService('revenue', { schema, accountability });

  try {
    // Find the minimum accept_date from uploaded records (as YYYY-MM-DD)
    const acceptDates = transformedRecords
      .map(r => r.accept_date)
      .filter(Boolean)
      .map(dateStr => {
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          const month = String(parts[0]).padStart(2, '0');
          const day = String(parts[1]).padStart(2, '0');
          return `${parts[2]}-${month}-${day}`;
        }
        return dateStr;
      })
      .sort();

    if (acceptDates.length === 0) {
      return;
    }

    const minDate = acceptDates[0];

    // Find all periods with period_date >= minDate
    const periods = await periodService.readByQuery({
      filter: {
        period_date: { _gte: minDate },
      },
      fields: ['id'],
      limit: -1,
    });

    if (periods.length === 0) {
      return;
    }

    const periodIds = periods.map(p => p.id);

    // Delete all revenue records for those periods
    const existingRevenue = await revenueService.readByQuery({
      filter: {
        period: { _in: periodIds },
      },
      fields: ['id'],
      limit: -1,
    });

    // One bulk delete scoped by the same period filter, instead of a deleteOne per row.
    await revenueService.deleteByQuery({ filter: { period: { _in: periodIds } } });
    result.revenueDeleted += existingRevenue.length;

    console.log(`[Revenue Update] True-up: deleted ${result.revenueDeleted} revenue records from ${minDate} onwards`);
  } catch (error) {
    result.errors.push({
      type: 'true_up_delete',
      message: error.message,
    });
  }
}

/**
 * Loads fiscal year revenue by aggregating monthly revenue records.
 * Based on: load_revenue_fiscal_year.sql
 *
 * @param {Object} periodService - Directus ItemsService for period
 * @param {Object} revenueService - Directus ItemsService for revenue
 * @param {Object} result - Result object to update
 */
async function loadFiscalYearRevenue(periodService, revenueService, result) {
  try {
    // Find fiscal year periods that don't have revenue yet and have complete monthly data
    const fiscalYearPeriods = await periodService.readByQuery({
      filter: {
        type: { _eq: 'Fiscal Year' },
      },
      fields: ['id', 'fiscal_year'],
      limit: -1,
    });

    for (const fyPeriod of fiscalYearPeriods) {
      // Check if revenue already exists for this fiscal year period
      const existingRevenue = await revenueService.readByQuery({
        filter: {
          period: { _eq: fyPeriod.id },
        },
        fields: ['id'],
        limit: 1,
      });

      if (existingRevenue.length > 0) {
        continue; // Already has revenue
      }

      // Check if we have 12 monthly periods for this fiscal year
      const monthlyPeriods = await periodService.readByQuery({
        filter: {
          type: { _eq: 'Monthly' },
          fiscal_year: { _eq: fyPeriod.fiscal_year },
        },
        fields: ['id'],
        limit: -1,
      });

      if (monthlyPeriods.length !== 12) {
        continue; // Incomplete fiscal year
      }

      // Get all monthly revenue for this fiscal year
      const monthlyPeriodIds = monthlyPeriods.map(p => p.id);
      const monthlyRevenue = await revenueService.readByQuery({
        filter: {
          period: { _in: monthlyPeriodIds },
        },
        fields: ['location', 'commodity', 'fund', 'amount'],
        limit: -1,
      });

      // Aggregate by location, commodity, fund
      const aggregate = new Map();
      let fyAggCount = 0;
      for (const rev of monthlyRevenue) {
        const key = `${rev.location}:${rev.commodity}:${rev.fund}`;
        if (aggregate.has(key)) {
          aggregate.get(key).amount += rev.amount;
          aggregate.get(key).duplicate_no++;
        } else {
          aggregate.set(key, {
            location: rev.location,
            period: fyPeriod.id,
            commodity: rev.commodity,
            fund: rev.fund,
            amount: rev.amount,
            unit: 'dollars',
            unit_abbr: '$',
            duplicate_no: 1,
          });
        }

        if (++fyAggCount % YIELD_EVERY === 0) await yieldToEventLoop();
      }

      // Bulk-insert fiscal year revenue records in chunks.
      for (const batch of chunk([...aggregate.values()], INSERT_CHUNK_SIZE)) {
        try {
          await revenueService.createMany(batch);
          result.revenueCreated += batch.length;
        } catch (error) {
          result.errors.push({
            type: 'fiscal_year_revenue_insert',
            message: error.message,
          });
        }
        await yieldToEventLoop();
      }
    }
  } catch (error) {
    result.errors.push({
      type: 'fiscal_year_revenue_load',
      message: error.message,
    });
  }
}

/**
 * Loads calendar year revenue by aggregating monthly revenue records.
 * Based on: load_revenue_calendar_year.sql
 *
 * @param {Object} periodService - Directus ItemsService for period
 * @param {Object} revenueService - Directus ItemsService for revenue
 * @param {Object} result - Result object to update
 */
async function loadCalendarYearRevenue(periodService, revenueService, result) {
  try {
    // Find calendar year periods that don't have revenue yet
    const calendarYearPeriods = await periodService.readByQuery({
      filter: {
        type: { _eq: 'Calendar Year' },
      },
      fields: ['id', 'calendar_year'],
      limit: -1,
    });

    for (const cyPeriod of calendarYearPeriods) {
      // Check if revenue already exists for this calendar year period
      const existingRevenue = await revenueService.readByQuery({
        filter: {
          period: { _eq: cyPeriod.id },
        },
        fields: ['id'],
        limit: 1,
      });

      if (existingRevenue.length > 0) {
        continue; // Already has revenue
      }

      // Get all monthly periods for this calendar year
      const monthlyPeriods = await periodService.readByQuery({
        filter: {
          type: { _eq: 'Monthly' },
          calendar_year: { _eq: cyPeriod.calendar_year },
        },
        fields: ['id'],
        limit: -1,
      });

      if (monthlyPeriods.length === 0) {
        continue; // No monthly data
      }

      // Get all monthly revenue for this calendar year
      const monthlyPeriodIds = monthlyPeriods.map(p => p.id);
      const monthlyRevenue = await revenueService.readByQuery({
        filter: {
          period: { _in: monthlyPeriodIds },
        },
        fields: ['location', 'commodity', 'fund', 'amount'],
        limit: -1,
      });

      // Aggregate by location, commodity, fund
      const aggregate = new Map();
      let cyAggCount = 0;
      for (const rev of monthlyRevenue) {
        const key = `${rev.location}:${rev.commodity}:${rev.fund}`;
        if (aggregate.has(key)) {
          aggregate.get(key).amount += rev.amount;
          aggregate.get(key).duplicate_no++;
        } else {
          aggregate.set(key, {
            location: rev.location,
            period: cyPeriod.id,
            commodity: rev.commodity,
            fund: rev.fund,
            amount: rev.amount,
            unit: 'dollars',
            unit_abbr: '$',
            duplicate_no: 1,
          });
        }

        if (++cyAggCount % YIELD_EVERY === 0) await yieldToEventLoop();
      }

      // Bulk-insert calendar year revenue records in chunks.
      for (const batch of chunk([...aggregate.values()], INSERT_CHUNK_SIZE)) {
        try {
          await revenueService.createMany(batch);
          result.revenueCreated += batch.length;
        } catch (error) {
          result.errors.push({
            type: 'calendar_year_revenue_insert',
            message: error.message,
          });
        }
        await yieldToEventLoop();
      }
    }
  } catch (error) {
    result.errors.push({
      type: 'calendar_year_revenue_load',
      message: error.message,
    });
  }
}
