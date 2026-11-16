// Per-slug pricing dataset specs: which collection to read, how to flatten it, the export
// columns, and the output filename/sheet. These mirror the pricing table components and the
// former in-browser builder (frontend-nuxt/app/composables/useDataDownloads.js) so the
// server-generated file matches what users downloaded before this moved server-side.
//
// `index_zones` and `ibmp_line_items` are JSON-array columns; knex returns them already parsed,
// but jarr() also tolerates a JSON string just in case.

// Split a Directus date into the {year, long-month} the pricing tables display. knex returns a
// pg `date` column as a JS Date (local midnight), while jsonb/string values arrive as
// 'YYYY-MM-DD'; handle both. A Date uses its local calendar fields (pg builds it that way); a
// string is parsed by its characters — neither path shifts the month/year by timezone.
function ym(value) {
	let year;
	let monthIndex; // 0-11
	if (value instanceof Date) {
		year = value.getFullYear();
		monthIndex = value.getMonth();
	} else {
		const [y, m] = String(value).slice(0, 10).split('-').map(Number);
		year = y;
		monthIndex = (m || 1) - 1;
	}
	const month = new Date(Date.UTC(year || 1970, monthIndex, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
	return { year, month };
}

// Format a due date as MM/DD/YYYY (blank when empty/invalid). Handles a Date or a YYYY-MM-DD string.
function dueDate(value) {
	if (!value) return '';
	let y;
	let m;
	let d;
	if (value instanceof Date) {
		y = value.getFullYear();
		m = value.getMonth() + 1;
		d = value.getDate();
	} else {
		[y, m, d] = String(value).slice(0, 10).split('-').map(Number);
	}
	if (!y || !m || !d) return '';
	return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${y}`;
}

const jarr = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? JSON.parse(v) : []);

// Excel number formats. Prices render as USD to 2 decimals to match the on-screen tables
// (toLocaleString currency); years are plain integers (no thousands comma on "2024").
const USD = '$#,##0.00';
const YEAR = '0';

export const DATASETS = {
	nymex: {
		collection: 'NYMEX',
		select: ['date', 'average', 'roll'],
		order: ['date', 'asc'],
		flatten: (data) => data.map((r) => ({ ...ym(r.date), average: r.average, roll: r.roll })),
		columns: [
			{ key: 'year', label: 'Year', numFmt: YEAR },
			{ key: 'month', label: 'Month' },
			{ key: 'average', label: 'Calendar Month Avg.', numFmt: USD },
			{ key: 'roll', label: 'NYMEX Roll', numFmt: USD },
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
			{ key: 'year', label: 'Year', numFmt: YEAR },
			{ key: 'month', label: 'Month' },
			{ key: 'price', label: 'Price', numFmt: USD },
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
			{ key: 'year', label: 'Year', numFmt: YEAR },
			{ key: 'month', label: 'Month' },
			{ key: 'price', label: 'Price', numFmt: USD },
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
			{ key: 'year', label: 'Year', numFmt: YEAR },
			{ key: 'month', label: 'Month' },
			{ key: 'condensate02', label: 'Condensate (02)', numFmt: USD },
			{ key: 'sweet61', label: 'Sweet (61)', numFmt: USD },
			{ key: 'sour62', label: 'Sour (62)', numFmt: USD },
			{ key: 'asphaltic63', label: 'Asphaltic (63)', numFmt: USD },
			{ key: 'blackWax64', label: 'Black Wax (64)', numFmt: USD },
			{ key: 'yellowWax65', label: 'Yellow Wax (65)', numFmt: USD },
		],
		filename: 'indian-oil-ibmp-prices.xlsx',
		sheet: 'IBMP Prices',
	},
};

export const SUPPORTED_SLUGS = Object.keys(DATASETS);
export const hasDataset = (slug) => Object.prototype.hasOwnProperty.call(DATASETS, slug);
