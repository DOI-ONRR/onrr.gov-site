/**
 * Revenue data update process.
 *
 * Processes a revenue data file uploaded to Directus,
 * transforming and loading the data into the appropriate tables.
 */

import { getFileContents, parseCsv } from '../shared/index.js';
import { REVENUE_FIELD_MAP } from './fieldMappings.js';
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
export async function processRevenueUpdate(fileId, context) {
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
    revenueCreated: 0,
    errors: [],
  };

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = parseCsv(fileContents, REVENUE_FIELD_MAP);

    // Step 3 - Transform each record using revenue transformers
    const transformedRecords = [];
    for (const record of records) {
      let transformed = transformRevenueRecord(record);

      // Skip records filtered out by transformations
      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      transformedRecords.push(transformed);
      result.recordsProcessed++;
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
        revenue: amount,
        unit: 'dollars',
        unit_abbr: '$',
      });
    }

    // Step 10 - Aggregate monthly revenue records
    const revenueAggregate = new Map();

    monthlyRevenueRecords.forEach(record => {
      const key = `${record.location}:${record.period}:${record.commodity}:${record.fund}`;

      if (revenueAggregate.has(key)) {
        revenueAggregate.get(key).revenue += record.revenue;
        revenueAggregate.get(key).duplicate_no++;
      } else {
        revenueAggregate.set(key, {
          location: record.location,
          period: record.period,
          commodity: record.commodity,
          fund: record.fund,
          revenue: record.revenue,
          unit: record.unit,
          unit_abbr: record.unit_abbr,
          duplicate_no: 1,
        });
      }
    });

    // Step 11 - Insert monthly revenue records
    for (const revenueRecord of revenueAggregate.values()) {
      try {
        await revenueService.createOne(revenueRecord);
        result.revenueCreated++;
      } catch (error) {
        result.errors.push({
          type: 'revenue_insert',
          message: error.message,
        });
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
      revenueCreated: result.revenueCreated,
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
      for (const rev of monthlyRevenue) {
        const key = `${rev.location}:${rev.commodity}:${rev.fund}`;
        if (aggregate.has(key)) {
          aggregate.get(key).amount += rev.ramount;
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
      }

      // Insert fiscal year revenue records
      for (const fyRevenue of aggregate.values()) {
        try {
          await revenueService.createOne(fyRevenue);
          result.revenueCreated++;
        } catch (error) {
          result.errors.push({
            type: 'fiscal_year_revenue_insert',
            message: error.message,
          });
        }
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
      }

      // Insert calendar year revenue records
      for (const cyRevenue of aggregate.values()) {
        try {
          await revenueService.createOne(cyRevenue);
          result.revenueCreated++;
        } catch (error) {
          result.errors.push({
            type: 'calendar_year_revenue_insert',
            message: error.message,
          });
        }
      }
    }
  } catch (error) {
    result.errors.push({
      type: 'calendar_year_revenue_load',
      message: error.message,
    });
  }
}
