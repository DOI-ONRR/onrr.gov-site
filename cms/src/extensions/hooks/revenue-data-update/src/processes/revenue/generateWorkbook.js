/**
 * Regenerates the combined Revenue XLSX and stores it in Directus.
 *
 * Revenue is the one dataset big enough (the Monthly grain alone is ~400k rows) that building the
 * workbook in memory with SheetJS would spike ~1.7 GB and OOM-kill the CMS instance. So this uses
 * exceljs's STREAMING writer (WorkbookWriter): each grain's rows are loaded, streamed to a temp file
 * row-by-row (never held as cell objects), then released before the next grain — peak memory stays a
 * few hundred MB. The temp file is uploaded to Directus and removed.
 *
 * One file, tabs: Monthly, Calendar Year, Fiscal Year, Data Dictionary. Written back to the same
 * directus_files record each run so the download link (/assets/<id>) stays stable.
 */
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SOURCE_COLLECTION = 'revenue';
const XLSX_FILENAME = 'revenue.xlsx';
const XLSX_TITLE = 'Revenue';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const ymd = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
const yearNum = (d) => {
	const y = Number(ymd(d).slice(0, 4));
	return Number.isFinite(y) ? y : null;
};

// WYSIWYG / rich-text flattened to plain text for spreadsheet cells (harmless on plain text).
function htmlToText(html) {
	if (html == null) return '';
	return String(html)
		.replace(/<\s*br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/&quot;/gi, '"')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

// Columns per grain — mirror the revenue CSV download (EXPORT_COLUMNS in the charts endpoint). Keep
// these in sync with that endpoint if the CSV columns change. Monthly is dated; the annual grains lead
// with their year column (as a number); the detail columns are shared.
const SHARED_COLUMNS = [
	{ header: 'Land Class', get: (r) => r.land_class ?? '' },
	{ header: 'Land Category', get: (r) => r.land_category ?? '' },
	{ header: 'State', get: (r) => r.state ?? '' },
	{ header: 'County', get: (r) => r.county ?? '' },
	{ header: 'FIPS Code', get: (r) => r.fips_code ?? '' },
	{ header: 'Offshore Region', get: (r) => r.offshore_region ?? '' },
	{ header: 'Revenue Type', get: (r) => r.revenue_type ?? '' },
	{ header: 'Mineral Lease Type', get: (r) => r.mineral_lease_type ?? '' },
	{ header: 'Commodity', get: (r) => r.commodity ?? '' },
	{ header: 'Product', get: (r) => r.product ?? '' },
	{ header: 'Revenue', get: (r) => num(r.amount) },
];
const GRAINS = [
	{ periodType: 'Monthly', sheetName: 'Monthly', columns: [{ header: 'Date', get: (r) => ymd(r.period_date) }, ...SHARED_COLUMNS] },
	{ periodType: 'Calendar Year', sheetName: 'Calendar Year', columns: [{ header: 'Calendar Year', get: (r) => yearNum(r.period_date) }, ...SHARED_COLUMNS] },
	{ periodType: 'Fiscal Year', sheetName: 'Fiscal Year', columns: [{ header: 'Fiscal Year', get: (r) => num(r.fiscal_year) }, ...SHARED_COLUMNS] },
];

function defaultStorage(env) {
	const loc = env?.STORAGE_LOCATIONS;
	if (Array.isArray(loc)) return loc[0];
	if (typeof loc === 'string' && loc.trim()) return loc.split(',')[0].trim();
	return null;
}

// Rows for one grain — same joins/columns/order as the charts CSV export (only the fields the columns
// need). Returned as a plain array (~a few hundred MB for Monthly); it's streamed out then released.
function queryRows(database, periodType) {
	return database('revenue')
		.join('period as p', 'revenue.period', 'p.id')
		.leftJoin('location as l', 'revenue.location', 'l.id')
		.leftJoin('commodity as c', 'revenue.commodity', 'c.id')
		.leftJoin('fund as f', 'revenue.fund', 'f.id')
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
			'f.revenue_type',
			'c.mineral_lease_type',
			'c.name as commodity',
			'c.product',
			'revenue.amount',
		);
}

async function findDatasetRow(database) {
	const all = await database('dataset_metadata').where({ source_collection: SOURCE_COLLECTION }).select('id');
	if (all.length <= 1) return all[0] || null;
	for (const row of all) {
		const [{ n }] = await database('data_dictionary_fields').where({ dataset: row.id }).count({ n: '*' });
		if (Number(n) > 0) return row;
	}
	return all[0];
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

export async function generateRevenueWorkbook(context) {
	const { services, database, schema, accountability, env } = context;

	const dataset = await findDatasetRow(database);
	if (!dataset) return { skipped: 'no revenue dataset_metadata row', filename: XLSX_FILENAME };
	const dictionaryFields = await loadDictionary(database, dataset.id);

	// 1. Stream each grain into a temp .xlsx (rows written to disk row-by-row, not held in memory).
	const tmpPath = path.join(os.tmpdir(), `revenue-${process.pid}-${Date.now()}.xlsx`);
	const counts = {};
	try {
		const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: tmpPath, useStyles: false, useSharedStrings: true });

		for (const grain of GRAINS) {
			const ws = wb.addWorksheet(grain.sheetName);
			ws.addRow(grain.columns.map((c) => c.header)).commit();
			const rows = await queryRows(database, grain.periodType);
			for (const r of rows) ws.addRow(grain.columns.map((c) => c.get(r))).commit();
			ws.commit();
			counts[grain.sheetName] = rows.length;
		}

		const dws = wb.addWorksheet('Data Dictionary');
		dws.addRow(['Field', 'Definition', 'Values']).commit();
		for (const f of dictionaryFields) {
			const values = (f.values || [])
				.map((v) => {
					const def = htmlToText(v.definition);
					return def ? `${v.term} — ${def}` : v.term;
				})
				.join('\n');
			dws.addRow([f.field_name ?? '', htmlToText(f.definition), values]).commit();
		}
		dws.commit();

		await wb.commit(); // finalize the temp file

		// 2. Store in Directus, reusing the same file record (stable /assets/<id> link) when present.
		const { FilesService } = services;
		const filesService = new FilesService({ schema, accountability });

		const existing = await database('dataset_metadata_files as j')
			.join('directus_files as f', 'j.directus_files_id', 'f.id')
			.where('j.dataset_metadata_id', dataset.id)
			.andWhere('f.filename_download', XLSX_FILENAME)
			.select('f.id', 'f.storage')
			.first();

		const storage =
			existing?.storage ||
			defaultStorage(env) ||
			(await database('directus_files').select('storage').first())?.storage;

		const fileId = await filesService.uploadOne(
			fs.createReadStream(tmpPath),
			{ storage, filename_download: XLSX_FILENAME, title: XLSX_TITLE, type: XLSX_TYPE },
			existing?.id,
		);

		if (!existing) {
			await database('dataset_metadata_files').insert({ dataset_metadata_id: dataset.id, directus_files_id: fileId });
		}

		return { fileId, filename: XLSX_FILENAME, updatedExisting: !!existing, counts, dictionaryFields: dictionaryFields.length };
	} finally {
		fs.promises.unlink(tmpPath).catch(() => {});
	}
}
