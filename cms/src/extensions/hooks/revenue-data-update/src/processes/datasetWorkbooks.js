/**
 * Shared dataset-workbook dispatch, so every trigger of the XLSX build — the revenue-data-update
 * hook (automatic), the dataset-exports endpoint (HTTP/API), and the regenerate-dataset-xlsx flow
 * operation (in-flow) — runs the SAME generators through one code path and can never drift.
 *
 * Each generator queries its own rows/dictionary and overwrites the dataset's existing Directus file
 * (stable /assets/<id> link), so this is idempotent and safe to call repeatedly.
 */
import { generateFederalSalesWorkbook } from './federal-sales/generateWorkbook.js';
import { generateRevenueByCompanyWorkbook } from './revenue-by-company/generateWorkbook.js';
import { generateFiscalYearDisbursementWorkbook, generateMonthlyDisbursementWorkbook } from './disbursement/generateWorkbook.js';
import { generateMonthlyProductionWorkbook, generateAnnualProductionWorkbook } from './production/generateWorkbook.js';
import { generateRevenueWorkbook } from './revenue/generateWorkbook.js';

// Source collections this module can (re)generate a workbook for. The normalized ones (disbursement,
// production) have per-grain variants — see pickGenerators for which grains have a workbook. revenue
// is one combined file (all grains as tabs), built with a streaming writer.
export const SUPPORTED_SOURCE_COLLECTIONS = ['federal_sales', 'federal_revenue_by_company', 'disbursement', 'production', 'revenue'];

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// export_filter may come back parsed (json/jsonb) or as a string; pull period.type._eq either way.
function periodTypeOf(exportFilter) {
	let ef = exportFilter;
	if (typeof ef === 'string') {
		try { ef = JSON.parse(ef); } catch { return null; }
	}
	return ef?.period?.type?._eq ?? null;
}

// The generator(s) for a dataset_metadata row, as an array (a row can back more than one workbook).
// source_collection is unique for most datasets; the normalized ones split by export_filter period
// grain. The Yearly production page (annual grain) hosts both annual workbooks.
function pickGenerators(row) {
	switch (row.source_collection) {
		case 'federal_sales':
			return [generateFederalSalesWorkbook];
		case 'federal_revenue_by_company':
			return [generateRevenueByCompanyWorkbook];
		case 'disbursement':
			switch (periodTypeOf(row.export_filter)) {
				case 'Fiscal Year': return [generateFiscalYearDisbursementWorkbook];
				case 'Monthly': return [generateMonthlyDisbursementWorkbook];
				default: return [];
			}
		case 'production':
			switch (periodTypeOf(row.export_filter)) {
				case 'Monthly': return [generateMonthlyProductionWorkbook];
				case 'Fiscal Year':
				case 'Calendar Year':
					return [generateAnnualProductionWorkbook];
				default: return [];
			}
		case 'revenue':
			// One combined workbook (Monthly + Calendar Year + Fiscal Year tabs), so any grain's row
			// maps to it.
			return [generateRevenueWorkbook];
		default:
			return [];
	}
}

/**
 * Resolve the requested target(s) to dataset_metadata rows and (re)generate each one's XLSX.
 *
 * @param {Object} ctx  { database, services, schema, accountability, env } — as provided to a hook,
 *                      endpoint, or flow operation (schema already resolved via getSchema()).
 * @param {Object} sel  targets, given either/both of:
 *                        - datasets: source_collection string(s), e.g. "federal_sales"
 *                        - keys:     dataset_metadata primary key(s)
 * @returns {Promise<{ requested: any[], generated: object[], skipped: string[] }>}
 */
export async function generateForRequest(ctx, { datasets, keys } = {}) {
	const { database } = ctx;
	const requested = [...asArray(datasets), ...asArray(keys)].filter((v) => v != null && v !== '');

	// Resolve source_collection strings and/or dataset_metadata keys to rows.
	const rows = [];
	const scList = asArray(datasets).filter(Boolean);
	if (scList.length) {
		rows.push(...(await database('dataset_metadata').whereIn('source_collection', scList).select('id', 'name', 'source_collection', 'export_filter')));
	}
	const keyList = asArray(keys).filter((k) => k != null && k !== '');
	if (keyList.length) {
		rows.push(...(await database('dataset_metadata').whereIn('id', keyList).select('id', 'name', 'source_collection', 'export_filter')));
	}

	// De-dupe by id (a dataset can be named by both source_collection and key).
	const seen = new Set();
	const uniqueRows = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

	const generated = [];
	const skipped = [];
	for (const row of uniqueRows) {
		const generators = pickGenerators(row);
		if (!generators.length) {
			skipped.push(row.name || row.source_collection);
			continue;
		}
		for (const generate of generators) {
			const summary = await generate(ctx);
			generated.push({ dataset: row.source_collection, name: row.name, ...summary });
		}
	}

	return { requested, generated, skipped };
}
