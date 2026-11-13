import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
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

	it('builds a readable workbook buffer with the expected header + first data row', () => {
		const cfg = DATASETS.nymex;
		const buf = buildWorkbook(cfg.flatten([{ date: '2024-01-01', average: 2.5, roll: 0.1 }]), cfg.columns, cfg.sheet);
		expect(Buffer.isBuffer(buf)).toBe(true);
		const wb = XLSX.read(buf, { type: 'buffer' });
		const aoa = XLSX.utils.sheet_to_json(wb.Sheets[cfg.sheet], { header: 1 });
		expect(aoa[0]).toEqual(['Year', 'Month', 'Calendar Month Avg.', 'NYMEX Roll']);
		expect(aoa[1]).toEqual([2024, 'January', 2.5, 0.1]);
	});
});
