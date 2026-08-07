// Shared query helpers for the charts endpoints.
//
// The source collections (revenue, disbursement, production, ...) are normalized:
// dimension columns like `commodity`, `location`, `fund` are foreign keys, and the
// human-readable/derived breakout label lives on the related table. So a chart
// grouping needs a JOIN - this module generalizes the join/aggregate/breakout
// logic that the standalone `revenue-summary` / `disbursement-summary` endpoints
// each hand-rolled, so per-collection handlers stay thin.

// Recipient groups for the disbursements-by-recipient charts. `fund.recipient`
// carries ~19 granular labels; these collapse them into the 5 groups the dataset-
// page chart shows. Matching is by prefix/substring (mirrors the mockup's regex
// bucketing) so label variants group correctly - e.g. `State`/`County` -> State &
// local, and both `U.S. Treasury` and `U.S. Treasury - OCS Gulf` -> U.S. Treasury.
// `key` is the wide-row column / `chart_series.data_field`; array order sets the
// stack order, and `other_funds` (catch-all) MUST stay last.
export const RECIPIENT_GROUPS = [
	{ key: 'state_local', label: 'State & local', match: /^(State|County)/i },
	{ key: 'us_treasury', label: 'U.S. Treasury', match: /Treasury/i },
	{ key: 'native_american', label: 'Native American', match: /Native American/i },
	{ key: 'reclamation_fund', label: 'Reclamation Fund', match: /^Reclamation/i },
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
