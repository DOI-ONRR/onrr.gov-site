import { resolveBreakout, breakoutNames, monthlyBreakoutSummary, recentMonthlyTotals } from '../lib/breakouts.js';

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
