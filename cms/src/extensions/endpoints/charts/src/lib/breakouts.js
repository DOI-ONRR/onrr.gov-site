// Shared query helpers for the charts endpoints.
//
// The source collections (revenue, disbursement, production, …) are normalized:
// dimension columns like `commodity`, `location`, `fund` are foreign keys, and the
// human-readable/derived breakout label lives on the related table. So a chart
// grouping needs a JOIN — this module generalizes the join/aggregate/breakout
// logic that the standalone `revenue-summary` / `disbursement-summary` endpoints
// each hand-rolled, so per-collection handlers stay thin.

// Breakout definitions keyed by collection → breakout name.
//   join      : related table to join (and the FK column on the fact table)
//   joinField : column on the related table that holds the breakout label
//   filter    : optional allow-list of label values to include
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
			filter: ['Other funds', 'Historic Preservation Fund', 'Land and Water Conservation Fund', 'Native American tribes and individuals', 'Reclamation Fund', 'State and local governments', 'U.S. Treasury'],
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

// Build a monthly breakout-summary query for a fact table: SUM(amountColumn)
// grouped by the breakout dimension and the standard period fields, filtered to
// Monthly periods and (optionally) the breakout's allow-list. Returns a Knex
// query builder — await it, or chain further before awaiting.
export function monthlyBreakoutSummary(database, { table, amountColumn = 'amount', breakout }) {
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

	return query
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
}

// Total of `amountColumn` per month for the most recent `months` months, with the
// month detail (date, fiscal/calendar year, month labels) joined from `period`.
// Rows are pulled newest-first to grab the most recent N, then returned in
// chronological (ascending) order — ready to plot left-to-right.
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
// calendar years — a year counts as full only when all 12 monthly periods are
// present (so an in-progress year is excluded). Returned oldest → newest, ready to
// plot as yearly columns.
export async function calendarYearTotals(database, { table, amountColumn = 'amount', years = 5 }) {
	const rows = await database
		.select(
			'p.calendar_year',
			database.raw(`SUM("${table}"."${amountColumn}") as "total_amount"`)
		)
		.from(table)
		.join('period as p', `${table}.period`, 'p.id')
		.where('p.type', 'Monthly')
		.groupBy('p.calendar_year')
		.havingRaw('COUNT(DISTINCT "p"."period_date") = 12')
		.orderBy('p.calendar_year', 'desc')
		.limit(years);

	return rows.reverse();
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
