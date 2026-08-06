import { resolveBreakout, breakoutNames, monthlyBreakoutSummary, recentMonthlyTotals, calendarYearTotals, topStates, monthlyByRecipientGroup, disbursementFilterOptions } from '../lib/breakouts.js';

// Registers disbursement chart routes under `base` (mounted by index.js as
// /disbursement, so the full prefix is /charts/disbursement).
export default (router, { database }, base = '') => {
	// GET /charts/disbursement/total-monthly-disbursements?months=24
	// Total disbursement amount per month for the most recent N months (default
	// 24), in chronological order. Month/year detail comes from `period`.
	router.get(`${base}/total-monthly-disbursements`, async (req, res) => {
		const requested = parseInt(req.query.months, 10);
		const months = Math.min(120, Math.max(1, Number.isNaN(requested) ? 24 : requested));

		try {
			const data = await recentMonthlyTotals(database, { table: 'disbursement', months });
			res.json({ data });
		} catch (error) {
			console.error('charts/disbursement/monthly error:', error);
			res.status(500).json({ error: 'Failed to fetch monthly disbursements' });
		}
	});

	// GET /charts/disbursement/calendar-year-totals?years=5
	// Total disbursement amount per full calendar year, most recent N years
	// (default 5), oldest → newest. Excludes any in-progress calendar year.
	router.get(`${base}/calendar-year-totals`, async (req, res) => {
		const requested = parseInt(req.query.years, 10);
		const years = Math.min(50, Math.max(1, Number.isNaN(requested) ? 5 : requested));

		try {
			const data = await calendarYearTotals(database, { table: 'disbursement', years });
			res.json({ data });
		} catch (error) {
			console.error('charts/disbursement/calendar-year-totals error:', error);
			res.status(500).json({ error: 'Failed to fetch calendar-year disbursements' });
		}
	});

	// GET /charts/disbursement/top-states?months=12&limit=10
	// Top N states by total disbursement amount over the most recent N months
	// (defaults: 12 months, 10 states). Ascending by total, so a horizontal bar
	// renders the top state at the top.
	router.get(`${base}/top-states`, async (req, res) => {
		const m = parseInt(req.query.months, 10);
		const months = Math.min(120, Math.max(1, Number.isNaN(m) ? 12 : m));
		const l = parseInt(req.query.limit, 10);
		const limit = Math.min(50, Math.max(1, Number.isNaN(l) ? 10 : l));

		try {
			const data = await topStates(database, { table: 'disbursement', months, limit });
			res.json({ data });
		} catch (error) {
			console.error('charts/disbursement/top-states error:', error);
			res.status(500).json({ error: 'Failed to fetch top states' });
		}
	});

	// GET /charts/disbursement/monthly-by-recipient?months=60  (or ?years=5)
	// Monthly disbursement totals pivoted into 5 recipient groups — one wide row per
	// month ({ period_date, month labels, state_local, us_treasury, native_american,
	// reclamation_fund, other_funds }), chronological — for the dataset-page stacked
	// column chart. `months` limits to the most recent N months with data; `years` is
	// the same window in years (years × 12 months) and takes precedence. Default: all.
	// Response also carries a `summary` for the chart takeaway.
	router.get(`${base}/monthly-by-recipient`, async (req, res) => {
		const y = parseInt(req.query.years, 10);
		const m = parseInt(req.query.months, 10);
		// `years` wins when provided (12 months per year); both windows are clamped.
		let months = null;
		if (!Number.isNaN(y)) months = Math.min(20, Math.max(1, y)) * 12;
		else if (!Number.isNaN(m)) months = Math.min(240, Math.max(1, m));

		try {
			const result = await monthlyByRecipientGroup(database, { table: 'disbursement', months });
			res.json(result);
		} catch (error) {
			console.error('charts/disbursement/monthly-by-recipient error:', error);
			res.status(500).json({ error: 'Failed to fetch monthly disbursements by recipient' });
		}
	});

	// GET /charts/disbursement/filter-options?months=12 (or ?years=1)
	// Distinct available values (present in Monthly disbursement rows) for each filter
	// dimension, so the dataset-page preview dropdowns only offer values that return
	// records: { months, fund_types, land_categories, states, categories, commodities }.
	// `months`/`years` restrict to a recent window (matching the chart's endpoint_url).
	router.get(`${base}/filter-options`, async (req, res) => {
		const y = parseInt(req.query.years, 10);
		const m = parseInt(req.query.months, 10);
		let months = null;
		if (!Number.isNaN(y)) months = Math.min(20, Math.max(1, y)) * 12;
		else if (!Number.isNaN(m)) months = Math.min(240, Math.max(1, m));

		try {
			const data = await disbursementFilterOptions(database, { table: 'disbursement', months });
			res.json({ data });
		} catch (error) {
			console.error('charts/disbursement/filter-options error:', error);
			res.status(500).json({ error: 'Failed to fetch filter options' });
		}
	});

	// GET /charts/disbursement/summary?breakout=source|recipient
	// Monthly disbursement totals, broken out by the requested dimension.
	router.get(`${base}/summary`, async (req, res) => {
		const name = req.query.breakout || 'source';
		const breakout = resolveBreakout('disbursement', name);
		if (!breakout) {
			return res.status(400).json({
				error: `Invalid breakout: ${name}. Valid options: ${breakoutNames('disbursement').join(', ')}`,
			});
		}

		try {
			const data = await monthlyBreakoutSummary(database, { table: 'disbursement', breakout });
			res.json({ data });
		} catch (error) {
			console.error('charts/disbursement/summary error:', error);
			res.status(500).json({ error: 'Failed to fetch disbursement summary' });
		}
	});
};
