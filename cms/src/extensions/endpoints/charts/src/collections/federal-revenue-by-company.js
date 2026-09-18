// Federal Revenue by Company chart-data routes (mounted at /charts/federal-revenue-by-company).
//
// Like revenue (one measure spread across year COLUMNS) but the row dimension is the COMPANY
// (corporate_name) rather than commodity. `federal_revenue_by_company` is a flat, denormalized
// collection (calendar_year, corporate_name, revenue_agency, revenue_type, commodity, revenue
// are plain columns) — no joins needed. Calendar-year data only.
//
// Filters: calendar-year range, Companies (searchable multi-select on corporate_name),
// Commodity, Revenue Type. An optional breakout (Commodity or Revenue Type) turns each company
// into a group with one sub-row per value. The measure is SUM(revenue) (dollars).
//
// The table is company-cardinality-heavy, so with no company filter the pivot returns only the
// top N companies by total revenue (search narrows to specific companies); `truncated` +
// `totalCompanies` tell the client it capped. The preview's reactive ChartCard derives its
// top-6-companies line chart from these same pivot groups (already ranked by total) — no
// separate chart endpoint.

const csvParam = (v) =>
	(Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

const TABLE = 'federal_revenue_by_company';
const COMPANY_COL = 'corporate_name';
// With no company filter, cap the table to the top-revenue companies (the rest are reachable by
// searching). The chart is always its own top-6, independent of this.
const DEFAULT_COMPANY_LIMIT = 50;

// Optional secondary breakout: the ?breakout= value maps to the column that becomes a sub-row
// under each company. Anything else = no breakout.
const BREAKOUT_FIELDS = { commodity: '"commodity"', revenue_type: '"revenue_type"' };

// Apply the preview filters to a query builder. Mutates in place; returns nothing (returning the
// thenable would run it before the caller's GROUP BY).
function applyFilters(q, { fromYear, toYear, companies, commodities, revenueTypes }) {
	if (fromYear) q.where('calendar_year', '>=', Number(fromYear));
	if (toYear) q.where('calendar_year', '<=', Number(toYear));
	if (Array.isArray(companies) && companies.length) q.whereIn(COMPANY_COL, companies);
	if (Array.isArray(commodities) && commodities.length) q.whereIn('commodity', commodities);
	if (Array.isArray(revenueTypes) && revenueTypes.length) q.whereIn('revenue_type', revenueTypes);
}

export async function companyPivot(database, opts = {}) {
	const breakoutExpr = BREAKOUT_FIELDS[opts.breakout] || null;
	const hasCompanyFilter = Array.isArray(opts.companies) && opts.companies.length > 0;
	const base = () => database.from(TABLE);

	const cols = [database.raw(`"${COMPANY_COL}" as "dim"`), database.raw('"calendar_year"::int as "yr"')];
	if (breakoutExpr) cols.push(database.raw(`${breakoutExpr} as "sub"`));
	cols.push(database.raw('SUM("revenue") as "amt"'), database.raw('COUNT(*) as "cnt"'));

	const aggQ = base().select(...cols);
	applyFilters(aggQ, opts);
	aggQ.groupByRaw(breakoutExpr ? `"${COMPANY_COL}", "calendar_year", ${breakoutExpr}` : `"${COMPANY_COL}", "calendar_year"`);

	// Full-selection record count + distinct-company count (independent of the top-N table cap).
	const countQ = base().count(`${TABLE}.id as n`).countDistinct(`${TABLE}.${COMPANY_COL} as companies`);
	applyFilters(countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	const yearSet = new Set();
	const groups = new Map();
	for (const r of rows) {
		const label = r.dim == null || r.dim === '' ? '(unnamed)' : r.dim;
		const y = Number(r.yr);
		const amt = Number(r.amt) || 0;
		yearSet.add(y);

		let g = groups.get(label);
		if (!g) {
			g = { key: label, total: 0, recordCount: 0, byYear: {}, subs: breakoutExpr ? new Map() : null };
			groups.set(label, g);
		}
		g.total += amt;
		g.recordCount += Number(r.cnt) || 0;
		g.byYear[y] = (g.byYear[y] || 0) + amt;

		if (breakoutExpr) {
			const subKey = r.sub == null || r.sub === '' ? '(unspecified)' : r.sub;
			let s = g.subs.get(subKey);
			if (!s) { s = { key: subKey, total: 0, byYear: {} }; g.subs.set(subKey, s); }
			s.byYear[y] = (s.byYear[y] || 0) + amt;
			s.total += amt;
		}
	}

	const years = [...yearSet].sort((a, b) => a - b);
	let groupList = [...groups.values()].sort((a, b) => b.total - a.total);

	// Cap to the top companies unless the user has picked specific ones.
	const totalCompanies = Number(countRow?.companies) || groupList.length;
	const truncated = !hasCompanyFilter && groupList.length > DEFAULT_COMPANY_LIMIT;
	if (truncated) groupList = groupList.slice(0, DEFAULT_COMPANY_LIMIT);

	// Per-year column totals across the RETURNED (shown) companies, so the Total row matches the
	// visible rows.
	const totalsByYear = {};
	for (const g of groupList) for (const y of years) totalsByYear[y] = (totalsByYear[y] || 0) + (g.byYear[y] || 0);

	const outGroups = groupList.map((g) => {
		const out = { key: g.key, total: g.total, recordCount: g.recordCount, byYear: g.byYear };
		if (breakoutExpr) out.rows = [...g.subs.values()].sort((a, b) => b.total - a.total).map((s) => ({ key: s.key, byYear: s.byYear }));
		return out;
	});

	return {
		groupBy: 'company',
		breakout: breakoutExpr ? opts.breakout : null,
		years,
		groups: outGroups,
		totalsByYear,
		truncated,
		shownCompanies: outGroups.length,
		totalCompanies,
		recordCount: Number(countRow?.n) || 0,
	};
}

// Raw records matching the preview filters, for the "filtered selection" CSV.
async function companyRecords(database, opts = {}) {
	const q = database
		.select('calendar_year', COMPANY_COL, 'revenue_agency', 'revenue_type', 'commodity', 'revenue')
		.from(TABLE)
		.orderBy([{ column: 'calendar_year', order: 'asc' }, { column: COMPANY_COL, order: 'asc' }]);
	applyFilters(q, opts);
	return q;
}

async function companyOptions(database) {
	const [years, companies, commodities, revenueTypes] = await Promise.all([
		database.from(TABLE).distinct('calendar_year').whereNotNull('calendar_year').orderBy('calendar_year', 'asc').then((r) => r.map((x) => x.calendar_year)),
		database.from(TABLE).distinct(COMPANY_COL).whereNotNull(COMPANY_COL).orderBy(COMPANY_COL, 'asc').then((r) => r.map((x) => x[COMPANY_COL]).filter((x) => x !== '')),
		// Commodities in their canonical order (commodity_order), falling back to name.
		database.from(TABLE).distinct('commodity', 'commodity_order').whereNotNull('commodity')
			.then((r) => r.filter((x) => x.commodity !== '')
				.sort((a, b) => String(a.commodity_order ?? '').localeCompare(String(b.commodity_order ?? ''), undefined, { numeric: true }) || String(a.commodity).localeCompare(String(b.commodity)))
				.map((x) => x.commodity)),
		database.from(TABLE).distinct('revenue_type').whereNotNull('revenue_type').orderBy('revenue_type', 'asc').then((r) => r.map((x) => x.revenue_type).filter((x) => x !== '')),
	]);
	return { years, companies, commodities, revenueTypes };
}

function readOpts(req) {
	return {
		fromYear: req.query.fromYear || null,
		toYear: req.query.toYear || null,
		companies: csvParam(req.query.companies),
		commodities: csvParam(req.query.commodities),
		revenueTypes: csvParam(req.query.revenueTypes),
		breakout: req.query.breakout || '',
	};
}

// Registers routes under `base` (mounted as /federal-revenue-by-company -> /charts/federal-revenue-by-company).
export default (router, { database }, base = '') => {
	// GET /pivot/options — filter dropdown values.
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await companyOptions(database));
		} catch (error) {
			console.error('charts/federal-revenue-by-company/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch federal revenue by company pivot options' });
		}
	});

	// GET /pivot?fromYear=&toYear=&companies=&commodities=&revenueTypes=&breakout=
	router.get(`${base}/pivot`, async (req, res) => {
		try {
			res.json(await companyPivot(database, readOpts(req)));
		} catch (error) {
			console.error('charts/federal-revenue-by-company/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch federal revenue by company pivot' });
		}
	});

	// GET /export?... — raw records matching the filters as CSV.
	router.get(`${base}/export`, async (req, res) => {
		try {
			const rows = await companyRecords(database, readOpts(req));
			const esc = (v) => {
				const s = v == null ? '' : String(v);
				return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
			};
			const head = ['Calendar Year', 'Corporate Name', 'Revenue Agency', 'Revenue Type', 'Commodity', 'Revenue'];
			const lines = [head.join(',')];
			for (const r of rows) {
				lines.push([r.calendar_year, r[COMPANY_COL], r.revenue_agency, r.revenue_type, r.commodity, r.revenue].map(esc).join(','));
			}
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', 'attachment; filename="federal_revenue_by_company_filtered.csv"');
			res.send(lines.join('\n'));
		} catch (error) {
			console.error('charts/federal-revenue-by-company/export error:', error);
			res.status(500).json({ error: 'Failed to export federal revenue by company' });
		}
	});
};
