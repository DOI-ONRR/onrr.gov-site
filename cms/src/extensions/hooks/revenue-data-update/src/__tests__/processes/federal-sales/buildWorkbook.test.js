import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildWorkbook } from '../../../processes/federal-sales/buildWorkbook.js';

function parse(buffer) {
	const wb = XLSX.read(buffer, { type: 'buffer' });
	const sheets = {};
	for (const name of wb.SheetNames) {
		sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
	}
	return { sheetNames: wb.SheetNames, sheets };
}

const sample = {
	salesRows: [
		{
			calendar_year: 2024, land_class: 'Federal', land_category: 'Offshore', state_offshore_region: 'Alaska OCS',
			revenue_type: 'Royalties', commodity: 'Oil', sales_volume: '293675.76', gas_volume: null, sales_value: '21589974.01',
			royalty_value_prior_to_allowance: '3597910.31', transportation_allowance: '0.00', processing_allowance: '0.00',
			royalty_value_less_allowance: '3597910.31', effective_royalty_rate: '0.1667',
		},
	],
	dictionaryFields: [
		{ field_name: 'Calendar Year', definition: '<p>The calendar year of the sales.</p>', value_style: 'rows', values: [] },
	],
	notes: [
		'The data set includes all ONRR Form-2014 reported oil, gas, and NGL royalty transaction codes.',
		'<p>Only offshore data has <strong>Royalty Relief</strong> transactions.</p>',
	],
};

describe('federal-sales buildWorkbook', () => {
	it('produces the three named tabs in order', () => {
		const { sheetNames } = parse(buildWorkbook(sample));
		expect(sheetNames).toEqual(['Federal Oil Gas and NGL Sales', 'Data Dictionary', 'Notes']);
	});

	it('tab 1 mirrors the CSV columns and keeps numeric cells numeric', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t1 = sheets['Federal Oil Gas and NGL Sales'];
		expect(t1[0]).toEqual([
			'Calendar Year', 'Land Class', 'Land Category', 'State/Offshore Region', 'Revenue Type', 'Commodity',
			'Sales Volume', 'Gas MMBtu Volume', 'Sales Value', 'Royalty Value Prior to Allowances (RVPA)',
			'Transportation Allowances (TA)', 'Processing Allowances (PA)', 'Royalty Value Less Allowances (RVLA)',
			'Effective Royalty Rate',
		]);
		expect(t1[1][0]).toBe(2024);
		expect(typeof t1[1][6]).toBe('number'); // sales_volume
		expect(t1[1][7]).toBe(''); // gas_volume null -> blank, not 0
		expect(t1[1][8]).toBe(21589974.01);
	});

	it('tab 2 flattens dictionary HTML to plain text', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t2 = sheets['Data Dictionary'];
		expect(t2[0]).toEqual(['Field', 'Definition', 'Values']);
		expect(t2[1]).toEqual(['Calendar Year', 'The calendar year of the sales.', '']);
	});

	it('tab 3 lists notes one per row, HTML flattened', () => {
		const { sheets } = parse(buildWorkbook(sample));
		const t3 = sheets['Notes'];
		expect(t3[0]).toEqual(['Notes']);
		expect(t3[1][0]).toMatch(/ONRR Form-2014/);
		expect(t3[2][0]).toBe('Only offshore data has Royalty Relief transactions.');
	});

	it('handles empty inputs without throwing', () => {
		const { sheetNames, sheets } = parse(buildWorkbook({}));
		expect(sheetNames).toHaveLength(3);
		expect(sheets['Notes']).toEqual([['Notes']]);
	});
});
