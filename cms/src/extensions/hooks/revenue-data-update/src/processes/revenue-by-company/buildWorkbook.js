/**
 * Builds the Federal Revenue by Company XLSX workbook (three sheets) from already-fetched rows.
 *
 * Pure and side-effect free so it can be unit-tested without Directus/DB. Returns a Buffer.
 *
 *   Tab "Federal Revenue by Company" — mirrors the dataset's CSV download columns.
 *   Tab "Corporate Crosswalk"        — payor_name -> corporate_name.
 *   Tab "Data Dictionary"            — the dataset's data_dictionary fields + values.
 */
import * as XLSX from 'xlsx';

// Data-dictionary definitions are WYSIWYG HTML; flatten to plain text for spreadsheet cells.
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

/**
 * @param {Object}   data
 * @param {Array}    data.revenueRows       rows of { calendar_year, corporate_name, revenue_agency_type, commodity, revenue }
 * @param {Array}    data.crosswalkRows     rows of { payor_name, corporate_name }
 * @param {Array}    data.dictionaryFields  fields of { field_name, definition, value_style, values: [{ term, definition }] }
 * @returns {Buffer} the .xlsx file contents
 */
export function buildWorkbook({ revenueRows = [], crosswalkRows = [], dictionaryFields = [] } = {}) {
	const wb = XLSX.utils.book_new();

	// Tab 1 — Federal Revenue by Company (mirrors the CSV download).
	const revenueAoa = [['Calendar Year', 'Company Name', 'Revenue Type', 'Commodity', 'Revenue']];
	for (const r of revenueRows) {
		revenueAoa.push([num(r.calendar_year), r.corporate_name ?? '', r.revenue_agency_type ?? '', r.commodity ?? '', num(r.revenue)]);
	}
	XLSX.utils.book_append_sheet(wb, sheetFromAoa(revenueAoa, [14, 40, 26, 16, 18]), 'Federal Revenue by Company');

	// Tab 2 — Corporate Crosswalk.
	const crosswalkAoa = [['Payor Name', 'Corporate Name']];
	for (const r of crosswalkRows) crosswalkAoa.push([r.payor_name ?? '', r.corporate_name ?? '']);
	XLSX.utils.book_append_sheet(wb, sheetFromAoa(crosswalkAoa, [40, 40]), 'Corporate Crosswalk');

	// Tab 3 — Data Dictionary (Field | Definition | Values).
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

	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
