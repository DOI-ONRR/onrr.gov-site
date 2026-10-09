import { runDatasetUpdate } from './processes/runUpdate.js';

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

		// Dispatch to the matching dataset process (shared with the "Rerun" flow operation).
		const result = await runDatasetUpdate(meta.payload, context);

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
