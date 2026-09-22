/**
 * Builds the Federal Sales XLSX workbook (three sheets) from already-fetched rows.
 *
 * Pure and side-effect free so it can be unit-tested without Directus/DB. Returns a Buffer.
 *
 *   Tab "Federal Oil Gas and NGL Sales" — the same columns as the dataset's full CSV download.
 *   Tab "Data Dictionary"               — the dataset's data_dictionary fields + values.
 *   Tab "Notes"                         — the dataset_metadata.notes repeater, one note per row.
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

function sheetFromAoa(aoa, colWidths) {
	const ws = XLSX.utils.aoa_to_sheet(aoa);
	if (colWidths) ws['!cols'] = colWidths.map((wch) => ({ wch }));
	return ws;
}

// Tab 1 columns — mirror the federal-sales CSV download (EXPORT_COLUMNS in the charts endpoint).
// Keep this list in sync with that endpoint if the CSV columns change.
const SALES_COLUMNS = [
	{ header: 'Calendar Year', value: (r) => num(r.calendar_year) },
	{ header: 'Land Class', value: (r) => r.land_class ?? '' },
	{ header: 'Land Category', value: (r) => r.land_category ?? '' },
	{ header: 'State/Offshore Region', value: (r) => r.state_offshore_region ?? '' },
	{ header: 'Revenue Type', value: (r) => r.revenue_type ?? '' },
	{ header: 'Commodity', value: (r) => r.commodity ?? '' },
	{ header: 'Sales Volume', value: (r) => num(r.sales_volume) },
	{ header: 'Gas MMBtu Volume', value: (r) => num(r.gas_volume) },
	{ header: 'Sales Value', value: (r) => num(r.sales_value) },
	{ header: 'Royalty Value Prior to Allowances (RVPA)', value: (r) => num(r.royalty_value_prior_to_allowance) },
	{ header: 'Transportation Allowances (TA)', value: (r) => num(r.transportation_allowance) },
	{ header: 'Processing Allowances (PA)', value: (r) => num(r.processing_allowance) },
	{ header: 'Royalty Value Less Allowances (RVLA)', value: (r) => num(r.royalty_value_less_allowance) },
	{ header: 'Effective Royalty Rate', value: (r) => num(r.effective_royalty_rate) },
];
const SALES_WIDTHS = [13, 16, 16, 22, 18, 12, 16, 18, 18, 22, 22, 22, 22, 18];

/**
 * @param {Object} data
 * @param {Array}  data.salesRows        federal_sales rows (any column referenced by SALES_COLUMNS)
 * @param {Array}  data.dictionaryFields fields of { field_name, definition, value_style, values: [{ term, definition }] }
 * @param {Array}  data.notes            note strings (already extracted from the notes repeater)
 * @returns {Buffer} the .xlsx file contents
 */
export function buildWorkbook({ salesRows = [], dictionaryFields = [], notes = [] } = {}) {
	const wb = XLSX.utils.book_new();

	// Tab 1 — Federal Oil Gas and NGL Sales (mirrors the CSV download).
	const salesAoa = [SALES_COLUMNS.map((c) => c.header)];
	for (const r of salesRows) salesAoa.push(SALES_COLUMNS.map((c) => c.value(r)));
	XLSX.utils.book_append_sheet(wb, sheetFromAoa(salesAoa, SALES_WIDTHS), 'Federal Oil Gas and NGL Sales');

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

	// Tab 3 — Notes (one note per row).
	const notesAoa = [['Notes']];
	for (const n of notes) notesAoa.push([htmlToText(n)]);
	XLSX.utils.book_append_sheet(wb, sheetFromAoa(notesAoa, [120]), 'Notes');

	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
