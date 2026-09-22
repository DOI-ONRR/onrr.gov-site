// Flow operation: (re)generate a dataset's downloadable XLSX in-process.
//
// Used by the dataset_metadata "Regenerate download XLSX" manual flow (list page). Runs the SAME
// shared dispatcher as the revenue-data-update hook and the dataset-exports endpoint, so the built
// file is identical however it was triggered. In-process (no HTTP self-call), so it sidesteps the
// SSRF guard that blocks a flow Request operation from reaching an internal URL.
import { generateForRequest } from '../../../hooks/revenue-data-update/src/processes/datasetWorkbooks.js';

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export default {
	id: 'regenerate-dataset-xlsx',
	handler: async (options, context) => {
		const { database, services, getSchema, env, accountability, data, logger } = context;
		const schema = await getSchema();

		// `keys` are the selected dataset_metadata primary keys; `datasets` are source_collections.
		// Option templating (e.g. {{$trigger.body.keys}}) usually resolves to the real array, but fall
		// back to reading the trigger off the flow data if it arrives as a raw/string value.
		let keys = options?.keys;
		if (!Array.isArray(keys)) keys = data?.$trigger?.body?.keys ?? asArray(keys);
		const datasets = asArray(options?.datasets);

		const result = await generateForRequest({ database, services, schema, accountability, env }, { keys, datasets });

		logger?.info(
			`[regenerate-dataset-xlsx] generated ${result.generated.length} file(s): ${result.generated.map((g) => g.dataset).join(', ') || '(none)'}` +
				(result.skipped.length ? `; skipped: ${result.skipped.join(', ')}` : ''),
		);
		return result;
	},
};
