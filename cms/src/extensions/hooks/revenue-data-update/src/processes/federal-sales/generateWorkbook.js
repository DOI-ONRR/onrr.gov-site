/**
 * Regenerates the Federal Sales XLSX and stores it in Directus.
 *
 * Runs after a successful federal_sales data load. Pulls the sales rows, data dictionary, and notes,
 * builds the workbook, and writes it back to the SAME directus_files record on every run so the
 * download link in the dataset's Downloads section (/assets/<id>) stays stable. On first run it
 * creates the file and links it into dataset_metadata.files; afterwards it just replaces the contents.
 */
import { Readable } from 'node:stream';
import { buildWorkbook } from './buildWorkbook.js';

const SOURCE_COLLECTION = 'federal_sales';
const XLSX_FILENAME = 'federal-sales.xlsx';
const XLSX_TITLE = 'Federal Sales';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
// Tab 1 mirrors the full CSV download, which excludes "Not Tied to a Commodity" — the same scope
// the charts endpoint applies.
const ALLOWED_COMMODITIES = ['Oil', 'Gas', 'NGL'];

// The Directus default storage location (first of STORAGE_LOCATIONS); env value may be array or CSV.
function defaultStorage(env) {
	const loc = env?.STORAGE_LOCATIONS;
	if (Array.isArray(loc)) return loc[0];
	if (typeof loc === 'string' && loc.trim()) return loc.split(',')[0].trim();
	return null;
}

export async function generateFederalSalesWorkbook(context) {
	const { services, database, schema, accountability, env } = context;
	const { FilesService } = services;

	// 1. Pull the three sources (knex bypasses permissions — appropriate for a system export).
	const salesRows = await database(SOURCE_COLLECTION)
		.select('*')
		.whereIn('commodity', ALLOWED_COMMODITIES)
		.orderBy('calendar_year', 'asc');

	const dataset = await database('dataset_metadata')
		.select('id', 'notes')
		.where({ source_collection: SOURCE_COLLECTION })
		.first();

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

	// notes: the repeater stores rows like { Note: '<text>' }; keep order, extract the text.
	let rawNotes = dataset?.notes;
	if (typeof rawNotes === 'string') {
		try { rawNotes = JSON.parse(rawNotes); } catch { rawNotes = []; }
	}
	const notes = (Array.isArray(rawNotes) ? rawNotes : [])
		.map((n) => (n && typeof n === 'object' ? n.Note : n) ?? '')
		.filter((s) => String(s).trim() !== '');

	// 2. Build the workbook buffer.
	const buffer = buildWorkbook({ salesRows, dictionaryFields, notes });

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
		counts: { sales: salesRows.length, dictionaryFields: dictionaryFields.length, notes: notes.length },
	};
}
