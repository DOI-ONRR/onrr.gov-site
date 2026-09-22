/**
 * Shared dataset-workbook dispatch, so every trigger of the XLSX build — the revenue-data-update
 * hook (automatic), the dataset-exports endpoint (HTTP/API), and the regenerate-dataset-xlsx flow
 * operation (in-flow) — runs the SAME generators through one code path and can never drift.
 *
 * Each generator queries its own rows/dictionary/notes and overwrites the dataset's existing Directus
 * file (stable /assets/<id> link), so this is idempotent and safe to call repeatedly.
 */
import { generateFederalSalesWorkbook } from './federal-sales/generateWorkbook.js';
import { generateRevenueByCompanyWorkbook } from './revenue-by-company/generateWorkbook.js';

// Map a dataset key (dataset_metadata.source_collection) to its workbook generator.
export const DATASET_GENERATORS = {
	federal_sales: generateFederalSalesWorkbook,
	federal_revenue_by_company: generateRevenueByCompanyWorkbook,
};

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * Resolve the requested target(s) to source_collections and (re)generate each dataset's XLSX.
 *
 * @param {Object} ctx  { database, services, schema, accountability, env } — as provided to a hook,
 *                      endpoint, or flow operation (schema already resolved via getSchema()).
 * @param {Object} sel  targets, given either/both of:
 *                        - datasets: source_collection string(s), e.g. "federal_sales"
 *                        - keys:     dataset_metadata primary key(s), resolved to their source_collection
 * @returns {Promise<{ requested: string[], generated: object[], skipped: string[] }>}
 */
export async function generateForRequest(ctx, { datasets, keys } = {}) {
	const { database, services, schema, accountability, env } = ctx;

	const sources = [...asArray(datasets)];

	const keyList = asArray(keys).filter((k) => k != null && k !== '');
	if (keyList.length) {
		const rows = await database('dataset_metadata').whereIn('id', keyList).select('source_collection');
		sources.push(...rows.map((r) => r.source_collection));
	}

	const requested = [...new Set(sources.filter(Boolean))];
	const known = requested.filter((s) => DATASET_GENERATORS[s]);
	const skipped = requested.filter((s) => !DATASET_GENERATORS[s]);

	const generated = [];
	for (const dataset of known) {
		const summary = await DATASET_GENERATORS[dataset]({ services, database, schema, accountability, env });
		generated.push({ dataset, ...summary });
	}

	return { requested, generated, skipped };
}
