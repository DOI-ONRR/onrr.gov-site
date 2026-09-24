import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildWorkbook } from '../../../processes/production/buildWorkbook.js';

function parse(buffer) {
	const wb = XLSX.read(buffer, { type: 'buffer', cellNF: true });
	const sheets = {};
	for (const name of wb.SheetNames) {
		sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
	}
	return { sheetNames: wb.SheetNames, sheets, wb };
}

const sample = {
	periodType: 'Monthly',
	sheetName: 'Monthly Production',
	rows: [
		{ period_date: '2023-05-01', land_class: 'Federal', land_category: 'Onshore', commodity: 'Oil (bbl)', volume: '12345.67' },
	],
	dictionaryFields: [
		{ field_name: 'Date', definition: '<p>The production month.</p>', value_style: 'rows', values: [] },
		{ field_name: 'Land Class', definition: 'Ownership.', value_style: 'rows', values: [{ term: 'Federal', definition: '<p>U.S. government</p>' }] },
	],
};

describe('production buildWorkbook (Monthly)', () => {
	it('produces the Monthly Production + Data Dictionary tabs (no third tab)', () => {
		const { sheetNames } = parse(buildWorkbook(sample));
		expect(sheetNames).toEqual(['Monthly Production', 'Data Dictionary']);
	});

	it('tab 1 mirrors the monthly CSV columns, writes a real date cell, keeps volume numeric', () => {
		const { sheets, wb } = parse(buildWorkbook(sample));
		const t1 = sheets['Monthly Production'];
		expect(t1[0]).toEqual(['Date', 'Land Class', 'Land Category', 'Commodity', 'Volume']);
		expect(t1[1][4]).toBe(12345.67);
		expect(typeof t1[1][4]).toBe('number');
		const dateCell = wb.Sheets['Monthly Production'].A2;
		expect(dateCell.t).toBe('n');
		expect(XLSX.SSF.format(dateCell.z, dateCell.v)).toBe('2023-05-01');
	});

	it('tab 2 flattens dictionary HTML to plain text', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t2 = sheets['Data Dictionary'];
		expect(t2[0]).toEqual(['Field', 'Definition', 'Values']);
		expect(t2[1]).toEqual(['Date', 'The production month.', '']);
		expect(t2[2]).toEqual(['Land Class', 'Ownership.', 'Federal — U.S. government']);
	});

	it('handles empty inputs without throwing', () => {
		const { sheetNames, sheets } = parse(buildWorkbook({ periodType: 'Monthly', sheetName: 'Monthly Production' }));
		expect(sheetNames).toEqual(['Monthly Production', 'Data Dictionary']);
		expect(sheets['Monthly Production']).toEqual([['Date', 'Land Class', 'Land Category', 'Commodity', 'Volume']]);
	});
});
