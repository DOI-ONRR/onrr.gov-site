/**
 * Federal Sales data update process.
 *
 * Processes a federal sales data file uploaded to Directus,
 * transforming and loading the data directly into the
 * federal_sales collection.
 */

import { getFileContents, parseCsv } from '../shared/index.js';
import { FEDERAL_SALES_FIELD_MAP } from './fieldMappings.js';

const NUMERIC_FIELDS = [
  'sales_volume',
  'gas_volume',
  'sales_value',
  'royalty_value_prior_to_allowance',
  'transportation_allowance',
  'processing_allowance',
  'royalty_value_less_allowance',
  'effective_royalty_rate',
];

/**
 * Main entry point for the federal sales update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processFederalSalesUpdate(fileId, context) {
  const { services, database, schema, accountability } = context;

  const result = {
    fileId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    success: null,
    recordsProcessed: 0,
    recordsSkipped: 0,
    recordsCreated: 0,
    recordsDeleted: 0,
    errors: [],
  };

  try {
    // Step 1 - Retrieve the file from Directus
    const fileContents = await getFileContents(fileId, { services, schema, accountability });

    // Step 2 - Parse the file contents (CSV)
    const records = parseCsv(fileContents, FEDERAL_SALES_FIELD_MAP);

    // Step 3 - Transform each record
    const transformedRecords = [];
    for (const record of records) {
      const transformed = { ...record };

      // Parse calendar_year as integer
      transformed.calendar_year = parseInt(transformed.calendar_year, 10);

      if (isNaN(transformed.calendar_year)) {
        result.recordsSkipped++;
        continue;
      }

      // Parse numeric fields
      for (const field of NUMERIC_FIELDS) {
        const raw = (transformed[field] || '').toString().replace(/,/g, '');
        transformed[field] = parseFloat(raw) || 0;
      }

      transformedRecords.push(transformed);
      result.recordsProcessed++;
    }

    const { ItemsService } = services;
    const federalSalesService = new ItemsService('federal_sales', {
      schema,
      accountability,
    });

    // Step 4 - Delete existing records for the calendar year(s) in the upload
    const calendarYears = [
      ...new Set(
        transformedRecords
          .map(r => r.calendar_year)
          .filter(y => !isNaN(y))
      ),
    ];

    for (const year of calendarYears) {
      try {
        const existing = await federalSalesService.readByQuery({
          filter: {
            calendar_year: { _eq: year },
          },
          fields: ['id'],
          limit: -1,
        });

        for (const item of existing) {
          await federalSalesService.deleteOne(item.id);
          result.recordsDeleted++;
        }
      } catch (error) {
        result.errors.push({
          type: 'record_delete',
          year,
          message: error.message,
        });
      }
    }

    // Step 5 - Insert transformed records
    for (const record of transformedRecords) {
      try {
        await federalSalesService.createOne({
          calendar_year: record.calendar_year,
          land_class: record.land_class,
          land_category: record.land_category,
          state_offshore_region: record.state_offshore_region,
          revenue_type: record.revenue_type,
          commodity: record.commodity,
          sales_volume: record.sales_volume,
          gas_volume: record.gas_volume,
          sales_value: record.sales_value,
          royalty_value_prior_to_allowance: record.royalty_value_prior_to_allowance,
          transportation_allowance: record.transportation_allowance,
          processing_allowance: record.processing_allowance,
          royalty_value_less_allowance: record.royalty_value_less_allowance,
          effective_royalty_rate: record.effective_royalty_rate,
        });
        result.recordsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'record_insert',
          message: error.message,
        });
      }
    }

    // Final status
    result.completedAt = new Date().toISOString();
    result.success = result.errors.length === 0;

    console.log('[Federal Sales Update] Process completed:', {
      fileId: result.fileId,
      recordsProcessed: result.recordsProcessed,
      recordsSkipped: result.recordsSkipped,
      recordsDeleted: result.recordsDeleted,
      recordsCreated: result.recordsCreated,
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

    console.error('[Federal Sales Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
