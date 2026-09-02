import { resolveBreakout, breakoutNames, monthlyBreakoutSummary, recentMonthlyTotals, calendarYearTotals, topStates, monthlyByRecipientGroup, disbursementPivot, disbursementPivotOptions, disbursementRecords, pivotDimensions } from '../lib/breakouts.js';

// Split a query param that may arrive as a repeated param (array) or a single
// comma-separated string into a clean array of trimmed, non-empty values.
const csvParam = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

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

	// GET /charts/disbursement/calendar-year-totals?years=5&recipient=native_american
	// Total disbursement amount per full calendar year, most recent N years
	// (default 5), oldest -> newest. Excludes any in-progress calendar year. Optional
	// `recipient` restricts the sum to a RECIPIENT_GROUPS key (e.g. native_american);
	// the full-year set is still computed from all data, so filtered years line up.
	router.get(`${base}/calendar-year-totals`, async (req, res) => {
		const requested = parseInt(req.query.years, 10);
		const years = Math.min(50, Math.max(1, Number.isNaN(requested) ? 5 : requested));
		const recipient = req.query.recipient || null;

		try {
			const data = await calendarYearTotals(database, { table: 'disbursement', years, recipient });
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
	// Monthly disbursement totals pivoted into 5 recipient groups - one wide row per
	// month ({ period_date, month labels, state_local, us_treasury, native_american,
	// reclamation_fund, other_funds }), chronological - for the dataset-page stacked
	// column chart. `months` limits to the most recent N months with data; `years` is
	// the same window in years (years x 12 months) and takes precedence. Default: all.
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

	// GET /charts/disbursement/pivot/options
	// Distinct filter-dropdown values for the pivot UI (months, states, commodities,
	// fund sources, and the recipient group {key,label} list) in one round-trip.
	// Registered before /pivot so the more specific path matches first.
	router.get(`${base}/pivot/options`, async (req, res) => {
		try {
			res.json(await disbursementPivotOptions(database));
		} catch (error) {
			console.error('charts/disbursement/pivot/options error:', error);
			res.status(500).json({ error: 'Failed to fetch pivot options' });
		}
	});

	// GET /charts/disbursement/pivot?groupBy=recipient&from=YYYY-MM-DD&to=YYYY-MM-DD
	//     &recipients=state_local,us_treasury&sources=Onshore,Offshore&state=&commodity=
	// Server-side pivot for the dataset-page "Preview and filter" table: filtered
	// disbursement totals grouped by the chosen dimension, then calendar year + month.
	// recipients = RECIPIENT_GROUPS keys; sources = raw fund.source values. See
	// disbursementPivot() for the response shape.
	router.get(`${base}/pivot`, async (req, res) => {
		const { groupBy, from, to, state, commodity } = req.query;
		if (groupBy && !pivotDimensions().includes(groupBy)) {
			return res.status(400).json({ error: `Invalid groupBy: ${groupBy}. Valid options: ${pivotDimensions().join(', ')}` });
		}
		try {
			const data = await disbursementPivot(database, {
				groupBy,
				from: from || null,
				to: to || null,
				state: state || null,
				commodity: commodity || null,
				recipients: csvParam(req.query.recipients),
				sources: csvParam(req.query.sources),
			});
			res.json(data);
		} catch (error) {
			console.error('charts/disbursement/pivot error:', error);
			res.status(500).json({ error: 'Failed to fetch disbursement pivot' });
		}
	});

	// GET /charts/disbursement/export?from=&to=&recipients=&sources=&state=&commodity=
	// Streams the raw disbursement records matching the current preview filters as CSV
	// (Monthly-enforced), for the dataset Download section's "filtered selection" card.
	// Same filter params as /pivot; recipients = RECIPIENT_GROUPS keys, sources = raw
	// fund.source values.
	router.get(`${base}/export`, async (req, res) => {
		const { from, to, state, commodity } = req.query;
		try {
			const rows = await disbursementRecords(database, {
				from: from || null,
				to: to || null,
				state: state || null,
				commodity: commodity || null,
				recipients: csvParam(req.query.recipients),
				sources: csvParam(req.query.sources),
			});
			const head = ['Date', 'Fund Type', 'Land Category', 'Disbursement Type', 'State', 'County', 'Recipient', 'Source', 'Commodity', 'Disbursement'];
			const esc = (v) => {
				const s = v == null ? '' : String(v);
				return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
			};
			const ymd = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
			const lines = [head.join(',')];
			for (const r of rows) {
				lines.push([ymd(r.period_date), r.fund_type, r.land_category, r.disbursement_type, r.state_name, r.county, r.recipient, r.source, r.commodity, r.amount].map(esc).join(','));
			}
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', 'attachment; filename="disbursements_filtered.csv"');
			res.send(lines.join('\n'));
		} catch (error) {
			console.error('charts/disbursement/export error:', error);
			res.status(500).json({ error: 'Failed to export disbursements' });
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
