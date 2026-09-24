/**
 * Regenerates a Production XLSX (per period grain) and stores it in Directus.
 *
 * production has several dataset_metadata rows (Monthly / Yearly) sharing source_collection
 * 'production', distinguished by export_filter (period.type). Pulls that grain's rows (same
 * joins/columns as the CSV download) and the data dictionary, builds the two-tab workbook, and writes
 * it back to the SAME directus_files record each run so the download link (/assets/<id>) stays stable.
 * On first run it creates the file and links it into dataset_metadata.files; afterwards it just
 * replaces the contents.
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

// Find the dataset_metadata row for a grain. If several share the grain (e.g. a scratch/duplicate
// page), prefer the one that has a data dictionary — that's the real published dataset the workbook
// (with its Data Dictionary tab) belongs to.
async function findDatasetRow(database, periodType) {
	const all = await database('dataset_metadata').where({ source_collection: SOURCE_COLLECTION }).select('id', 'export_filter');
	const matching = all.filter((d) => periodTypeOf(d.export_filter) === periodType);
	if (matching.length <= 1) return matching[0] || null;
	for (const row of matching) {
		const [{ n }] = await database('data_dictionary_fields').where({ dataset: row.id }).count({ n: '*' });
		if (Number(n) > 0) return row;
	}
	return matching[0];
}

// Shared core: (re)generate the workbook for one production period grain.
async function generateProductionWorkbook(context, { periodType, filename, title }) {
	const { services, database, schema, accountability, env } = context;
	const { FilesService } = services;

	// 1. Identify the dataset row for this grain (source_collection is shared across grains).
	const dataset = await findDatasetRow(database, periodType);
	if (!dataset) {
		return { skipped: `no ${periodType} production dataset_metadata row found`, filename };
	}

	// 2. Rows for this grain — same joins/columns/order as the charts CSV export (superset select).
	const rows = await database('production')
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

	// 3. Data dictionary for this dataset.
	const dictionaryFields = await database('data_dictionary_fields')
		.select('id', 'field_name', 'definition', 'value_style')
		.where({ dataset: dataset.id })
		.orderBy('sort', 'asc');
	for (const field of dictionaryFields) {
		field.values = await database('data_dictionary_values')
			.select('term', 'definition')
			.where({ field: field.id })
			.orderBy('sort', 'asc');
	}

	// 4. Build the workbook buffer (first tab named after the title, columns keyed by grain).
	const buffer = buildWorkbook({ periodType, sheetName: title, rows, dictionaryFields });

	// 5. Store in Directus, reusing the same file record (stable /assets/<id> link) when present.
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

	// 6. On first creation, link the file into the dataset's downloads (M2M junction).
	if (!existing) {
		await database('dataset_metadata_files').insert({ dataset_metadata_id: dataset.id, directus_files_id: fileId });
	}

	return {
		fileId,
		filename,
		updatedExisting: !!existing,
		counts: { rows: rows.length, dictionaryFields: dictionaryFields.length },
	};
}

export function generateMonthlyProductionWorkbook(context) {
	return generateProductionWorkbook(context, {
		periodType: 'Monthly',
		filename: 'monthly-production.xlsx',
		title: 'Monthly Production',
	});
}
