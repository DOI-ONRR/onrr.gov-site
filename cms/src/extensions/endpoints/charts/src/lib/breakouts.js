// Shared query helpers for the charts endpoints.
//
// The source collections (revenue, disbursement, production, ...) are normalized:
// dimension columns like `commodity`, `location`, `fund` are foreign keys, and the
// human-readable/derived breakout label lives on the related table. So a chart
// grouping needs a JOIN - this module generalizes the join/aggregate/breakout
// logic that the standalone `revenue-summary` / `disbursement-summary` endpoints
// each hand-rolled, so per-collection handlers stay thin.

// Recipient groups for the disbursements-by-recipient charts. `fund.recipient`
// carries ~19 granular labels; these collapse them into the 7 groups the dataset-
// page chart/pivot shows. Matching is by prefix/substring (mirrors the mockup's regex
// bucketing) so label variants group correctly - e.g. `State`/`County` -> State &
// local, both `U.S. Treasury` and `U.S. Treasury - OCS Gulf` -> U.S. Treasury, and the
// `- OCS Gulf` / `- GoMesa` variants of Land & Water Conservation -> that group.
// `key` is the wide-row column / `chart_series.data_field`; array order sets the
// stack order, and `other_funds` (catch-all) MUST stay last.
export const RECIPIENT_GROUPS = [
	{ key: 'state_local', label: 'State & local', match: /^(State|County)/i },
	{ key: 'us_treasury', label: 'U.S. Treasury', match: /Treasury/i },
	{ key: 'native_american', label: 'Native American', match: /Native American/i },
	{ key: 'reclamation_fund', label: 'Reclamation Fund', match: /^Reclamation/i },
	{ key: 'land_water', label: 'Land and Water Conservation Fund', match: /Land.*Water Conservation/i },
	{ key: 'historic_preservation', label: 'Historic Preservation Fund', match: /Historic Preservation/i },
	{ key: 'other_funds', label: 'Other funds', match: /.*/ }, // catch-all - keep last
];

// Resolve a raw fund.recipient label to its group object. First matcher wins;
// other_funds (/.*/ ) is the catch-all, so it only wins when nothing above matched.
function recipientGroup(recipient) {
	const r = recipient || '';
	return RECIPIENT_GROUPS.find((g) => g.match.test(r)) ?? RECIPIENT_GROUPS[RECIPIENT_GROUPS.length - 1];
}
const recipientGroupKey = (recipient) => recipientGroup(recipient).key;
const recipientGroupLabel = (recipient) => recipientGroup(recipient).label;

// The set of raw fund.recipient labels belonging to a RECIPIENT_GROUPS key, using
// the same bucketing as everything else (single source of truth). Empty for an
// unknown key.
async function recipientsForGroup(database, groupKey) {
	const rows = await database.distinct('recipient').from('fund').whereNotNull('recipient');
	return rows.map((r) => r.recipient).filter((rec) => recipientGroupKey(rec) === groupKey);
}

// Breakout definitions keyed by collection -> breakout name.
//   join      : related table to join (and the FK column on the fact table)
//   joinField : column on the related table that holds the breakout label
//   filter    : optional allow-list of label values to include
//   mapValue  : optional (raw label) -> group label fn; buckets rows into higher-
//               level groups instead of an exact-match filter (see `recipient`).
export const BREAKOUTS = {
	revenue: {
		source: {
			join: 'location',
			joinField: 'land_type',
			filter: ['Federal onshore', 'Federal offshore', 'Native American', 'Federal - not tied to a lease'],
		},
		revenue_type: {
			join: 'fund',
			joinField: 'revenue_type',
			filter: ['Other revenues', 'Inspection fees', 'Civil penalties', 'Rents', 'Bonus', 'Royalties'],
		},
		commodity: {
			join: 'commodity',
			joinField: 'name',
		},
	},
	disbursement: {
		source: {
			join: 'location',
			joinField: 'land_type',
			filter: ['Federal onshore', 'Federal offshore', 'Native American'],
		},
		recipient: {
			join: 'fund',
			joinField: 'recipient',
			// Bucket the ~19 raw recipient labels into the 5 chart groups (RECIPIENT_GROUPS)
			// rather than an exact-match allow-list, which had drifted from the data
			// (`State`, `County`, and the OCS-Gulf variants were silently dropped).
			mapValue: recipientGroupLabel,
		},
	},
};

// Resolve a breakout config for a collection, or null if unknown.
export function resolveBreakout(collection, name) {
	return BREAKOUTS[collection]?.[name] ?? null;
}

