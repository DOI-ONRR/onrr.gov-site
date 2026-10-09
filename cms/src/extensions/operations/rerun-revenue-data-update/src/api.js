// Flow operation: re-run one or more revenue_data_update items in-process.
//
// Used by the revenue_data_update "Rerun revenue data update" manual flow (item sidebar). Each
// selected item already stores everything a run needs — dataset, period, file — so it is re-run
// from those stored values via the SAME dispatcher the revenue_data_update.items.create hook uses,
// and its `result`/`status` are written back to the same row (no new item is created).
//
// In-process (no HTTP self-call), so it sidesteps the SSRF guard that blocks a flow Request
// operation from reaching an internal URL — the same reason regenerate-dataset-xlsx is an operation.
//
// Re-running is only safe where the loader is idempotent (true-up + monthly revenue, disbursement,
// production/CY/FY all are); re-running a non-idempotent dataset can double-load.
import { runDatasetUpdate } from '../../../hooks/revenue-data-update/src/processes/runUpdate.js';

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export default {
	id: 'rerun-revenue-data-update',
	handler: async (options, context) => {
		const { database, services, getSchema, accountability, data, logger } = context;
		const schema = await getSchema();
		const { ItemsService } = services;

		// `keys` are the selected revenue_data_update primary keys. Option templating
		// (e.g. {{$trigger.body.keys}}) usually resolves to the real array, but fall back to
		// reading the trigger off the flow data if it arrives as a raw/string value.
		let keys = options?.keys;
		if (!Array.isArray(keys)) keys = data?.$trigger?.body?.keys ?? asArray(keys);

		const svc = new ItemsService('revenue_data_update', { schema, accountability });
		const ctx = { services, database, schema, accountability };

		const results = [];
		for (const key of keys) {
			const item = await svc.readOne(key, { fields: ['id', 'dataset', 'period', 'file'] });

			const result = await runDatasetUpdate(item, ctx);
			if (result === null) {
				results.push({ key, status: 'skipped', reason: `unknown dataset: ${item?.dataset}` });
				continue;
			}

			const status = result.success ? 'success' : 'error';
			await svc.updateOne(key, { result, status });
			results.push({ key, status, dataset: item.dataset, period: item.period });
		}

		logger?.info(
			`[rerun-revenue-data-update] reran ${results.length} item(s): ` +
				results.map((r) => `${r.key}=${r.status}`).join(', '),
		);
		return results;
	},
};
