import { resolveBreakout, breakoutNames, monthlyBreakoutSummary } from '../lib/breakouts.js';

// Revenue chart-data routes (mounted at /charts/revenue).
//
// One set of routes serves all three period grains, selected by ?period=:
//   monthly       -> period.type 'Monthly'       (commodity x calendar-year x month)
//   calendar-year -> period.type 'Calendar Year'  (commodity x calendar-year)
//   fiscal-year   -> period.type 'Fiscal Year'    (commodity x fiscal_year)
// Mirrors the production endpoint's single-route + `period` param design.
//
// Revenue is grouped by commodity (commodity.product); the measure is `amount` and it's all
// dollars, so — unlike production's mixed-unit volumes — totals and a shared-axis chart are
// meaningful, and groups rank by total revenue. Revenue also filters by fund.revenue_type
// (Royalties / Rents / Bonus / …) and by State/Offshore Region, and the range is always a
// year range (From/To year) across every grain — Monthly just adds month detail within it.

const MONTH_NAMES = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const csvParam = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

const PERIOD_TYPES = { monthly: 'Monthly', 'fiscal-year': 'Fiscal Year', 'calendar-year': 'Calendar Year' };
const periodTypeOf = (p) => PERIOD_TYPES[p] || 'Monthly';

// Region label: onshore rows carry location.state_name, offshore rows carry offshore_region.
const REGION_EXPR = `COALESCE(NULLIF("l"."state_name", ''), "l"."offshore_region")`;

// The "year" column per grain: fiscal_year for Fiscal Year rows, else the calendar year off
// the period date (Monthly and Calendar Year rows both date to their year).
const yearExpr = (periodType) => (periodType === 'Fiscal Year' ? '"p"."fiscal_year"' : 'EXTRACT(YEAR FROM "p"."period_date")');

// Apply the preview filters to a revenue query builder (joins aliased p/l/c/f). Mutates in
// place; returns nothing (returning the thenable would run it before the caller's GROUP BY).
function applyRevenueFilters(q, { periodType, fromYear, toYear, landTypes, revenueTypes, regions, products }) {
	q.where('p.type', periodType);
	const yr = yearExpr(periodType);
	if (fromYear) q.whereRaw(`${yr} >= ?`, [Number(fromYear)]);
	if (toYear) q.whereRaw(`${yr} <= ?`, [Number(toYear)]);
	if (Array.isArray(landTypes) && landTypes.length) q.whereIn('l.land_type', landTypes);
	if (Array.isArray(revenueTypes) && revenueTypes.length) q.whereIn('f.revenue_type', revenueTypes);
	if (Array.isArray(products) && products.length) q.whereIn('c.product', products);
	if (Array.isArray(regions) && regions.length) {
		q.whereRaw(`${REGION_EXPR} IN (${regions.map(() => '?').join(', ')})`, regions);
	}
}

