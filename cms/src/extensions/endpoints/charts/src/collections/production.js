// Production chart-data routes (mounted at /charts/production).
//
// Unlike disbursement, production has a single fixed group dimension — product
// (commodity.product) — and its measure is `volume` (not `amount`). The pivot output
// mirrors the disbursement shape ({ groupBy, periodType, years, groups[{key,total,byYear,
// months[]}], grandTotal, recordCount }) so the dataset-page preview + reactive chart can
// reuse the same rendering. Note volumes across different products have different units,
// so cross-product totals aren't meaningful — the preview shows per-product rows only.

const MONTH_NAMES = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const csvParam = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

// Apply the preview filters to a production query builder (joins aliased p/l/c). Mutates in
// place; returns nothing (see the disbursement note — returning the thenable would run it
// before the caller's GROUP BY).
function applyProductionFilters(q, { from, to, landTypes, products }) {
	q.where('p.type', 'Monthly');
	if (from) q.where('p.period_date', '>=', from);
	if (to) q.where('p.period_date', '<=', to);
	if (Array.isArray(landTypes) && landTypes.length) q.whereIn('l.land_type', landTypes);
	if (Array.isArray(products) && products.length) q.whereIn('c.product', products);
}

async function productionPivot(database, opts = {}) {
	const table = 'production';
	const base = () =>
		database
			.from(table)
			.join('period as p', `${table}.period`, 'p.id')
			.leftJoin('location as l', `${table}.location`, 'l.id')
			.leftJoin('commodity as c', `${table}.commodity`, 'c.id');

	// (product, calendar year, calendar month) -> SUM(volume).
	const aggQ = base().select(
		database.raw('"c"."product" as "dim"'),
		database.raw('EXTRACT(YEAR FROM "p"."period_date")::int as "yr"'),
		database.raw('EXTRACT(MONTH FROM "p"."period_date")::int as "mo"'),
		database.raw(`SUM("${table}"."volume") as "amt"`)
	);
	applyProductionFilters(aggQ, opts);
	aggQ.groupByRaw('"c"."product", EXTRACT(YEAR FROM "p"."period_date"), EXTRACT(MONTH FROM "p"."period_date")');

	const countQ = base().count(`${table}.id as n`);
	applyProductionFilters(countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	const yearSet = new Set();
	const groups = new Map();
	let grandTotal = 0;
	for (const r of rows) {
		const label = r.dim == null || r.dim === '' ? '(none)' : r.dim;
		const yr = Number(r.yr);
		const mo = Number(r.mo);
		const amt = Number(r.amt) || 0;
		yearSet.add(yr);
		grandTotal += amt;

		let g = groups.get(label);
		if (!g) {
			g = { key: label, total: 0, byYear: {}, months: new Map() };
			groups.set(label, g);
		}
		g.total += amt;
		g.byYear[yr] = (g.byYear[yr] || 0) + amt;

		let m = g.months.get(mo);
		if (!m) {
			m = { month: mo, monthName: MONTH_NAMES[mo] || String(mo), byYear: {}, total: 0 };
			g.months.set(mo, m);
		}
		m.byYear[yr] = (m.byYear[yr] || 0) + amt;
		m.total += amt;
	}

	const years = [...yearSet].sort((a, b) => a - b);
	const groupList = [...groups.values()]
		.map((g) => ({
			key: g.key,
			total: g.total,
			byYear: g.byYear,
			months: [...g.months.values()].sort((a, b) => a.month - b.month),
		}))
		.sort((a, b) => b.total - a.total);

	return { groupBy: 'product', periodType: 'Monthly', years, groups: groupList, grandTotal, recordCount: Number(countRow?.n) || 0 };
}

async function productionPivotOptions(database) {
	const scoped = (q) => q.from('production').join('period as p', 'production.period', 'p.id').where('p.type', 'Monthly');
	const [months, landTypes, products] = await Promise.all([
		scoped(database.distinct('p.period_date')).orderBy('p.period_date', 'asc').then((r) => r.map((x) => x.period_date)),
		scoped(database.distinct('l.land_type')).join('location as l', 'production.location', 'l.id').whereNotNull('l.land_type').orderBy('l.land_type', 'asc').then((r) => r.map((x) => x.land_type)),
		scoped(database.distinct('c.product')).join('commodity as c', 'production.commodity', 'c.id').whereNotNull('c.product').orderBy('c.product', 'asc').then((r) => r.map((x) => x.product)),
	]);
	return { months, landTypes, products };
}

// Registers production routes under `base` (mounted as /production -> /charts/production).
export default (router, { database }, base = '') => {
	// GET /charts/production/pivot/options — filter dropdown values (months, land types, products).
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await productionPivotOptions(database));
		} catch (error) {
			console.error('charts/production/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch production pivot options' });
		}
	});

	// GET /charts/production/pivot?from=&to=&landTypes=&products=
	// Monthly production volume grouped by product, then calendar year + month.
	router.get(`${base}/pivot`, async (req, res) => {
		const { from, to } = req.query;
		try {
			const data = await productionPivot(database, {
				from: from || null,
				to: to || null,
				landTypes: csvParam(req.query.landTypes),
				products: csvParam(req.query.products),
			});
			res.json(data);
		} catch (error) {
			console.error('charts/production/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch production pivot' });
		}
	});
};
