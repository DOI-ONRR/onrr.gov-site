// Federal Sales chart-data routes (mounted at /charts/federal-sales).
//
// Unlike the disbursement/revenue/production pivots (one measure, spread across year COLUMNS),
// federal sales aggregates SIX measures for the selected calendar-year RANGE and shows them as
// the table's columns, one row per commodity:
//   Sales Volume, Sales Value, RVPA, TA, PA, RVLA.
// `federal_sales` is already a flat, denormalized collection (calendar_year, land_class,
// land_category, state_offshore_region, commodity are plain columns) — no joins needed.
//
// Filters: calendar-year range, Commodity (a fixed set), Land Type, State/Offshore Region.
// "Land Type" is land_class + land_category combined (e.g. "Federal Onshore"). An optional
// breakout (Land Type or Region) turns each commodity into a group with one sub-row per value.

const csvParam = (v) =>
	(Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

// The six measures, in display order. `col` is the DB column; `key` is the response/API key.
const MEASURES = [
	{ key: 'sales_volume', col: 'sales_volume', label: 'Sales Volume', format: 'number' },
	{ key: 'sales_value', col: 'sales_value', label: 'Sales Value', format: 'currency' },
	{ key: 'rvpa', col: 'royalty_value_prior_to_allowance', label: 'Royalty Value Prior to Allowances (RVPA)', format: 'currency' },
	{ key: 'ta', col: 'transportation_allowance', label: 'Transportation Allowances (TA)', format: 'currency' },
	{ key: 'pa', col: 'processing_allowance', label: 'Processing Allowances (PA)', format: 'currency' },
	{ key: 'rvla', col: 'royalty_value_less_allowance', label: 'Royalty Value Less Allowances (RVLA)', format: 'currency' },
];

// "Land Type" = land_class + land_category combined; empty -> NULL so it drops out cleanly.
const LAND_TYPE_EXPR = `NULLIF(TRIM(CONCAT_WS(' ', "land_class", "land_category")), '')`;
const REGION_COL = 'state_offshore_region';
// The Commodity filter is limited to these — matched case-insensitively against the data, so
// the options use the data's actual casing while staying restricted to this set, in this order.
// "Not Tied to a Commodity" (a literal value in the data) is deliberately excluded everywhere —
// filter options, pivot results, and export.
const ALLOWED_COMMODITIES = ['Oil', 'Gas', 'NGL'];
const commodityRank = (c) => {
	const i = ALLOWED_COMMODITIES.findIndex((a) => a.toLowerCase() === String(c ?? '').toLowerCase());
	return i === -1 ? ALLOWED_COMMODITIES.length : i;
};
const isAllowedCommodity = (c) => commodityRank(c) < ALLOWED_COMMODITIES.length;

const BREAKOUT_EXPRS = { land_type: LAND_TYPE_EXPR, region: `"${REGION_COL}"` };

// Apply the preview filters to a federal_sales query builder. Mutates in place.
function applyFilters(q, { fromYear, toYear, commodities, landTypes, regions }) {
	// Always restrict to the allowed commodities (excludes "Not Tied to a Commodity" and any
	// stray/null values) — so results and export never include it, regardless of the filter.
	q.whereIn('commodity', ALLOWED_COMMODITIES);
	if (fromYear) q.where('calendar_year', '>=', Number(fromYear));
	if (toYear) q.where('calendar_year', '<=', Number(toYear));
	if (Array.isArray(landTypes) && landTypes.length) {
		q.whereRaw(`${LAND_TYPE_EXPR} IN (${landTypes.map(() => '?').join(', ')})`, landTypes);
	}
	if (Array.isArray(regions) && regions.length) q.whereIn(REGION_COL, regions);
	if (Array.isArray(commodities) && commodities.length) q.whereIn('commodity', commodities);
}

export async function federalSalesPivot(database, opts = {}) {
	const breakoutExpr = BREAKOUT_EXPRS[opts.breakout] || null;
	const table = 'federal_sales';
	const base = () => database.from(table);

	const cols = [database.raw('"commodity" as "dim"')];
	if (breakoutExpr) cols.push(database.raw(`${breakoutExpr} as "sub"`));
	for (const m of MEASURES) cols.push(database.raw(`SUM("${m.col}") as "${m.key}"`));
	cols.push(database.raw('COUNT(*) as "cnt"'));

	const aggQ = base().select(...cols);
	applyFilters(aggQ, opts);
	aggQ.groupByRaw(breakoutExpr ? `"commodity", ${breakoutExpr}` : '"commodity"');

	const countQ = base().count(`${table}.id as n`);
	applyFilters(countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	const zero = () => Object.fromEntries(MEASURES.map((m) => [m.key, 0]));
	const addInto = (target, r) => { for (const m of MEASURES) target[m.key] += Number(r[m.key]) || 0; };

	const groups = new Map();
	const totals = zero();
	for (const r of rows) {
		const label = r.dim == null || r.dim === '' ? '(none)' : r.dim;
		let g = groups.get(label);
		if (!g) {
			g = { key: label, values: zero(), recordCount: 0, subs: breakoutExpr ? new Map() : null };
			groups.set(label, g);
		}
		addInto(g.values, r);
		g.recordCount += Number(r.cnt) || 0;
		addInto(totals, r);
		if (breakoutExpr) {
			const subKey = r.sub == null || r.sub === '' ? '(unspecified)' : r.sub;
			let s = g.subs.get(subKey);
			if (!s) { s = { key: subKey, values: zero() }; g.subs.set(subKey, s); }
			addInto(s.values, r);
		}
	}

	// Rank commodities by Sales Value (the headline measure).
	const groupList = [...groups.values()]
		.map((g) => {
			const out = { key: g.key, values: g.values, recordCount: g.recordCount };
			if (breakoutExpr) out.rows = [...g.subs.values()].sort((a, b) => b.values.sales_value - a.values.sales_value);
			return out;
		})
		.sort((a, b) => b.values.sales_value - a.values.sales_value);

	return {
		groupBy: 'commodity',
		breakout: breakoutExpr ? opts.breakout : null,
		measures: MEASURES.map((m) => ({ key: m.key, label: m.label, format: m.format })),
		groups: groupList,
		totals,
		recordCount: Number(countRow?.n) || 0,
	};
}

// Time-series shape for the preview charts: sales_volume + RVLA by calendar year, per commodity.
// Uses the same filters as the pivot (year range, commodity, land type, region) so the charts
// track the filter bar. Values are arrays aligned to `years`; missing year/commodity cells are
// null (a gap in the line rather than a false zero).
export async function federalSalesTimeseries(database, opts = {}) {
	const q = database
		.from('federal_sales')
		.select(
			'commodity',
			'calendar_year',
			database.raw('SUM("sales_volume") as "sv"'),
			database.raw('SUM("royalty_value_less_allowance") as "rvla"')
		)
		.groupByRaw('"commodity", "calendar_year"')
		.orderBy('calendar_year', 'asc');
	applyFilters(q, opts);
	const rows = await q;

	const yearSet = new Set();
	const byCommodity = new Map();
	for (const r of rows) {
		const c = r.commodity;
		const y = Number(r.calendar_year);
		yearSet.add(y);
		if (!byCommodity.has(c)) byCommodity.set(c, { sv: {}, rvla: {} });
		const e = byCommodity.get(c);
		e.sv[y] = Number(r.sv) || 0;
		e.rvla[y] = Number(r.rvla) || 0;
	}
	const years = [...yearSet].sort((a, b) => a - b);
	const commodities = [...byCommodity.keys()].sort((a, b) => commodityRank(a) - commodityRank(b));
	const salesVolume = {};
	const rvla = {};
	for (const c of commodities) {
		const e = byCommodity.get(c);
		salesVolume[c] = years.map((y) => (e.sv[y] == null ? null : e.sv[y]));
		rvla[c] = years.map((y) => (e.rvla[y] == null ? null : e.rvla[y]));
	}
	return { years, commodities, salesVolume, rvla };
}

// ── CSV export columns ────────────────────────────────────────────────────────────────────────
const EXPORT_COLUMNS = [
	{ header: 'Calendar Year', value: (r) => r.calendar_year },
	{ header: 'Land Class', value: (r) => r.land_class },
	{ header: 'Land Category', value: (r) => r.land_category },
	{ header: 'State/Offshore Region', value: (r) => r.state_offshore_region },
	{ header: 'Revenue Type', value: (r) => r.revenue_type },
	{ header: 'Commodity', value: (r) => r.commodity },
	{ header: 'Sales Volume', value: (r) => r.sales_volume },
	{ header: 'Gas MMBtu Volume', value: (r) => r.gas_volume },
	{ header: 'Sales Value', value: (r) => r.sales_value },
	{ header: 'Royalty Value Prior to Allowances (RVPA)', value: (r) => r.royalty_value_prior_to_allowance },
	{ header: 'Transportation Allowances (TA)', value: (r) => r.transportation_allowance },
	{ header: 'Processing Allowances (PA)', value: (r) => r.processing_allowance },
	{ header: 'Royalty Value Less Allowances (RVLA)', value: (r) => r.royalty_value_less_allowance },
	{ header: 'Effective Royalty Rate', value: (r) => r.effective_royalty_rate },
];

// Raw federal_sales records matching the preview filters, for the CSV export. Selects every base
// column, so EXPORT_COLUMNS above can reference any of them without
// touching this query.
async function federalSalesRecords(database, opts = {}) {
	const q = database
		.select('federal_sales.*', database.raw(`${LAND_TYPE_EXPR} as land_type`))
		.from('federal_sales')
		.orderBy('calendar_year', 'asc');
	applyFilters(q, opts);
	return q;
}

async function federalSalesOptions(database) {
	const [years, commodities, landTypes, regions] = await Promise.all([
		database.from('federal_sales').distinct('calendar_year').whereNotNull('calendar_year').orderBy('calendar_year', 'asc').then((r) => r.map((x) => x.calendar_year)),
		// Distinct commodity values from the data, limited to the allowed set and put in its order.
		database.from('federal_sales').distinct('commodity').whereNotNull('commodity').then((r) => r.map((x) => x.commodity).filter(isAllowedCommodity).sort((a, b) => commodityRank(a) - commodityRank(b))),
		database.from('federal_sales').distinct(database.raw(`${LAND_TYPE_EXPR} as lt`)).then((r) => r.map((x) => x.lt).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)))),
		database.from('federal_sales').distinct(REGION_COL).whereNotNull(REGION_COL).orderBy(REGION_COL, 'asc').then((r) => r.map((x) => x[REGION_COL]).filter((x) => x !== '')),
	]);
	return { years, commodities, landTypes, regions };
}