export async function revenuePivot(database, opts = {}) {
	const { periodType } = opts;
	const isMonthly = periodType === 'Monthly';
	const yr = yearExpr(periodType);
	const table = 'revenue';
	const base = () =>
		database
			.from(table)
			.join('period as p', `${table}.period`, 'p.id')
			.leftJoin('location as l', `${table}.location`, 'l.id')
			.leftJoin('commodity as c', `${table}.commodity`, 'c.id')
			.leftJoin('fund as f', `${table}.fund`, 'f.id');

	const cols = [database.raw('"c"."product" as "dim"'), database.raw(`${yr}::int as "yr"`)];
	if (isMonthly) cols.push(database.raw('EXTRACT(MONTH FROM "p"."period_date")::int as "mo"'));
	cols.push(database.raw(`SUM("${table}"."amount") as "amt"`), database.raw(`COUNT(*) as "cnt"`));

	const aggQ = base().select(...cols);
	applyRevenueFilters(aggQ, opts);
	aggQ.groupByRaw(isMonthly ? `"c"."product", ${yr}, EXTRACT(MONTH FROM "p"."period_date")` : `"c"."product", ${yr}`);

	const countQ = base().count(`${table}.id as n`);
	applyRevenueFilters(countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	const yearSet = new Set();
	const groups = new Map();
	let grandTotal = 0;
	for (const r of rows) {
		// Revenue rows with no commodity (bonuses, rents, civil penalties, …) group under a
		// readable label rather than a bare "(none)".
		const label = r.dim == null || r.dim === '' ? 'Not tied to a commodity' : r.dim;
		const y = Number(r.yr);
		const amt = Number(r.amt) || 0;
		yearSet.add(y);
		grandTotal += amt;

		let g = groups.get(label);
		if (!g) {
			g = { key: label, total: 0, recordCount: 0, byYear: {}, months: isMonthly ? new Map() : null };
			groups.set(label, g);
		}
		g.total += amt;
		g.recordCount += Number(r.cnt) || 0;
		g.byYear[y] = (g.byYear[y] || 0) + amt;

		if (isMonthly) {
			const mo = Number(r.mo);
			let m = g.months.get(mo);
			if (!m) {
				m = { month: mo, monthName: MONTH_NAMES[mo] || String(mo), byYear: {}, total: 0 };
				g.months.set(mo, m);
			}
			m.byYear[y] = (m.byYear[y] || 0) + amt;
			m.total += amt;
		}
	}

	const years = [...yearSet].sort((a, b) => a - b);
	const groupList = [...groups.values()]
		.map((g) => {
			const out = { key: g.key, total: g.total, recordCount: g.recordCount, byYear: g.byYear };
			if (isMonthly) out.months = [...g.months.values()].sort((a, b) => a.month - b.month);
			return out;
		})
		// Revenue is single-unit (dollars), so rank commodities by total revenue.
		.sort((a, b) => b.total - a.total);

	return { groupBy: 'product', periodType, years, groups: groupList, grandTotal, recordCount: Number(countRow?.n) || 0 };
}

// Raw revenue records matching the preview filters, for the "filtered selection" CSV.
async function revenueRecords(database, opts = {}) {
	const table = 'revenue';
	const q = database
		.select(
			'p.period_date',
			'p.fiscal_year',
			'l.land_type',
			'l.land_category',
			database.raw(`${REGION_EXPR} as region`),
			'f.revenue_type',
			'c.product',
			'c.name as commodity',
			`${table}.amount`,
			`${table}.unit`
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.leftJoin('location as l', `${table}.location`, 'l.id')
		.leftJoin('commodity as c', `${table}.commodity`, 'c.id')
		.leftJoin('fund as f', `${table}.fund`, 'f.id')
		.orderBy('p.period_date', 'asc');
	applyRevenueFilters(q, opts);
	return q;
}

async function revenuePivotOptions(database, periodType) {
	const scoped = (q) => q.from('revenue').join('period as p', 'revenue.period', 'p.id').where('p.type', periodType);
	const yr = yearExpr(periodType);

	const [years, landTypes, revenueTypes, products, regions] = await Promise.all([
		scoped(database.select(database.raw(`DISTINCT ${yr}::int as year`))).whereRaw(`${yr} IS NOT NULL`).then((r) => r.map((x) => x.year).sort((a, b) => a - b)),
		scoped(database.distinct('l.land_type')).join('location as l', 'revenue.location', 'l.id').whereNotNull('l.land_type').orderBy('l.land_type', 'asc').then((r) => r.map((x) => x.land_type)),
		scoped(database.distinct('f.revenue_type')).join('fund as f', 'revenue.fund', 'f.id').whereNotNull('f.revenue_type').orderBy('f.revenue_type', 'asc').then((r) => r.map((x) => x.revenue_type).filter((x) => x !== '')),
		scoped(database.distinct('c.product')).join('commodity as c', 'revenue.commodity', 'c.id').whereNotNull('c.product').orderBy('c.product', 'asc').then((r) => r.map((x) => x.product).filter((x) => x !== '')),
		scoped(database.select(database.raw(`DISTINCT ${REGION_EXPR} as region`))).join('location as l', 'revenue.location', 'l.id').then((r) => r.map((x) => x.region).filter(Boolean)),
	]);
	regions.sort((a, b) => String(a).localeCompare(String(b)));
	return { periodType, years, landTypes, revenueTypes, products, regions };
}

// Reads the shared filter params off a request into a revenuePivot/records opts object.
function readOpts(req) {
	return {
		periodType: periodTypeOf(req.query.period),
		fromYear: req.query.fromYear || null,
		toYear: req.query.toYear || null,
		landTypes: csvParam(req.query.landTypes),
		revenueTypes: csvParam(req.query.revenueTypes),
		regions: csvParam(req.query.regions),
		products: csvParam(req.query.products),
	};
}

// Registers revenue routes under `base` (mounted as /revenue -> /charts/revenue).
export default (router, { database }, base = '') => {
	// GET /charts/revenue/summary?breakout=source|revenue_type|commodity
	// Monthly revenue totals, broken out by the requested dimension. (Existing summary route.)
	router.get(`${base}/summary`, async (req, res) => {
		const name = req.query.breakout || 'source';
		const breakout = resolveBreakout('revenue', name);
		if (!breakout) {
			return res.status(400).json({
				error: `Invalid breakout: ${name}. Valid options: ${breakoutNames('revenue').join(', ')}`,
			});
		}
		try {
			const data = await monthlyBreakoutSummary(database, { table: 'revenue', breakout });
			res.json({ data });
		} catch (error) {
			console.error('charts/revenue/summary error:', error);
			res.status(500).json({ error: 'Failed to fetch revenue summary' });
		}
	});

	// GET /charts/revenue/pivot/options?period= — filter dropdown values.
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await revenuePivotOptions(database, periodTypeOf(req.query.period)));
		} catch (error) {
			console.error('charts/revenue/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch revenue pivot options' });
		}
	});

	// GET /charts/revenue/pivot?period=&fromYear=&toYear=&landTypes=&revenueTypes=&regions=&products=
	router.get(`${base}/pivot`, async (req, res) => {
		try {
			res.json(await revenuePivot(database, readOpts(req)));
		} catch (error) {
			console.error('charts/revenue/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch revenue pivot' });
		}
	});

	// GET /charts/revenue/export?period=&... — raw records matching the filters as CSV.
	router.get(`${base}/export`, async (req, res) => {
		const opts = readOpts(req);
		const isMonthly = opts.periodType === 'Monthly';
		try {
			const rows = await revenueRecords(database, opts);
			const esc = (v) => {
				const s = v == null ? '' : String(v);
				return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
			};
			const ymd = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
			const yearOf = (r) => (opts.periodType === 'Fiscal Year' ? r.fiscal_year : ymd(r.period_date).slice(0, 4));

			let head;
			let mapRow;
			if (isMonthly) {
				head = ['Date', 'Land Type', 'State/Offshore Region', 'Revenue Type', 'Product', 'Commodity', 'Amount', 'Unit'];
				mapRow = (r) => [ymd(r.period_date), r.land_type, r.region, r.revenue_type, r.product, r.commodity, r.amount, r.unit];
			} else {
				const yearLabel = opts.periodType === 'Fiscal Year' ? 'Fiscal Year' : 'Calendar Year';
				head = [yearLabel, 'Land Type', 'State/Offshore Region', 'Revenue Type', 'Product', 'Commodity', 'Amount', 'Unit'];
				mapRow = (r) => [yearOf(r), r.land_type, r.region, r.revenue_type, r.product, r.commodity, r.amount, r.unit];
			}

			const lines = [head.join(',')];
			for (const r of rows) lines.push(mapRow(r).map(esc).join(','));

			const slug = req.query.period && PERIOD_TYPES[req.query.period] ? req.query.period : 'monthly';
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', `attachment; filename="revenue_${slug}_filtered.csv"`);
			res.send(lines.join('\n'));
		} catch (error) {
			console.error('charts/revenue/export error:', error);
			res.status(500).json({ error: 'Failed to export revenue' });
		}
	});
};
