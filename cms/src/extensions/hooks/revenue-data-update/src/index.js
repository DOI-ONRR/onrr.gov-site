import { processDisbursementUpdate } from './processes/disbursement/index.js';
import { processProductionUpdate } from './processes/production/index.js';

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
				result = await processProductionUpdate(meta.payload.file, context);
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
