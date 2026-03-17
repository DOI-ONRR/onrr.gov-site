/**
 * Revenue data transformers.
 *
 * These transformers convert and normalize revenue data from CSV imports
 * before insertion into the database.
 */

import { ignoreEmptyRevenue } from './ignoreEmptyRevenue.js';
import { sanitizeNulls } from './sanitizeNulls.js';
import { sanitizeFipsCode } from './sanitizeFipsCode.js';
import { transformCommodity } from './transformCommodity.js';
import { transformCountyCodeDesc } from './transformCountyCodeDesc.js';
import { transformOffshoreRegion } from './transformOffshoreRegion.js';
import { transformProductCodeDesc } from './transformProductCodeDesc.js';
import { transformRevenueType } from './transformRevenueType.js';
import { buildPeriodRecords } from './buildPeriodRecord.js';
import { buildLocationRecord } from './buildLocationRecord.js';
import { buildFundRecord } from './buildFundRecord.js';

export {
  ignoreEmptyRevenue,
  sanitizeNulls,
  sanitizeFipsCode,
  transformCommodity,
  transformCountyCodeDesc,
  transformOffshoreRegion,
  transformProductCodeDesc,
  transformRevenueType,
  buildPeriodRecords,
  buildLocationRecord,
  buildFundRecord,
};

/**
 * Applies all revenue transformations to a record.
 * Returns null if the record should be skipped.
 *
 * @param {Object} record - The raw revenue record from CSV
 * @returns {Object|null} - The transformed record, or null if it should be skipped
 */
export function transformRevenueRecord(record) {
  // Check for empty records first
  let transformed = ignoreEmptyRevenue(record);
  if (transformed === null) {
    return null;
  }

  // Apply transformations in order
  transformed = sanitizeNulls(transformed);
  transformed = sanitizeFipsCode(transformed);
  transformed = transformCountyCodeDesc(transformed);
  transformed = transformOffshoreRegion(transformed);
  transformed = transformCommodity(transformed);
  transformed = transformProductCodeDesc(transformed);
  transformed = transformRevenueType(transformed);

  return transformed;
}

/**
 * Summarizes Native American revenue records.
 * Groups records with land_class_code containing "Indian" and aggregates them.
 *
 * Based on: summarize_native_american_revenue.sql
 *
 * @param {Object[]} records - Array of revenue records
 * @returns {Object[]} - Array of records with Native American records summarized
 */
export function summarizeNativeAmericanRevenue(records) {
  // Separate Indian and non-Indian records
  const indianRecords = [];
  const nonIndianRecords = [];

  for (const record of records) {
    if (record.land_class_code && record.land_class_code.includes('Indian')) {
      indianRecords.push(record);
    } else {
      nonIndianRecords.push(record);
    }
  }

  // Group Indian records by key fields and aggregate revenue
  const aggregateMap = new Map();

  for (const record of indianRecords) {
    const key = [
      record.accept_date,
      record.land_category_code_desc,
      record.revenue_type,
      record.mineral_production_code_desc,
      record.commodity,
      record.product_code_desc,
    ].join('|');

    if (aggregateMap.has(key)) {
      const existing = aggregateMap.get(key);
      const existingRevenue = parseFloat(existing.revenue) || 0;
      const newRevenue = parseFloat(record.revenue) || 0;
      existing.revenue = (existingRevenue + newRevenue).toString();
    } else {
      aggregateMap.set(key, {
        accept_date: record.accept_date,
        land_class_code: 'Native American',
        land_category_code_desc: record.land_category_code_desc,
        state: 'Native American',
        county_code_desc: '',
        fips_code: 'NA',
        agency_state_region_code_desc: '',
        revenue_type: record.revenue_type,
        mineral_production_code_desc: record.mineral_production_code_desc,
        commodity: record.commodity,
        product_code_desc: record.product_code_desc,
        revenue: record.revenue,
      });
    }
  }

  // Combine non-Indian records with aggregated Native American records
  return [...nonIndianRecords, ...aggregateMap.values()];
}
