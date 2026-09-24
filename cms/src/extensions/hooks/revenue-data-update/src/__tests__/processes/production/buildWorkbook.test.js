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

const monthlyDict = [
	{ field_name: 'Date', definition: '<p>The production month.</p>', value_style: 'rows', values: [] },
	{ field_name: 'Land Class', definition: 'Ownership.', value_style: 'rows', values: [{ term: 'Federal', definition: '<p>U.S. government</p>' }] },
];

describe('production buildWorkbook (Monthly)', () => {
	const monthly = {
		sheets: [{
			periodType: 'Monthly', sheetName: 'Monthly Production',
			rows: [{ period_date: '2023-05-01', land_class: 'Federal', land_category: 'Onshore', commodity: 'Oil (bbl)', volume: '12345.67' }],
		}],
		dictionaryFields: monthlyDict,
	};

	it('produces the Monthly Production + Data Dictionary tabs', () => {
		expect(parse(buildWorkbook(monthly)).sheetNames).toEqual(['Monthly Production', 'Data Dictionary']);
	});

	it('tab 1 mirrors the monthly CSV columns, writes a real date cell, keeps volume numeric', () => {
		const { sheets, wb } = parse(buildWorkbook(monthly));
		const t1 = sheets['Monthly Production'];
		expect(t1[0]).toEqual(['Date', 'Land Class', 'Land Category', 'Commodity', 'Volume']);
		expect(t1[1][4]).toBe(12345.67);
		const dateCell = wb.Sheets['Monthly Production'].A2;
		expect(dateCell.t).toBe('n');
		expect(XLSX.SSF.format(dateCell.z, dateCell.v)).toBe('2023-05-01');
	});

	it('flattens dictionary HTML to plain text', () => {
		const t2 = parse(buildWorkbook(monthly)).sheets['Data Dictionary'];
		expect(t2[0]).toEqual(['Field', 'Definition', 'Values']);
		expect(t2[2]).toEqual(['Land Class', 'Ownership.', 'Federal — U.S. government']);
	});
});

describe('production buildWorkbook (Annual: Fiscal Year + Calendar Year tabs)', () => {
	const annualRow = {
		land_class: 'Federal', land_category: 'Offshore', state: 'Louisiana', county: 'Cameron',
		fips_code: '22023', offshore_region: 'Gulf of Mexico', product: 'Oil (bbl)', volume: '4200.75',
	};
	const ANNUAL_HEADERS = ['Land Class', 'Land Category', 'State', 'County', 'FIPS Code', 'Offshore Region', 'Product', 'Volume'];
	const annual = buildWorkbook({
		sheets: [
			{ periodType: 'Fiscal Year', sheetName: 'Fiscal Year', rows: [{ fiscal_year: 2022, ...annualRow }] },
			{ periodType: 'Calendar Year', sheetName: 'Calendar Year', rows: [{ period_date: '2021-01-01', ...annualRow }] },
		],
		dictionaryFields: [],
	});

	it('produces Fiscal Year + Calendar Year data tabs, then Data Dictionary', () => {
		expect(parse(annual).sheetNames).toEqual(['Fiscal Year', 'Calendar Year', 'Data Dictionary']);
	});

	it('Fiscal Year tab: numeric year, annual detail columns, FIPS stays text', () => {
		const t = parse(annual).sheets['Fiscal Year'];
		expect(t[0]).toEqual(['Fiscal Year', ...ANNUAL_HEADERS]);
		expect(t[1][0]).toBe(2022);
		expect(t[1][5]).toBe('22023'); // FIPS Code text (leading zeros safe)
		expect(t[1][8]).toBe(4200.75); // Volume numeric
	});

	it('Calendar Year tab: year derived from period_date as a number', () => {
		const t = parse(annual).sheets['Calendar Year'];
		expect(t[0]).toEqual(['Calendar Year', ...ANNUAL_HEADERS]);
		expect(t[1][0]).toBe(2021);
	});
});
