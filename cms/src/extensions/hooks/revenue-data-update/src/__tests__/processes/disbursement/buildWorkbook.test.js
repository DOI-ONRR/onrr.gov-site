import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildWorkbook } from '../../../processes/disbursement/buildWorkbook.js';

function parse(buffer) {
	const wb = XLSX.read(buffer, { type: 'buffer', cellNF: true });
	const sheets = {};
	for (const name of wb.SheetNames) {
		sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
	}
	return { sheetNames: wb.SheetNames, sheets, wb };
}

const sample = {
	rows: [
		{
			period_date: '2014-10-01', fund_type: 'State', land_category: 'Onshore', disbursement_type: 'Royalties',
			state_name: 'Utah', county: 'Uintah', revenue_type: 'Royalties', commodity: 'Oil', amount: '50614416.24',
		},
	],
	dictionaryFields: [
		{ field_name: 'Date', definition: '<p>The date of the disbursement.</p>', value_style: 'rows', values: [] },
		{ field_name: 'Fund Type', definition: 'Recipient fund.', value_style: 'rows', values: [{ term: 'State', definition: '<p>State share</p>' }] },
	],
};

describe('disbursements buildWorkbook', () => {
	it('names the first tab from sheetName, then Data Dictionary (no Notes tab)', () => {
		expect(parse(buildWorkbook({ ...sample, sheetName: 'Monthly Disbursements' })).sheetNames)
			.toEqual(['Monthly Disbursements', 'Data Dictionary']);
		expect(parse(buildWorkbook({ ...sample, sheetName: 'Fiscal Year Disbursements' })).sheetNames)
			.toEqual(['Fiscal Year Disbursements', 'Data Dictionary']);
	});

	it('tab 1 mirrors the CSV columns, writes a real date cell, and keeps the amount numeric', () => {
		const { sheets, wb } = parse(buildWorkbook({ ...sample, sheetName: 'Monthly Disbursements' }));
		const t1 = sheets['Monthly Disbursements'];
		expect(t1[0]).toEqual(['Date', 'Fund Type', 'Land Category', 'Disbursement Type', 'State', 'County', 'Category', 'Commodity', 'Disbursement']);
		expect(t1[1][6]).toBe('Royalties'); // Category = revenue_type
		expect(t1[1][8]).toBe(50614416.24);
		expect(typeof t1[1][8]).toBe('number');
		// Date is a numeric Excel-date cell (serial + date format), not text.
		const dateCell = wb.Sheets['Monthly Disbursements'].A2;
		expect(dateCell.t).toBe('n');
		expect(XLSX.SSF.format(dateCell.z, dateCell.v)).toBe('2014-10-01');
	});

	it('tab 2 flattens dictionary HTML to plain text', () => {
		const { sheets } = parse(buildWorkbook({ ...sample, sheetName: 'Monthly Disbursements' }));
		const t2 = sheets['Data Dictionary'];
		expect(t2[0]).toEqual(['Field', 'Definition', 'Values']);
		expect(t2[1]).toEqual(['Date', 'The date of the disbursement.', '']);
		expect(t2[2]).toEqual(['Fund Type', 'Recipient fund.', 'State — State share']);
	});

	it('handles empty inputs without throwing', () => {
		const { sheetNames, sheets } = parse(buildWorkbook({ sheetName: 'Monthly Disbursements' }));
		expect(sheetNames).toEqual(['Monthly Disbursements', 'Data Dictionary']);
		expect(sheets['Monthly Disbursements']).toEqual([
			['Date', 'Fund Type', 'Land Category', 'Disbursement Type', 'State', 'County', 'Category', 'Commodity', 'Disbursement'],
		]);
	});
});