function readOpts(req) {
	return {
		fromYear: req.query.fromYear || null,
		toYear: req.query.toYear || null,
		commodities: csvParam(req.query.commodities),
		landTypes: csvParam(req.query.landTypes),
		regions: csvParam(req.query.regions),
		breakout: req.query.breakout || '',
	};
}

// Registers routes under `base` (mounted as /federal-sales -> /charts/federal-sales).
export default (router, { database }, base = '') => {
	// GET /charts/federal-sales/pivot/options — filter dropdown values.
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await federalSalesOptions(database));
		} catch (error) {
			console.error('charts/federal-sales/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch federal sales pivot options' });
		}
	});

	// GET /charts/federal-sales/pivot?fromYear=&toYear=&commodities=&landTypes=&regions=&breakout=
	router.get(`${base}/pivot`, async (req, res) => {
		try {
			res.json(await federalSalesPivot(database, readOpts(req)));
		} catch (error) {
			console.error('charts/federal-sales/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch federal sales pivot' });
		}
	});

	// GET /charts/federal-sales/timeseries?... — sales_volume + RVLA by year, per commodity.
	router.get(`${base}/timeseries`, async (req, res) => {
		try {
			res.json(await federalSalesTimeseries(database, readOpts(req)));
		} catch (error) {
			console.error('charts/federal-sales/timeseries error:', error);
			res.status(500).json({ error: 'Failed to fetch federal sales time series' });
		}
	});

	// GET /charts/federal-sales/export?... — records matching the filters as CSV. Serves both the
	// "filtered selection" download (with filters) and the "full dataset" download (no filters);
	// the filename reflects which, so a whole-dataset export isn't mislabeled "_filtered".
	router.get(`${base}/export`, async (req, res) => {
		try {
			const opts = readOpts(req);
			const filtered = !!(opts.fromYear || opts.toYear || opts.commodities.length || opts.landTypes.length || opts.regions.length);
			const rows = await federalSalesRecords(database, opts);
			const esc = (v) => {
				const s = v == null ? '' : String(v);
				return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
			};
			// Columns + headers come from EXPORT_COLUMNS (edit that list above to change the CSV).
			const lines = [EXPORT_COLUMNS.map((c) => c.header).map(esc).join(',')];
			for (const r of rows) {
				lines.push(EXPORT_COLUMNS.map((c) => c.value(r)).map(esc).join(','));
			}
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', `attachment; filename="federal_sales${filtered ? '_filtered' : ''}.csv"`);
			res.send(lines.join('\n'));
		} catch (error) {
			console.error('charts/federal-sales/export error:', error);
			res.status(500).json({ error: 'Failed to export federal sales' });
		}
	});
};
