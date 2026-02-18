import { processDisbursementUpdate } from './processes/disbursement/index.js';
import { processProductionUpdate } from './processes/production/index.js';
import { processRevenueUpdate } from './processes/revenue/index.js';
import { processCYProductionUpdate } from './processes/cy-production/index.js';
import { processFYProductionUpdate } from './processes/fy-production/index.js';
import { processRevenueByCompanyUpdate } from './processes/revenue-by-company/index.js';
import { processFederalSalesUpdate } from './processes/federal-sales/index.js';

export default ({ filter, action }, { services, database, getSchema }) => {
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
