/**
 * Regenerates the Federal Revenue by Company XLSX and stores it in Directus.
 *
 * Runs after a successful federal_revenue_by_company data load. Pulls the three datasets, builds
 * the workbook, and writes it back to the SAME directus_files record on every run so the download
 * link in the dataset's Downloads section (/assets/<id>) stays stable. On first run it creates the
 * file and links it into dataset_metadata.files; afterwards it just replaces the file's contents.
 */
import { Readable } from 'node:stream';
import { buildWorkbook } from './buildWorkbook.js';

const SOURCE_COLLECTION = 'federal_revenue_by_company';
const XLSX_FILENAME = 'federal-revenue-by-company.xlsx';
const XLSX_TITLE = 'Federal Revenue by Company';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// The Directus default storage location (first of STORAGE_LOCATIONS), env value may be an array or CSV.
function defaultStorage(env) {
	const loc = env?.STORAGE_LOCATIONS;
	if (Array.isArray(loc)) return loc[0];
	if (typeof loc === 'string' && loc.trim()) return loc.split(',')[0].trim();
	return null;
}

export async function generateRevenueByCompanyWorkbook(context) {
	const { services, database, schema, accountability, env } = context;
	const { FilesService } = services;

	// 1. Pull the three datasets (knex bypasses permissions — appropriate for a system export).
	const revenueRows = await database(SOURCE_COLLECTION)
		.select('calendar_year', 'corporate_name', 'revenue_agency_type', 'commodity', 'revenue')
		.orderBy([{ column: 'calendar_year', order: 'asc' }, { column: 'corporate_name', order: 'asc' }]);

	const crosswalkRows = await database('corporate_crosswalk')
		.select('payor_name', 'corporate_name')
		.orderBy('payor_name', 'asc');

	const dataset = await database('dataset_metadata').select('id').where({ source_collection: SOURCE_COLLECTION }).first();
	const dictionaryFields = dataset
		? await database('data_dictionary_fields')
				.select('id', 'field_name', 'definition', 'value_style')
				.where({ dataset: dataset.id })
				.orderBy('sort', 'asc')
		: [];
	for (const field of dictionaryFields) {
		field.values = await database('data_dictionary_values')
			.select('term', 'definition')
			.where({ field: field.id })
			.orderBy('sort', 'asc');
	}

	// 2. Build the workbook buffer.
	const buffer = buildWorkbook({ revenueRows, crosswalkRows, dictionaryFields });

	// 3. Store in Directus, reusing the same file record (stable /assets/<id> link) when present.
	const filesService = new FilesService({ schema, accountability });

	const existing = dataset
		? await database('dataset_metadata_files as j')
				.join('directus_files as f', 'j.directus_files_id', 'f.id')
				.where('j.dataset_metadata_id', dataset.id)
				.andWhere('f.filename_download', XLSX_FILENAME)
				.select('f.id', 'f.storage')
				.first()
		: null;

	const storage =
		existing?.storage ||
		defaultStorage(env) ||
		(await database('directus_files').select('storage').first())?.storage;

	const fileId = await filesService.uploadOne(
		Readable.from(buffer),
		{ storage, filename_download: XLSX_FILENAME, title: XLSX_TITLE, type: XLSX_TYPE },
		existing?.id, // undefined -> create; id -> replace contents, keep the same id
	);

	// 4. On first creation, link the file into the dataset's downloads (M2M junction).
	if (dataset && !existing) {
		await database('dataset_metadata_files').insert({ dataset_metadata_id: dataset.id, directus_files_id: fileId });
	}

	return {
		fileId,
		filename: XLSX_FILENAME,
		updatedExisting: !!existing,
		counts: { revenue: revenueRows.length, crosswalk: crosswalkRows.length, dictionaryFields: dictionaryFields.length },
	};
}
