import { resolveBreakout, breakoutNames, monthlyBreakoutSummary } from '../lib/breakouts.js';

// Registers revenue chart routes under `base` (mounted by index.js as /revenue,
// so the full prefix is /charts/revenue).
export default (router, { database }, base = '') => {
	// GET /charts/revenue/summary?breakout=source|revenue_type|commodity
	// Monthly revenue totals, broken out by the requested dimension.
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
};
