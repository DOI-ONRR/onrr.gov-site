// Production chart-data routes (mounted at /charts/production).
//
// One set of routes serves all three period grains, selected by ?period=:
//   monthly       -> period.type 'Monthly'       (product x calendar-year x month)
//   fiscal-year   -> period.type 'Fiscal Year'    (product x fiscal_year)
//   calendar-year -> period.type 'Calendar Year'  (product x calendar-year)
// This mirrors the disbursement endpoint's single-route + `period` param design.
//
// Production's only group dimension is product (commodity.product); the measure is
// `volume`. Volumes across products use different units (bbl/mcf/ton/kwh/…), so there
// are no cross-product totals. The annual grains also expose a State/Offshore Region
// filter that the monthly grain doesn't. The pivot output mirrors the disbursement shape
// ({ groupBy, periodType, years, groups[{key,total,byYear,months?}], grandTotal, recordCount }).

const MONTH_NAMES = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const csvParam = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

// ?period= -> period.type. Defaults to Monthly for a missing/unknown value.
const PERIOD_TYPES = { monthly: 'Monthly', 'fiscal-year': 'Fiscal Year', 'calendar-year': 'Calendar Year' };
const periodTypeOf = (p) => PERIOD_TYPES[p] || 'Monthly';

// Region label: onshore rows carry location.state_name, offshore rows carry
// location.offshore_region — the region is whichever is present.
const REGION_EXPR = `COALESCE(NULLIF("l"."state_name", ''), "l"."offshore_region")`;

// The "year" column per grain: the fiscal_year for Fiscal Year rows, else the calendar
// year off the period date (Monthly and Calendar Year rows both date to their year).
const yearExpr = (periodType) => (periodType === 'Fiscal Year' ? '"p"."fiscal_year"' : 'EXTRACT(YEAR FROM "p"."period_date")');

// Apply the preview filters to a production query builder (joins aliased p/l/c). Mutates in
// place; returns nothing (returning the thenable would run it before the caller's GROUP BY).
function applyProductionFilters(q, { periodType, from, to, fromYear, toYear, landTypes, regions, products }) {
	q.where('p.type', periodType);
	if (periodType === 'Monthly') {
		if (from) q.where('p.period_date', '>=', from);
		if (to) q.where('p.period_date', '<=', to);
	} else {
		const yr = yearExpr(periodType);
		if (fromYear) q.whereRaw(`${yr} >= ?`, [Number(fromYear)]);
		if (toYear) q.whereRaw(`${yr} <= ?`, [Number(toYear)]);
	}
	if (Array.isArray(landTypes) && landTypes.length) q.whereIn('l.land_type', landTypes);
	if (Array.isArray(products) && products.length) q.whereIn('c.product', products);
	if (Array.isArray(regions) && regions.length) {
		q.whereRaw(`${REGION_EXPR} IN (${regions.map(() => '?').join(', ')})`, regions);
	}
}

