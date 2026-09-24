/**
 * Builds a Production XLSX workbook (two sheets) from already-fetched rows. One builder serves every
 * period grain — the first tab's name and columns differ per grain (keyed by period type).
 *
 * Pure and side-effect free so it can be unit-tested without Directus/DB. Returns a Buffer.
 *
 *   Tab <sheetName>        — the same columns as the production CSV download for that grain.
 *   Tab "Data Dictionary"  — the dataset's data_dictionary fields + values.
 */
import * as XLSX from 'xlsx';

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

// Numeric cells should be real numbers (pg numeric comes back from knex as a string).
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? '' : Number(v));

// Excel date serial (days since the 1900 date system's 1899-12-30 epoch), computed purely from the
// Y/M/D in UTC so it never shifts by the server's timezone. '' for blanks/invalid. Written as a real
// Excel date cell (numeric value + date format) so Excel sorts/filters/pivots it as a date.
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
function excelSerial(v) {
	if (v == null || v === '') return '';
	let y, m, d;
	if (v instanceof Date) {
		y = v.getUTCFullYear();
		m = v.getUTCMonth() + 1;
		d = v.getUTCDate();
	} else {
		[y, m, d] = String(v).slice(0, 10).split('-').map(Number);
	}
	if (!y || !m || !d) return '';
	return Math.round((Date.UTC(y, m - 1, d) - EXCEL_EPOCH_UTC) / 86400000);
}

function sheetFromAoa(aoa, colWidths) {
	const ws = XLSX.utils.aoa_to_sheet(aoa);
	if (colWidths) ws['!cols'] = colWidths.map((wch) => ({ wch }));
	return ws;
}

// Tab 1 columns per period grain — mirror the production CSV download (EXPORT_COLUMNS in the charts
// endpoint). Keep these in sync with that endpoint if the CSV columns change. `date: true` marks a
// column whose value is an Excel serial that should render as a date. (Fiscal Year / Calendar Year
// grains are added when those workbooks are wired.)
const PRODUCTION_COLUMNS = {
	Monthly: [
		{ header: 'Date', value: (r) => excelSerial(r.period_date), date: true, width: 12 },
		{ header: 'Land Class', value: (r) => r.land_class ?? '', width: 16 },
		{ header: 'Land Category', value: (r) => r.land_category ?? '', width: 16 },
		{ header: 'Commodity', value: (r) => r.commodity ?? '', width: 18 },
		{ header: 'Volume', value: (r) => num(r.volume), width: 16 },
	],
};

/**
 * @param {Object} data
 * @param {string} data.periodType       period grain key into PRODUCTION_COLUMNS, e.g. "Monthly"
 * @param {string} data.sheetName        name of the first tab, e.g. "Monthly Production"
 * @param {Array}  data.rows             production rows (any column referenced by the grain's columns)
 * @param {Array}  data.dictionaryFields fields of { field_name, definition, value_style, values: [{ term, definition }] }
 * @returns {Buffer} the .xlsx file contents
 */
export function buildWorkbook({ periodType = 'Monthly', sheetName = 'Production', rows = [], dictionaryFields = [] } = {}) {
	const columns = PRODUCTION_COLUMNS[periodType];
	if (!columns) throw new Error(`buildWorkbook: no production columns for period type "${periodType}"`);

	const wb = XLSX.utils.book_new();

	// Tab 1 — the production data (mirrors the CSV download for this grain).
	const dataAoa = [columns.map((c) => c.header)];
	for (const r of rows) dataAoa.push(columns.map((c) => c.value(r)));
	const dataWs = sheetFromAoa(dataAoa, columns.map((c) => c.width || 16));
	// Give date columns (values are Excel serials) a date number format so Excel shows dates.
	const range = XLSX.utils.decode_range(dataWs['!ref']);
	columns.forEach((c, ci) => {
		if (!c.date) return;
		for (let R = range.s.r + 1; R <= range.e.r; R++) {
			const cell = dataWs[XLSX.utils.encode_cell({ r: R, c: ci })];
			if (cell && cell.t === 'n') cell.z = 'yyyy-mm-dd';
		}
	});
	XLSX.utils.book_append_sheet(wb, dataWs, sheetName);

	// Tab 2 — Data Dictionary (Field | Definition | Values).
	const dictAoa = [['Field', 'Definition', 'Values']];
	for (const f of dictionaryFields) {
		const values = (f.values || [])
			.map((v) => {
				const def = htmlToText(v.definition);
				return def ? `${v.term} — ${def}` : v.term;
			})
			.join('\n');
		dictAoa.push([f.field_name ?? '', htmlToText(f.definition), values]);
	}
	XLSX.utils.book_append_sheet(wb, sheetFromAoa(dictAoa, [22, 60, 50]), 'Data Dictionary');

	// compression + shared string table keep the large data tab a reasonable size.
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', compression: true, bookSST: true });
}
