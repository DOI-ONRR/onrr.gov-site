// `dataset-exports` endpoint extension.
//
// (Re)generates a dataset's downloadable XLSX on demand — outside the revenue-data-update process —
// so an editor can rebuild the file from the CURRENT data/dictionary/notes at any time (e.g. after
// editing notes, or to backfill an existing dataset). Mounted at /dataset-exports.
//
//   POST /dataset-exports/generate-xlsx   body: { dataset } | { datasets:[...] } | { keys:[...] }
//   GET  /dataset-exports/datasets        list the supported dataset keys (no side effects)
//
// Accepts the target(s) as source_collection string(s) (`dataset`/`datasets`) and/or dataset_metadata
// primary key(s) (`keys`/`ids`, resolved to their source_collection). The actual (re)generation runs
// through the shared dispatcher used by the hook and the flow operation too, so nothing drifts.
//
// NOTE: this is the HTTP/API entry point. The dataset_metadata "Regenerate download XLSX" flow does
// NOT call this route — a flow's Request operation can't reach an internal URL (Directus SSRF guard);
// it uses the `regenerate-dataset-xlsx` flow operation, which runs the same dispatcher in-process.
import { generateForRequest, SUPPORTED_SOURCE_COLLECTIONS } from '../../../hooks/revenue-data-update/src/processes/datasetWorkbooks.js';

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export default (router, context) => {
	const { services, database, getSchema, env } = context;

	// List the datasets this endpoint can (re)generate — handy for wiring a button / debugging.
	router.get('/datasets', (req, res) => {
		res.json({ datasets: SUPPORTED_SOURCE_COLLECTIONS });
	});

	// Regenerate one or more datasets' XLSX. Admin-only: it overwrites Directus files, and the route
	// is publicly mounted, so the gate is explicit rather than relying on the mount being private.
	router.post('/generate-xlsx', async (req, res) => {
		try {
			if (!req.accountability?.admin) {
				return res.status(403).json({ error: 'Forbidden: admin access required.' });
			}

			const body = req.body || {};
			const schema = await getSchema();
			const { requested, generated, skipped } = await generateForRequest(
				{ database, services, schema, accountability: req.accountability, env },
				{ datasets: [...asArray(body.datasets), ...asArray(body.dataset)], keys: [...asArray(body.keys), ...asArray(body.ids)] },
			);

			if (!generated.length) {
				return res.status(400).json({
					error: `No supported dataset in request. Received: ${requested.join(', ') || '(none)'}. Supported: ${SUPPORTED_SOURCE_COLLECTIONS.join(', ')}.`,
					skipped,
				});
			}

			res.json({ success: true, generated, skipped });
		} catch (error) {
			console.error('[dataset-exports] generate-xlsx failed:', error);
			res.status(500).json({ error: 'Failed to generate XLSX.' });
		}
	});
};
