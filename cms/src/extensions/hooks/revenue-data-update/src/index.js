import { processDisbursementUpdate } from './processes/disbursement/index.js';
import { processProductionUpdate } from './processes/production/index.js';
import { processRevenueUpdate } from './processes/revenue/index.js';
import { processCYProductionUpdate } from './processes/cy-production/index.js';
import { processFYProductionUpdate } from './processes/fy-production/index.js';
import { processRevenueByCompanyUpdate } from './processes/revenue-by-company/index.js';
import { generateRevenueByCompanyWorkbook } from './processes/revenue-by-company/generateWorkbook.js';
import { processFederalSalesUpdate } from './processes/federal-sales/index.js';
import { generateFederalSalesWorkbook } from './processes/federal-sales/generateWorkbook.js';

export default ({ filter, action }, { services, database, getSchema, env }) => {
	const { ItemsService } = services;

	action('revenue_data_update.items.create', async (meta, { schema, accountability }) => {
		console.log('Item created', JSON.stringify(meta.payload, null, 2));

		// Build context object for the process
		const context = {
			services,
			database,
			schema,
			accountability,
		};

		let result = null;

		switch (meta.payload.dataset) {
			case 'disbursement':
				result = await processDisbursementUpdate(meta.payload.file, context);
				break;
			case 'production':
				if (meta.payload.period === 'calendar-year') {
					result = await processCYProductionUpdate(meta.payload.file, context);
				} else if (meta.payload.period === 'fiscal-year') {
					result = await processFYProductionUpdate(meta.payload.file, context);
				} else {
					result = await processProductionUpdate(meta.payload.file, context);
				}
				break;
			case 'revenue':
				result = await processRevenueUpdate(meta.payload.file, context, { period: meta.payload.period });
				break;
			case 'federal-revenue-by-company':
				result = await processRevenueByCompanyUpdate(meta.payload.file, context);
				break;
			case 'federal-sales':
				result = await processFederalSalesUpdate(meta.payload.file, context);
				break;
		}

		// Rebuild the denormalized flat table backing the public dataset API (only the
		// three datasets that have one). Best-effort: a refresh failure is logged, not fatal.
		const FLAT_DATASETS = new Set(['disbursement', 'revenue', 'production']);
		if (result?.success && FLAT_DATASETS.has(meta.payload.dataset)) {
			try {
				await database.raw('SELECT refresh_dataset_flat(?)', [meta.payload.dataset]);
				console.log(`[Revenue Data Update] refreshed ${meta.payload.dataset}_flat`);
			} catch (error) {
				console.error('[Revenue Data Update] flat refresh failed:', error.message);
			}
		}

		// Federal Revenue by Company: (re)generate the downloadable XLSX (data + corporate crosswalk
		// + data dictionary) and store it as the same Directus file so the download link stays stable.
		// Best-effort: a failure here is logged, not fatal to the data load.
		if (result?.success && meta.payload.dataset === 'federal-revenue-by-company') {
			try {
				const summary = await generateRevenueByCompanyWorkbook({ services, database, schema, accountability, env });
				console.log('[Revenue Data Update] federal-revenue-by-company XLSX generated:', summary);
			} catch (error) {
				console.error('[Revenue Data Update] XLSX generation failed:', error.message);
			}
		}

		// Federal Sales: (re)generate the downloadable XLSX (sales data + data dictionary + notes)
		// and store it as the same Directus file so the download link stays stable. Best-effort.
		if (result?.success && meta.payload.dataset === 'federal-sales') {
			try {
				const summary = await generateFederalSalesWorkbook({ services, database, schema, accountability, env });
				console.log('[Revenue Data Update] federal-sales XLSX generated:', summary);
			} catch (error) {
				console.error('[Revenue Data Update] federal-sales XLSX generation failed:', error.message);
			}
		}

		// Store the result in the revenue_data_update item
		if (result !== null) {
			try {
				const revenueDataUpdateService = new ItemsService('revenue_data_update', {
					schema,
					accountability,
				});
				const status = result.success ? 'success' : 'error';
				await revenueDataUpdateService.updateOne(meta.key, { result, status });
			} catch (error) {
				console.error('[Revenue Data Update] Failed to save result:', error.message);
			}
		}
	});
};