async function productionPivot(database, opts = {}) {
	const { periodType } = opts;
	const isMonthly = periodType === 'Monthly';
	const yr = yearExpr(periodType);
	const table = 'production';
	const base = () =>
		database
			.from(table)
			.join('period as p', `${table}.period`, 'p.id')
			.leftJoin('location as l', `${table}.location`, 'l.id')
			.leftJoin('commodity as c', `${table}.commodity`, 'c.id');

	const cols = [database.raw('"c"."product" as "dim"'), database.raw(`${yr}::int as "yr"`)];
	if (isMonthly) cols.push(database.raw('EXTRACT(MONTH FROM "p"."period_date")::int as "mo"'));
	cols.push(database.raw(`SUM("${table}"."volume") as "amt"`), database.raw(`COUNT(*) as "cnt"`));

	const aggQ = base().select(...cols);
	applyProductionFilters(aggQ, opts);
	aggQ.groupByRaw(isMonthly ? `"c"."product", ${yr}, EXTRACT(MONTH FROM "p"."period_date")` : `"c"."product", ${yr}`);

	const countQ = base().count(`${table}.id as n`);
	applyProductionFilters(countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	const yearSet = new Set();
	const groups = new Map();
	let grandTotal = 0;
	for (const r of rows) {
		const label = r.dim == null || r.dim === '' ? '(none)' : r.dim;
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
		// Rank by breadth of reporting (record count), not raw volume: volumes across products
		// use different units (bbl/mcf/ton/kwh/…), so a volume sort surfaces large-magnitude
		// units (e.g. geothermal kwh/klb) over the headline products. Record count is
		// unit-independent and naturally puts oil/gas/coal on top. Volume breaks ties.
		.sort((a, b) => b.recordCount - a.recordCount || b.total - a.total);

	return { groupBy: 'product', periodType, years, groups: groupList, grandTotal, recordCount: Number(countRow?.n) || 0 };
}

// Raw production records matching the preview filters, for the "filtered selection" CSV.
// Selects a superset; the export route emits grain-appropriate columns.
async function productionRecords(database, opts = {}) {
	const table = 'production';
	const q = database
		.select(
			'p.period_date',
			'p.fiscal_year',
			'l.land_type',
			'l.land_category',
			'l.county',
			database.raw(`${REGION_EXPR} as region`),
			'c.product',
			'c.name as commodity',
			'c.mineral_lease_type',
			`${table}.volume`,
			`${table}.unit`
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.leftJoin('location as l', `${table}.location`, 'l.id')
		.leftJoin('commodity as c', `${table}.commodity`, 'c.id')
		.orderBy('p.period_date', 'asc');
	applyProductionFilters(q, opts);
	return q;
}

async function productionPivotOptions(database, periodType) {
	const scoped = (q) => q.from('production').join('period as p', 'production.period', 'p.id').where('p.type', periodType);
	const yr = yearExpr(periodType);

	const landTypesP = scoped(database.distinct('l.land_type')).join('location as l', 'production.location', 'l.id').whereNotNull('l.land_type').orderBy('l.land_type', 'asc').then((r) => r.map((x) => x.land_type));
	const productsP = scoped(database.distinct('c.product')).join('commodity as c', 'production.commodity', 'c.id').whereNotNull('c.product').orderBy('c.product', 'asc').then((r) => r.map((x) => x.product));
	const regionsP = scoped(database.select(database.raw(`DISTINCT ${REGION_EXPR} as region`))).join('location as l', 'production.location', 'l.id').then((r) => r.map((x) => x.region).filter(Boolean));

	if (periodType === 'Monthly') {
		const [months, landTypes, products, regions] = await Promise.all([
			scoped(database.distinct('p.period_date')).orderBy('p.period_date', 'asc').then((r) => r.map((x) => x.period_date)),
			landTypesP,
			productsP,
			regionsP,
		]);
		regions.sort((a, b) => String(a).localeCompare(String(b)));
		return { periodType, months, landTypes, products, regions };
	}

	const [years, landTypes, products, regions] = await Promise.all([
		scoped(database.select(database.raw(`DISTINCT ${yr}::int as year`))).whereRaw(`${yr} IS NOT NULL`).then((r) => r.map((x) => x.year).sort((a, b) => a - b)),
		landTypesP,
		productsP,
		regionsP,
	]);
	regions.sort((a, b) => String(a).localeCompare(String(b)));
	return { periodType, years, landTypes, products, regions };
}

// Reads the shared filter params off a request into a productionPivot/records opts object.
function readOpts(req) {
	const periodType = periodTypeOf(req.query.period);
	return {
		periodType,
		from: req.query.from || null,
		to: req.query.to || null,
		fromYear: req.query.fromYear || null,
		toYear: req.query.toYear || null,
		landTypes: csvParam(req.query.landTypes),
		regions: csvParam(req.query.regions),
		products: csvParam(req.query.products),
	};
}

// Registers production routes under `base` (mounted as /production -> /charts/production).
export default (router, { database }, base = '') => {
	// GET /charts/production/pivot/options?period= — filter dropdown values.
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await productionPivotOptions(database, periodTypeOf(req.query.period)));
		} catch (error) {
			console.error('charts/production/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch production pivot options' });
		}
	});

	// GET /charts/production/pivot?period=&from=&to=&fromYear=&toYear=&landTypes=&regions=&products=
	router.get(`${base}/pivot`, async (req, res) => {
		try {
			res.json(await productionPivot(database, readOpts(req)));
		} catch (error) {
			console.error('charts/production/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch production pivot' });
		}
	});

	// GET /charts/production/export?period=&... — raw records matching the filters as CSV.
	router.get(`${base}/export`, async (req, res) => {
		const opts = readOpts(req);
		const isMonthly = opts.periodType === 'Monthly';
		try {
			const rows = await productionRecords(database, opts);
			const esc = (v) => {
				const s = v == null ? '' : String(v);
				return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
			};
			const ymd = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
			const yearOf = (r) => (opts.periodType === 'Fiscal Year' ? r.fiscal_year : ymd(r.period_date).slice(0, 4));

			let head;
			let mapRow;
			if (isMonthly) {
				head = ['Date', 'Land Type', 'Land Category', 'State/Offshore Region', 'County', 'Product', 'Commodity', 'Mineral Lease Type', 'Volume', 'Unit'];
				mapRow = (r) => [ymd(r.period_date), r.land_type, r.land_category, r.region, r.county, r.product, r.commodity, r.mineral_lease_type, r.volume, r.unit];
			} else {
				const yearLabel = opts.periodType === 'Fiscal Year' ? 'Fiscal Year' : 'Calendar Year';
				head = [yearLabel, 'Land Type', 'Land Category', 'State/Offshore Region', 'Product', 'Commodity', 'Mineral Lease Type', 'Volume', 'Unit'];
				mapRow = (r) => [yearOf(r), r.land_type, r.land_category, r.region, r.product, r.commodity, r.mineral_lease_type, r.volume, r.unit];
			}

			const lines = [head.join(',')];
			for (const r of rows) lines.push(mapRow(r).map(esc).join(','));

			const slug = req.query.period && PERIOD_TYPES[req.query.period] ? req.query.period : 'monthly';
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', `attachment; filename="production_${slug}_filtered.csv"`);
			res.send(lines.join('\n'));
		} catch (error) {
			console.error('charts/production/export error:', error);
			res.status(500).json({ error: 'Failed to export production' });
		}
	});
};
