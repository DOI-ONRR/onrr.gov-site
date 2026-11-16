import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { DATASETS, hasDataset, SUPPORTED_SLUGS } from '../datasets.js';
import { buildWorkbook } from '../buildWorkbook.js';

describe('pricing-exports datasets', () => {
	it('exposes the four pricing slugs and rejects anything else (plant_specific_ucas excluded)', () => {
		expect([...SUPPORTED_SLUGS].sort()).toEqual(['ibmp', 'index-zones', 'major-portion', 'nymex']);
		expect(hasDataset('nymex')).toBe(true);
		expect(hasDataset('plant_specific_ucas')).toBe(false);
	});

	it('flattens embedded index_zones snapshots into one row per zone (parsed or JSON-string column)', () => {
		const rows = DATASETS['index-zones'].flatten([
			{ date: '2024-03-01', index_zones: [{ index_zone: 'Zone A', abbreviation: 'ZA', price: 1.23 }] },
			{ date: '2024-02-01', index_zones: '[{"index_zone":"Zone B","abbreviation":"ZB","price":4.56}]' },
		]);
		expect(rows).toEqual([
			{ indexZone: 'Zone A (ZA)', year: 2024, month: 'March', price: 1.23 },
			{ indexZone: 'Zone B (ZB)', year: 2024, month: 'February', price: 4.56 },
		]);
	});

	it('derives year/month from a JS Date (knex returns pg `date` as a Date, not a string)', () => {
		// Local-midnight Date, as node-postgres builds a `date` column.
		const rows = DATASETS.nymex.flatten([{ date: new Date(2024, 10, 1), average: 2.5, roll: 0.1 }]);
		expect(rows).toEqual([{ year: 2024, month: 'November', average: 2.5, roll: 0.1 }]);
	});

	it('builds a workbook readable by SheetJS with the expected header + first data row', async () => {
		const cfg = DATASETS.nymex;
		const buf = await buildWorkbook(cfg.flatten([{ date: '2024-01-01', average: 2.5, roll: 0.1 }]), cfg.columns, cfg.sheet);
		expect(Buffer.isBuffer(buf)).toBe(true);
		const wb = XLSX.read(buf, { type: 'buffer' }); // cross-tool: ExcelJS output parses in SheetJS
		const aoa = XLSX.utils.sheet_to_json(wb.Sheets[cfg.sheet], { header: 1 });
		expect(aoa[0]).toEqual(['Year', 'Month', 'Calendar Month Avg.', 'NYMEX Roll']);
		expect(aoa[1]).toEqual([2024, 'January', 2.5, 0.1]);
	});

	it('bolds the header row and applies currency/integer formats + widths without changing values', async () => {
		const cfg = DATASETS.nymex;
		const buf = await buildWorkbook(cfg.flatten([{ date: '2024-01-01', average: 2.5, roll: 0.1 }]), cfg.columns, cfg.sheet);
		const wb = new ExcelJS.Workbook();
		await wb.xlsx.load(buf);
		const ws = wb.getWorksheet(cfg.sheet);
		// Columns: 1=Year 2=Month 3=Calendar Month Avg. 4=NYMEX Roll
		expect(ws.getRow(1).font.bold).toBe(true); // header is bold
		expect(ws.getRow(2).getCell(3).value).toBe(2.5); // price value stays numeric
		expect(ws.getColumn(3).numFmt).toBe('$#,##0.00'); // currency format
		expect(ws.getColumn(1).numFmt).toBe('0'); // year is a plain integer (no thousands comma)
		expect(ws.getColumn(1).width).toBeGreaterThanOrEqual(8); // widths emitted + clamped
	});

	it('coerces numeric-string prices to numbers so the currency format applies (pg numeric -> string)', async () => {
		const cfg = DATASETS.nymex;
		// knex returns a pg numeric/decimal column as a string; the cell must still be numeric.
		const buf = await buildWorkbook(cfg.flatten([{ date: new Date(2024, 10, 1), average: '2.345', roll: '-0.12' }]), cfg.columns, cfg.sheet);
		const wb = new ExcelJS.Workbook();
		await wb.xlsx.load(buf);
		const ws = wb.getWorksheet(cfg.sheet);
		const avg = ws.getRow(2).getCell(3);
		const roll = ws.getRow(2).getCell(4);
		expect(avg.type).toBe(ExcelJS.ValueType.Number); // numeric cell, not text
		expect(avg.value).toBe(2.345);
		expect(roll.value).toBe(-0.12);
		expect(avg.numFmt).toBe('$#,##0.00'); // format now actually takes effect
	});
});
