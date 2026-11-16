import ExcelJS from 'exceljs';

// Column-width clamps (in characters). Names shouldn't run away; numbers shouldn't be cramped.
const MIN_WIDTH = 8;
const MAX_WIDTH = 40;
const WIDTH_PADDING = 2;

// Resolve a cell's value for a column. A `format` column emits a display string. A `numFmt`
// column is coerced to a Number when it holds a numeric value — Postgres numeric/decimal columns
// arrive from node-postgres as STRINGS, and Excel only applies a number format to numeric cells
// (a text cell renders as-is, ignoring the format). Empty/non-numeric values pass through.
function cellValue(col, row) {
	if (col.format) return col.format(row[col.key], row);
	const v = row[col.key];
	if (col.numFmt && v !== null && v !== undefined && v !== '') {
		const n = Number(v);
		if (!Number.isNaN(n)) return n;
	}
	return v ?? '';
}

// Auto-size a column to its widest cell text (header included), clamped. Currency columns get a
// little extra room for the '$' and grouping comma the number format adds.
function autoWidth(col, rows) {
	const pad = col.numFmt && col.numFmt.includes('$') ? 2 : 0;
	let max = String(col.label).length;
	for (const r of rows) {
		const v = col.format ? col.format(r[col.key], r) : r[col.key];
		const len = String(v ?? '').length + pad;
		if (len > max) max = len;
	}
	return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, max + WIDTH_PADDING));
}

// Build an XLSX Buffer from array-of-objects `rows` using a column spec
// [{ key, label, format?, numFmt?, width? }]:
//   - format(value, row): returns a display string; the cell becomes text (no numFmt).
//   - numFmt: an Excel number-format code applied to the column (e.g. '$#,##0.00', '0'). Values
//     stay numeric so Excel can sort/compute on them; only the display changes.
//   - width: a fixed column width in characters; omit to auto-size from content.
// Uses ExcelJS (not community SheetJS) so the header row can be styled — SheetJS community
// silently drops fonts/fills on write. Async because ExcelJS writes the buffer asynchronously.
export async function buildWorkbook(rows, columns, sheetName = 'Data') {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet(sheetName);

	// Columns: header label, width, and the number format (applied column-wide; ExcelJS ignores
	// it on text cells). `key` is unused for lookup — we add rows positionally below.
	ws.columns = columns.map((c) => ({
		header: c.label,
		width: c.width || autoWidth(c, rows),
		style: c.numFmt ? { numFmt: c.numFmt } : {},
	}));

	// Data rows. See cellValue(): format columns emit strings, numFmt columns are coerced numeric.
	for (const r of rows) {
		ws.addRow(columns.map((c) => cellValue(c, r)));
	}

	// Bold the header row.
	ws.getRow(1).font = { bold: true };

	const buf = await wb.xlsx.writeBuffer();
	return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}