// List the valid breakout names for a collection (for error messages).
export function breakoutNames(collection) {
	return Object.keys(BREAKOUTS[collection] ?? {});
}

// Monthly breakout summary for a fact table: SUM(amountColumn) grouped by the
// breakout dimension and the standard period fields, filtered to Monthly periods
// and (optionally) the breakout's allow-list. Returns rows sorted by period_date.
// If the breakout defines `mapValue`, raw dimension values are bucketed into
// higher-level groups (e.g. recipient -> 5 groups) and rows mapping to the same
// (month, group) are re-summed.
export async function monthlyBreakoutSummary(database, { table, amountColumn = 'amount', breakout }) {
	const query = database
		.select(
			database.raw(`"${breakout.join}"."${breakout.joinField}" as "breakout_value"`),
			'p.fiscal_year',
			'p.fiscal_month',
			'p.calendar_year',
			'p.period_date',
			'p.month_short',
			'p.month_long',
			database.raw(`SUM("${table}"."${amountColumn}") as "total_amount"`)
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.join(breakout.join, `${table}.${breakout.join}`, `${breakout.join}.id`)
		.where('p.type', 'Monthly');

	if (breakout.filter) {
		query.whereIn(`${breakout.join}.${breakout.joinField}`, breakout.filter);
	}

	query
		.groupBy(
			`${breakout.join}.${breakout.joinField}`,
			'p.fiscal_year',
			'p.fiscal_month',
			'p.calendar_year',
			'p.period_date',
			'p.month_short',
			'p.month_long'
		)
		.orderBy('p.period_date', 'asc');

	const rows = await query;

	// No bucketing -> raw per-label rows, unchanged.
	if (!breakout.mapValue) return rows;

	// Collapse raw breakout_value into groups, re-summing per (month, group).
	const merged = new Map();
	for (const r of rows) {
		const label = breakout.mapValue(r.breakout_value);
		const pd = r.period_date instanceof Date ? r.period_date.toISOString() : r.period_date;
		const key = `${pd}||${label}`;
		let row = merged.get(key);
		if (!row) {
			row = { ...r, breakout_value: label, total_amount: 0 };
			merged.set(key, row);
		}
		row.total_amount += Number(r.total_amount) || 0;
	}
	return [...merged.values()];
}

// Total of `amountColumn` per month for the most recent `months` months, with the
// month detail (date, fiscal/calendar year, month labels) joined from `period`.
// Rows are pulled newest-first to grab the most recent N, then returned in
// chronological (ascending) order - ready to plot left-to-right.
export async function recentMonthlyTotals(database, { table, amountColumn = 'amount', months = 24 }) {
	const rows = await database
		.select(
			'p.period_date',
			'p.fiscal_year',
			'p.fiscal_month',
			'p.calendar_year',
			'p.month_short',
			'p.month_long',
			database.raw(`SUM("${table}"."${amountColumn}") as "total_amount"`)
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.groupBy('p.period_date', 'p.fiscal_year', 'p.fiscal_month', 'p.calendar_year', 'p.month_short', 'p.month_long')
		.orderBy('p.period_date', 'desc')
		.limit(months);

	return rows.reverse();
}

// Total of `amountColumn` per calendar year, for the most recent `years` FULL
// calendar years - a year counts as full only when all 12 monthly periods are
// present (so an in-progress year is excluded). Returned oldest -> newest, ready to
// plot as yearly columns.
export async function calendarYearTotals(database, { table, amountColumn = 'amount', years = 5, recipient = null }) {
	// Step 1: the most recent N *full* calendar years, determined from ALL Monthly
	// data (12 distinct monthly periods). Kept independent of any recipient filter so
	// "is this a full year?" reflects the dataset, not one recipient's coverage.
	const fullYearRows = await database
		.select('p.calendar_year')
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.groupBy('p.calendar_year')
		.havingRaw('COUNT(DISTINCT "p"."period_date") = 12')
		.orderBy('p.calendar_year', 'desc')
		.limit(years);
	const fullYears = fullYearRows.map((r) => r.calendar_year);
	if (!fullYears.length) return [];

	// Step 2: sum the (optionally recipient-filtered) amount within those full years.
	const query = database
		.select(
			'p.calendar_year',
			database.raw(`SUM("${table}"."${amountColumn}") as "total_amount"`)
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.whereIn('p.calendar_year', fullYears)
		.groupBy('p.calendar_year')
		.orderBy('p.calendar_year', 'asc');

	if (recipient) {
		const labels = await recipientsForGroup(database, recipient);
		// Unknown group / no matching labels -> no data (rather than silently summing all).
		if (!labels.length) return [];
		query.join('fund as f', `${table}.fund`, 'f.id').whereIn('f.recipient', labels);
	}

	return query;
}

// Top `limit` states by total of `amountColumn` over the most recent `months`
// monthly periods. State comes from location.state_name. Returned ASCENDING by
// total (smallest first) so a horizontal bar chart renders the top state at the
// top (Highcharts places category[0] at the bottom).
export async function topStates(database, { table, amountColumn = 'amount', months = 12, limit = 10 }) {
	// Resolve the most recent `months` monthly periods that have data (newest first),
	// so we can both filter by them and stamp the window bounds onto each row.
	const recentRows = await database
		.distinct('p2.period_date')
		.from(`${table} as d2`)
		.join('period as p2', 'd2.period', 'p2.id')
		.where('p2.type', 'Monthly')
		.orderBy('p2.period_date', 'desc')
		.limit(months);
	const dates = recentRows.map((r) => r.period_date);
	const windowEnd = dates[0] ?? null; // newest
	const windowStart = dates[dates.length - 1] ?? null; // oldest

	const rows = await database
		.select(
			'l.state_name as state',
			database.raw(`SUM("d"."${amountColumn}") as "total_amount"`)
		)
		.from(`${table} as d`)
		.join('period as p', 'd.period', 'p.id')
		.join('location as l', 'd.location', 'l.id')
		.where('p.type', 'Monthly')
		.whereNotNull('l.state_name')
		.whereIn('p.period_date', dates)
		.groupBy('l.state_name')
		.orderBy('total_amount', 'desc')
		.limit(limit);

	// Stamp the window's first/last month on every row so a takeaway can reference
	// them. Rows stay in descending order (top state first): Highcharts renders
	// category[0] at the top of a horizontal bar.
	return rows.map((r) => ({ ...r, window_start: windowStart, window_end: windowEnd }));
}

// Monthly disbursement totals pivoted into the 5 recipient groups: one wide row per
// month - { period_date, fiscal_year, calendar_year, month_short, month_long, and a
// column per group key } - in chronological order, each group column summing its
// member recipients. When `months` is set, only the most recent N months with data
// are included (else all). Also returns a `summary` (window total, month count, and
// the leading group) for the chart takeaway.
export async function monthlyByRecipientGroup(database, { table, amountColumn = 'amount', months = null }) {
	// Optionally restrict to the most recent N monthly periods that have data.
	let dates = null;
	if (months) {
		const recentRows = await database
			.distinct('p2.period_date')
			.from(`${table} as d2`)
			.join('period as p2', 'd2.period', 'p2.id')
			.where('p2.type', 'Monthly')
			.orderBy('p2.period_date', 'desc')
			.limit(months);
		dates = recentRows.map((r) => r.period_date);
	}

	const query = database
		.select(
			'p.period_date',
			'p.fiscal_year',
			'p.calendar_year',
			'p.month_short',
			'p.month_long',
			'f.recipient as recipient',
			database.raw(`SUM("${table}"."${amountColumn}") as "total_amount"`)
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.join('fund as f', `${table}.fund`, 'f.id')
		.where('p.type', 'Monthly')
		.groupBy('p.period_date', 'p.fiscal_year', 'p.calendar_year', 'p.month_short', 'p.month_long', 'f.recipient')
		.orderBy('p.period_date', 'asc');

	if (dates) query.whereIn('p.period_date', dates);

	const rows = await query;

	// Pivot (month x recipient) rows into one wide row per month with a column per group.
	const zeros = () => Object.fromEntries(RECIPIENT_GROUPS.map((g) => [g.key, 0]));
	const byMonth = new Map();
	for (const r of rows) {
		// period_date comes back from pg as a Date object; key the Map by a primitive
		// so rows for the same month merge (distinct Date instances never match as keys).
		const key = r.period_date instanceof Date ? r.period_date.toISOString() : r.period_date;
		let month = byMonth.get(key);
		if (!month) {
			month = {
				period_date: r.period_date,
				fiscal_year: r.fiscal_year,
				calendar_year: r.calendar_year,
				month_short: r.month_short,
				month_long: r.month_long,
				...zeros(),
			};
			byMonth.set(key, month);
		}
		month[recipientGroupKey(r.recipient)] += Number(r.total_amount) || 0;
	}
	const data = [...byMonth.values()];

	// Window summary for the takeaway: total, month count, and the leading group.
	const groupTotals = zeros();
	for (const m of data) for (const g of RECIPIENT_GROUPS) groupTotals[g.key] += m[g.key];
	const total = Object.values(groupTotals).reduce((a, v) => a + v, 0);
	const topGroup = RECIPIENT_GROUPS
		.map((g) => ({ label: g.label, amount: groupTotals[g.key] }))
		.sort((a, b) => b.amount - a.amount)[0] ?? null;

	return {
		data,
		summary: {
			total,
			months: data.length,
			top_group: topGroup?.label ?? null,
			top_amount: topGroup?.amount ?? 0,
			top_share: total > 0 && topGroup ? topGroup.amount / total : 0,
		},
	};
}

// Latest fiscal year with monthly data for a fact table, plus the latest fiscal
// month within that year. Useful for current-vs-previous-FY comparisons.
export async function maxFiscalPeriod(database, table) {
	const maxFyResult = await database
		.select(database.raw('MAX("p"."fiscal_year") as "max_fy"'))
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.first();

	const fiscalYear = maxFyResult?.max_fy ?? null;
	if (!fiscalYear) return { fiscalYear: null, fiscalMonth: null };

	const maxMonthResult = await database
		.select(database.raw('MAX("p"."fiscal_month") as "max_month"'))
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.where('p.fiscal_year', fiscalYear)
		.first();

	return { fiscalYear, fiscalMonth: maxMonthResult?.max_month ?? null };
}

// Long month names by 1-based calendar month, for the pivot's month rows.
const PIVOT_MONTHS = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The group-by dimensions the disbursement pivot supports. `recipient` is special-
// cased (raw fund.recipient bucketed via RECIPIENT_GROUPS); the rest group directly
// on a raw joined column. Values are the quoted SQL column expressions.
const PIVOT_DIMENSIONS = {
	recipient: '"f"."recipient"',
	source: '"f"."source"',
	state: '"l"."state_name"',
	commodity: '"c"."name"',
};

export function pivotDimensions() {
	return Object.keys(PIVOT_DIMENSIONS);
}

// Distinct raw fund.recipient labels belonging to any of the given group keys, using
// the shared bucketing. Used to translate a recipients filter (group keys) into the
// raw labels to match in SQL. Also reports whether `other_funds` is among the groups,
// so the caller can additionally admit NULL/blank-recipient rows.
async function rawRecipientsForGroups(database, groupKeys) {
	const set = new Set(groupKeys);
	const rows = await database.distinct('recipient').from('fund');
	const labels = rows
		.map((r) => r.recipient)
		.filter((rec) => rec != null && rec !== '' && set.has(recipientGroupKey(rec)));
	return { labels, includesOther: set.has('other_funds') };
}

// Apply the shared filter set to a disbursement query builder (joins aliased
// p/f/l/c). Mutates the builder IN PLACE and returns nothing on purpose: returning
// the (thenable) builder from an async fn would let `await` execute the query early,
// before the caller adds its GROUP BY. `recipients` is a list of RECIPIENT_GROUPS
// keys; empty/omitted means "no recipient filter".
async function applyPivotFilters(database, q, { from, to, recipients, sources, state, commodity }) {
	q.where('p.type', 'Monthly');
	if (from) q.where('p.period_date', '>=', from);
	if (to) q.where('p.period_date', '<=', to);
	if (state) q.where('l.state_name', state);
	if (commodity) q.where('c.name', commodity);
	if (Array.isArray(sources) && sources.length) q.whereIn('f.source', sources);
	if (Array.isArray(recipients) && recipients.length) {
		const { labels, includesOther } = await rawRecipientsForGroups(database, recipients);
		q.where((b) => {
			if (labels.length) b.whereIn('f.recipient', labels);
			else b.whereRaw('1 = 0'); // selected groups have no raw members
			// `Other funds` also owns the un-labeled (NULL/blank) recipients.
			if (includesOther) b.orWhereNull('f.recipient').orWhere('f.recipient', '');
		});
	}
}

// Server-side pivot for the dataset-page "Preview and filter" table. Groups the
// filtered disbursement rows by the chosen dimension, then by CALENDAR year and
// calendar month, summing `amount`. Recipient is bucketed into RECIPIENT_GROUPS;
// other dimensions group on their raw label. Returns the fully-shaped pivot the
// table renders - no client-side row crunching (the mockup's freeze was exactly
// that). Shape: { groupBy, years[], groups[{ key, total, byYear, months[] }],
// grandTotal, recordCount }.
export async function disbursementPivot(database, opts = {}) {
	const groupBy = PIVOT_DIMENSIONS[opts.groupBy] ? opts.groupBy : 'recipient';
	const isRecipient = groupBy === 'recipient';
	const dimExpr = PIVOT_DIMENSIONS[groupBy];
	const table = 'disbursement';

	const base = () =>
		database
			.from(table)
			.join('period as p', `${table}.period`, 'p.id')
			.leftJoin('fund as f', `${table}.fund`, 'f.id')
			.leftJoin('location as l', `${table}.location`, 'l.id')
			.leftJoin('commodity as c', `${table}.commodity`, 'c.id');

	// Aggregated rows: (dimension, calendar year, calendar month) -> sum.
	const aggQ = base().select(
		database.raw(`${dimExpr} as "dim"`),
		database.raw('EXTRACT(YEAR FROM "p"."period_date")::int as "yr"'),
		database.raw('EXTRACT(MONTH FROM "p"."period_date")::int as "mo"'),
		database.raw(`SUM("${table}"."amount") as "amt"`)
	);
	await applyPivotFilters(database, aggQ, opts);
	aggQ.groupByRaw(`${dimExpr}, EXTRACT(YEAR FROM "p"."period_date"), EXTRACT(MONTH FROM "p"."period_date")`);

	// Record count over the same filter set (raw disbursement rows, not aggregated).
	const countQ = base().count(`${table}.id as n`);
	await applyPivotFilters(database, countQ, opts);

	const [rows, countRow] = await Promise.all([aggQ, countQ.first()]);

	// Assemble: group label -> { total, byYear, months: Map(mo -> {monthName, byYear, total}) }.
	const yearSet = new Set();
	const groups = new Map();
	let grandTotal = 0;

	for (const r of rows) {
		const label = isRecipient ? recipientGroupLabel(r.dim) : (r.dim == null || r.dim === '' ? '(none)' : r.dim);
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
			m = { month: mo, monthName: PIVOT_MONTHS[mo] || String(mo), byYear: {}, total: 0 };
			g.months.set(mo, m);
		}
		m.byYear[yr] = (m.byYear[yr] || 0) + amt;
		m.total += amt;
	}

	const years = [...yearSet].sort((a, b) => a - b);
	// Recipient groups keep RECIPIENT_GROUPS (stack) order; other dimensions sort by
	// grand total descending (largest first), matching the mockup's default.
	const recipientOrder = new Map(RECIPIENT_GROUPS.map((grp, i) => [grp.label, i]));
	const groupList = [...groups.values()]
		.map((g) => ({
			key: g.key,
			total: g.total,
			byYear: g.byYear,
			months: [...g.months.values()].sort((a, b) => a.month - b.month),
		}))
		.sort((a, b) =>
			isRecipient
				? (recipientOrder.get(a.key) ?? 99) - (recipientOrder.get(b.key) ?? 99)
				: b.total - a.total
		);

	return {
		groupBy,
		years,
		groups: groupList,
		grandTotal,
		recordCount: Number(countRow?.n) || 0,
	};
}

// Distinct filter-dropdown values for the pivot UI, in one round-trip: month periods,
// states, commodities, fund sources, plus the recipient GROUP labels (stack order).
export async function disbursementPivotOptions(database) {
	const monthly = (q) => q.from('disbursement').join('period as p', 'disbursement.period', 'p.id').where('p.type', 'Monthly');
	const [months, states, commodities, sources] = await Promise.all([
		monthly(database.distinct('p.period_date')).orderBy('p.period_date', 'asc').then((r) => r.map((x) => x.period_date)),
		monthly(database.distinct('l.state_name')).join('location as l', 'disbursement.location', 'l.id').whereNotNull('l.state_name').orderBy('l.state_name', 'asc').then((r) => r.map((x) => x.state_name)),
		monthly(database.distinct('c.name')).join('commodity as c', 'disbursement.commodity', 'c.id').whereNotNull('c.name').orderBy('c.name', 'asc').then((r) => r.map((x) => x.name)),
		monthly(database.distinct('f.source')).join('fund as f', 'disbursement.fund', 'f.id').whereNotNull('f.source').orderBy('f.source', 'asc').then((r) => r.map((x) => x.source)),
	]);
	return { months, states, commodities, sources, recipients: RECIPIENT_GROUPS.map((g) => ({ key: g.key, label: g.label })) };
}
