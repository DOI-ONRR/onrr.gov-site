/**
 * Regenerates the Production XLSX downloads and stores them in Directus.
 *
 * production has two dataset_metadata pages sharing source_collection 'production':
 *   - Monthly  -> monthly-production.xlsx (one data tab + Data Dictionary)
 *   - Yearly   -> annual-production.xlsx  (Fiscal Year + Calendar Year tabs + Data Dictionary); the
 *                 Yearly page's preview toggles the two annual grains, so one file hosts both.
 *
 * Each workbook is written back to the SAME directus_files record on every run so its download link
 * (/assets/<id>) stays stable. On first run it creates the file and links it into dataset_metadata.files.
 */
import { Readable } from 'node:stream';
import { buildWorkbook } from './buildWorkbook.js';

const SOURCE_COLLECTION = 'production';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// The Directus default storage location (first of STORAGE_LOCATIONS); env value may be array or CSV.
function defaultStorage(env) {
	const loc = env?.STORAGE_LOCATIONS;
	if (Array.isArray(loc)) return loc[0];
	if (typeof loc === 'string' && loc.trim()) return loc.split(',')[0].trim();
	return null;
}

// export_filter may come back parsed (json/jsonb) or as a string; pull period.type._eq either way.
function periodTypeOf(exportFilter) {
	let ef = exportFilter;
	if (typeof ef === 'string') {
		try { ef = JSON.parse(ef); } catch { return null; }
	}
	return ef?.period?.type?._eq ?? null;
}

// Find the dataset_metadata row a workbook links to. `grains` is an ordered preference list of
// export_filter period grains: the first grain with a matching row wins, so the annual workbook can
// prefer a Fiscal Year page and fall back to a Calendar Year one. If several rows share a grain (e.g.
// a scratch/duplicate page), prefer the one with a data dictionary — the real published dataset.
async function findDatasetRow(database, grains) {
	const all = await database('dataset_metadata').where({ source_collection: SOURCE_COLLECTION }).select('id', 'export_filter');
	for (const grain of grains) {
		const matching = all.filter((d) => periodTypeOf(d.export_filter) === grain);
		if (matching.length === 1) return matching[0];
		if (matching.length > 1) {
			for (const row of matching) {
				const [{ n }] = await database('data_dictionary_fields').where({ dataset: row.id }).count({ n: '*' });
				if (Number(n) > 0) return row;
			}
			return matching[0];
		}
	}
	return null;
}

// Rows for one grain — same joins/columns/order as the charts CSV export (superset select).
function queryRows(database, periodType) {
	return database('production')
		.join('period as p', 'production.period', 'p.id')
		.leftJoin('location as l', 'production.location', 'l.id')
		.leftJoin('commodity as c', 'production.commodity', 'c.id')
		.where('p.type', periodType)
		.orderBy('p.period_date', 'asc')
		.select(
			'p.period_date',
			'p.fiscal_year',
			'l.land_class',
			'l.land_category',
			'l.state',
			'l.county',
			'l.fips_code',
			'l.offshore_region',
			'c.product',
			'c.name as commodity',
			'production.volume',
		);
}

async function loadDictionary(database, datasetId) {
	const fields = await database('data_dictionary_fields')
		.select('id', 'field_name', 'definition', 'value_style')
		.where({ dataset: datasetId })
		.orderBy('sort', 'asc');
	for (const field of fields) {
		field.values = await database('data_dictionary_values')
			.select('term', 'definition')
			.where({ field: field.id })
			.orderBy('sort', 'asc');
	}
	return fields;
}

// Store a workbook buffer in Directus, reusing the same file record (stable /assets/<id> link) when
// present, and linking it into the dataset's downloads on first creation.
async function storeWorkbook(context, { dataset, filename, title, buffer }) {
	const { services, database, schema, accountability, env } = context;
	const { FilesService } = services;
	const filesService = new FilesService({ schema, accountability });

	const existing = await database('dataset_metadata_files as j')
		.join('directus_files as f', 'j.directus_files_id', 'f.id')
		.where('j.dataset_metadata_id', dataset.id)
		.andWhere('f.filename_download', filename)
		.select('f.id', 'f.storage')
		.first();

	const storage =
		existing?.storage ||
		defaultStorage(env) ||
		(await database('directus_files').select('storage').first())?.storage;

	const fileId = await filesService.uploadOne(
		Readable.from(buffer),
		{ storage, filename_download: filename, title, type: XLSX_TYPE },
		existing?.id, // undefined -> create; id -> replace contents, keep the same id
	);

	if (!existing) {
		await database('dataset_metadata_files').insert({ dataset_metadata_id: dataset.id, directus_files_id: fileId });
	}

	return { fileId, filename, updatedExisting: !!existing };
}

// monthly-production.xlsx — one data tab (Monthly) + Data Dictionary.
export async function generateMonthlyProductionWorkbook(context) {
	const { database } = context;
	const dataset = await findDatasetRow(database, ['Monthly']);
	if (!dataset) return { skipped: 'no Monthly production dataset_metadata row', filename: 'monthly-production.xlsx' };

	const rows = await queryRows(database, 'Monthly');
	const dictionaryFields = await loadDictionary(database, dataset.id);
	const buffer = buildWorkbook({ sheets: [{ periodType: 'Monthly', sheetName: 'Monthly Production', rows }], dictionaryFields });

	const stored = await storeWorkbook(context, { dataset, filename: 'monthly-production.xlsx', title: 'Monthly Production', buffer });
	return { ...stored, counts: { rows: rows.length, dictionaryFields: dictionaryFields.length } };
}

// annual-production.xlsx — Fiscal Year tab + Calendar Year tab + Data Dictionary, on the Yearly page.
export async function generateAnnualProductionWorkbook(context) {
	const { database } = context;
	const dataset = await findDatasetRow(database, ['Fiscal Year', 'Calendar Year']);
	if (!dataset) return { skipped: 'no annual production dataset_metadata row', filename: 'annual-production.xlsx' };

	const fiscalYearRows = await queryRows(database, 'Fiscal Year');
	const calendarYearRows = await queryRows(database, 'Calendar Year');
	const dictionaryFields = await loadDictionary(database, dataset.id);
	const buffer = buildWorkbook({
		sheets: [
			{ periodType: 'Fiscal Year', sheetName: 'Fiscal Year', rows: fiscalYearRows },
			{ periodType: 'Calendar Year', sheetName: 'Calendar Year', rows: calendarYearRows },
		],
		dictionaryFields,
	});

	const stored = await storeWorkbook(context, { dataset, filename: 'annual-production.xlsx', title: 'Annual Production', buffer });
	return {
		...stored,
		counts: { fiscalYearRows: fiscalYearRows.length, calendarYearRows: calendarYearRows.length, dictionaryFields: dictionaryFields.length },
	};
}
