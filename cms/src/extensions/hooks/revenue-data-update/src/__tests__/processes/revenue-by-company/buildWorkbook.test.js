import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildWorkbook } from '../../../processes/revenue-by-company/buildWorkbook.js';

// Read the produced buffer back and return { sheetNames, sheets: { name: aoa } }.
function parse(buffer) {
	const wb = XLSX.read(buffer, { type: 'buffer' });
	const sheets = {};
	for (const name of wb.SheetNames) {
		sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
	}
	return { sheetNames: wb.SheetNames, sheets };
}

const sample = {
	revenueRows: [
		{ calendar_year: 2024, corporate_name: 'Exxon Mobil Corporation', revenue_agency_type: 'Federal - Royalties', commodity: 'Oil', revenue: '1234.50' },
		{ calendar_year: 2023, corporate_name: 'Chevron U.S.A. Inc.', revenue_agency_type: 'Federal - Rents', commodity: 'Gas', revenue: null },
	],
	crosswalkRows: [
		{ payor_name: '31 OFFSHORE LLC', corporate_name: '31 GROUP LLC' },
		{ payor_name: 'ABRAXAS PETROLEUM CORPORATION', corporate_name: 'ABRAXAS PETROLEUM CORP' },
	],
	dictionaryFields: [
		{ field_name: 'Calendar Year', definition: '<p>The calendar year in which ONRR received the revenue.</p>', value_style: 'rows', values: [] },
		{
			field_name: 'Revenue Type',
			definition: '<p>The category of <strong>payment</strong>.</p>',
			value_style: 'rows',
			values: [
				{ term: 'Royalties', definition: '<p>Percentage of production value.</p>' },
				{ term: 'Rents', definition: '<p>Annual pre-production payment.</p>' },
			],
		},
	],
};

describe('buildWorkbook', () => {
	it('produces the three named tabs in order', () => {
		const { sheetNames } = parse(buildWorkbook(sample));
		expect(sheetNames).toEqual(['Federal Revenue by Company', 'Corporate Crosswalk', 'Data Dictionary']);
	});

	it('tab 1 mirrors the CSV columns and keeps numeric cells numeric', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t1 = sheets['Federal Revenue by Company'];
		expect(t1[0]).toEqual(['Calendar Year', 'Company Name', 'Revenue Type', 'Commodity', 'Revenue']);
		// revenue_agency_type is what maps to the "Revenue Type" column (mirrors the CSV).
		expect(t1[1]).toEqual([2024, 'Exxon Mobil Corporation', 'Federal - Royalties', 'Oil', 1234.5]);
		expect(typeof t1[1][0]).toBe('number');
		expect(typeof t1[1][4]).toBe('number');
		// null revenue -> blank cell, not 0.
		expect(t1[2][4]).toBe('');
	});

	it('tab 2 is the payor -> corporate crosswalk', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t2 = sheets['Corporate Crosswalk'];
		expect(t2[0]).toEqual(['Payor Name', 'Corporate Name']);
		expect(t2[1]).toEqual(['31 OFFSHORE LLC', '31 GROUP LLC']);
	});

	it('tab 3 flattens dictionary HTML to plain text and lists enumerated values', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t3 = sheets['Data Dictionary'];
		expect(t3[0]).toEqual(['Field', 'Definition', 'Values']);
		expect(t3[1]).toEqual(['Calendar Year', 'The calendar year in which ONRR received the revenue.', '']);
		// HTML stripped; values joined as "term — definition".
		expect(t3[2][0]).toBe('Revenue Type');
		expect(t3[2][1]).toBe('The category of payment.');
		expect(t3[2][2]).toBe('Royalties — Percentage of production value.\nRents — Annual pre-production payment.');
	});

	it('handles empty inputs without throwing', () => {
		const { sheetNames, sheets } = parse(buildWorkbook({}));
		expect(sheetNames).toHaveLength(3);
		expect(sheets['Federal Revenue by Company']).toEqual([['Calendar Year', 'Company Name', 'Revenue Type', 'Commodity', 'Revenue']]);
	});
});
