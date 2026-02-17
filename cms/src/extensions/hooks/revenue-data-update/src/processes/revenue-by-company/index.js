/**
 * Federal Revenue by Company data update process.
 *
 * Processes a federal revenue by company data file uploaded to Directus,
 * transforming and loading the data directly into the
 * federal_revenue_by_company collection.
 */

import { getFileContents, parseCsv } from '../shared/index.js';
import { REVENUE_BY_COMPANY_FIELD_MAP } from './fieldMappings.js';
import { transformRevenueByCompanyRecord } from '../../transformers/revenue-by-company/index.js';

/**
 * Main entry point for the federal revenue by company update process.
 *
 * @param {string} fileId - The GUID of the uploaded file in Directus
 * @param {Object} context - Directus hook context containing services
 * @returns {Promise<Object>} - Result summary of the update process
 */
export async function processRevenueByCompanyUpdate(fileId, context) {
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
    const records = parseCsv(fileContents, REVENUE_BY_COMPANY_FIELD_MAP);

    // Step 3 - Transform each record
    const transformedRecords = [];
    for (const record of records) {
      const transformed = transformRevenueByCompanyRecord(record);

      if (transformed === null) {
        result.recordsSkipped++;
        continue;
      }

      transformedRecords.push(transformed);
      result.recordsProcessed++;
    }

    const { ItemsService } = services;
    const revenueByCompanyService = new ItemsService('federal_revenue_by_company', {
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
        const existing = await revenueByCompanyService.readByQuery({
          filter: {
            calendar_year: { _eq: year },
          },
          fields: ['id'],
          limit: -1,
        });

        for (const item of existing) {
          await revenueByCompanyService.deleteOne(item.id);
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
        await revenueByCompanyService.createOne({
          calendar_year: record.calendar_year,
          corporate_name: record.corporate_name,
          revenue_agency_type: record.revenue_agency_type,
          revenue_agency: record.revenue_agency,
          revenue_type: record.revenue_type,
          commodity: record.commodity,
          commodity_order: record.commodity_order,
          revenue: record.revenue,
          raw_revenue: record.raw_revenue,
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

    console.log('[Revenue By Company Update] Process completed:', {
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

    console.error('[Revenue By Company Update] Process failed:', {
      fileId: result.fileId,
      error: error.message,
    });
  }

  return result;
}
