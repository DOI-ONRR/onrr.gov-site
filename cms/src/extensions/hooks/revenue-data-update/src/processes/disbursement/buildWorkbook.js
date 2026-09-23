/**
 * Builds a Disbursements XLSX workbook (two sheets) from already-fetched rows. The same builder
 * serves both the Monthly and Fiscal Year datasets — only the first tab's name differs.
 *
 * Pure and side-effect free so it can be unit-tested without Directus/DB. Returns a Buffer.
 *
 *   Tab <sheetName>        — the same columns as the disbursement CSV download.
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

// Tab 1 columns — mirror the disbursement CSV download (EXPORT_COLUMNS in the charts endpoint).
// Keep this list in sync with that endpoint if the CSV columns change. (The Date column holds Excel
// serials; buildWorkbook applies a date format to it below.)
const DATE_COL = 0;
const DISB_COLUMNS = [
	{ header: 'Date', value: (r) => excelSerial(r.period_date) },
	{ header: 'Fund Type', value: (r) => r.fund_type ?? '' },
	{ header: 'Land Category', value: (r) => r.land_category ?? '' },
	{ header: 'Disbursement Type', value: (r) => r.disbursement_type ?? '' },
	{ header: 'State', value: (r) => r.state_name ?? '' },
	{ header: 'County', value: (r) => r.county ?? '' },
	{ header: 'Category', value: (r) => r.revenue_type ?? '' },
	{ header: 'Commodity', value: (r) => r.commodity ?? '' },
	{ header: 'Disbursement', value: (r) => num(r.amount) },
];
const DISB_WIDTHS = [12, 16, 16, 20, 16, 16, 18, 16, 18];

/**
 * @param {Object} data
 * @param {string} data.sheetName        name of the first tab, e.g. "Monthly Disbursements"
 * @param {Array}  data.rows             disbursement rows (any column referenced by DISB_COLUMNS)
 * @param {Array}  data.dictionaryFields fields of { field_name, definition, value_style, values: [{ term, definition }] }
 * @returns {Buffer} the .xlsx file contents
 */
export function buildWorkbook({ sheetName = 'Disbursements', rows = [], dictionaryFields = [] } = {}) {
	const wb = XLSX.utils.book_new();

	// Tab 1 — the disbursement data (mirrors the CSV download).
	const dataAoa = [DISB_COLUMNS.map((c) => c.header)];
	for (const r of rows) dataAoa.push(DISB_COLUMNS.map((c) => c.value(r)));
	const dataWs = sheetFromAoa(dataAoa, DISB_WIDTHS);
	// The Date column holds Excel serials → give those cells a date number format so Excel shows dates.
	const range = XLSX.utils.decode_range(dataWs['!ref']);
	for (let R = range.s.r + 1; R <= range.e.r; R++) {
		const cell = dataWs[XLSX.utils.encode_cell({ r: R, c: DATE_COL })];
		if (cell && cell.t === 'n') cell.z = 'yyyy-mm-dd';
	}
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

	// compression: true → deflate the zip (SheetJS STOREs uncompressed otherwise). bookSST: true →
	// one shared string table instead of inline strings, which the low-cardinality disbursement
	// columns (state, county, fund type, …) repeat heavily — much smaller on a large data tab.
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', compression: true, bookSST: true });
}
