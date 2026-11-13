// Per-slug pricing dataset specs: which collection to read, how to flatten it, the export
// columns, and the output filename/sheet. These mirror the pricing table components and the
// former in-browser builder (frontend-nuxt/app/composables/useDataDownloads.js) so the
// server-generated file matches what users downloaded before this moved server-side.
//
// `index_zones` and `ibmp_line_items` are JSON-array columns; knex returns them already parsed,
// but jarr() also tolerates a JSON string just in case.

// Split a Directus date (YYYY-MM-DD…) into the {year, long-month} the pricing tables display.
// Parsed from the string in UTC so the month/year never shift with the server timezone.
function ym(dateStr) {
	const [y, m] = String(dateStr).slice(0, 10).split('-').map(Number);
	const month = new Date(Date.UTC(y || 1970, (m || 1) - 1, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
	return { year: y, month };
}

// Format a due date as MM/DD/YYYY (blank when empty/invalid).
function dueDate(value) {
	if (!value) return '';
	const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
	if (!y || !m || !d) return '';
	return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${y}`;
}

const jarr = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? JSON.parse(v) : []);

export const DATASETS = {
	nymex: {
		collection: 'NYMEX',
		select: ['date', 'average', 'roll'],
		order: ['date', 'asc'],
		flatten: (data) => data.map((r) => ({ ...ym(r.date), average: r.average, roll: r.roll })),
		columns: [
			{ key: 'year', label: 'Year' },
			{ key: 'month', label: 'Month' },
			{ key: 'average', label: 'Calendar Month Avg.' },
			{ key: 'roll', label: 'NYMEX Roll' },
		],
		filename: 'nymex-price-history.xlsx',
		sheet: 'NYMEX',
	},
	'index-zones': {
		collection: 'index_zones',
		select: ['date', 'index_zones'],
		order: ['date', 'desc'],
		flatten: (data) => {
			const out = [];
			for (const rec of data) {
				const { year, month } = ym(rec.date);
				for (const z of jarr(rec.index_zones)) out.push({ indexZone: `${z.index_zone} (${z.abbreviation})`, year, month, price: z.price });
			}
			return out;
		},
		columns: [
			{ key: 'indexZone', label: 'Index Zone' },
			{ key: 'year', label: 'Year' },
			{ key: 'month', label: 'Month' },
			{ key: 'price', label: 'Price' },
		],
		filename: 'indian-gas-index-zone-prices.xlsx',
		sheet: 'Index Zone Prices',
	},
	'major-portion': {
		collection: 'indian_gas_major_portion',
		select: ['date', 'index_zones'],
		order: ['date', 'desc'],
		flatten: (data) => {
			const out = [];
			for (const rec of data) {
				const { year, month } = ym(rec.date);
				for (const z of jarr(rec.index_zones)) out.push({ designatedArea: z.designatedArea, year, month, price: z.price, dueDate: z.dueDate });
			}
			return out;
		},
		columns: [
			{ key: 'designatedArea', label: 'Designated Area' },
			{ key: 'year', label: 'Year' },
			{ key: 'month', label: 'Month' },
			{ key: 'price', label: 'Price' },
			{ key: 'dueDate', label: 'Due Date', format: (v) => dueDate(v) },
		],
		filename: 'indian-gas-major-portion-prices.xlsx',
		sheet: 'Major Portion Prices',
	},
	ibmp: {
		collection: 'ibmp',
		select: ['date', 'ibmp_line_items'],
		order: ['date', 'desc'],
		flatten: (data) => {
			const out = [];
			for (const rec of data) {
				const { year, month } = ym(rec.date);
				for (const row of jarr(rec.ibmp_line_items)) out.push({
					designatedArea: row.designatedArea,
					year,
					month,
					condensate02: row.condensate02,
					sweet61: row.sweet61,
					sour62: row.sour62,
					asphaltic63: row.asphaltic63,
					blackWax64: row.blackWax64,
					yellowWax65: row.yellowWax65,
				});
			}
			return out;
		},
		columns: [
			{ key: 'designatedArea', label: 'Designated Area' },
			{ key: 'year', label: 'Year' },
			{ key: 'month', label: 'Month' },
			{ key: 'condensate02', label: 'Condensate (02)' },
			{ key: 'sweet61', label: 'Sweet (61)' },
			{ key: 'sour62', label: 'Sour (62)' },
			{ key: 'asphaltic63', label: 'Asphaltic (63)' },
			{ key: 'blackWax64', label: 'Black Wax (64)' },
			{ key: 'yellowWax65', label: 'Yellow Wax (65)' },
		],
		filename: 'indian-oil-ibmp-prices.xlsx',
		sheet: 'IBMP Prices',
	},
};

export const SUPPORTED_SLUGS = Object.keys(DATASETS);
export const hasDataset = (slug) => Object.prototype.hasOwnProperty.call(DATASETS, slug);
