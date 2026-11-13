import * as XLSX from 'xlsx';

// Build an XLSX Buffer from array-of-objects `rows` using a column spec [{ key, label, format? }].
// Mirrors the former in-browser builder (aoa_to_sheet) so the server output matches what users
// downloaded before. Values are passed through as-is (numbers stay numeric) unless a column
// supplies a `format(value, row)` transform.
export function buildWorkbook(rows, columns, sheetName = 'Data') {
	const header = columns.map((c) => c.label);
	const body = rows.map((r) => columns.map((c) => (c.format ? c.format(r[c.key], r) : r[c.key] ?? '')));
	const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, sheetName);
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
