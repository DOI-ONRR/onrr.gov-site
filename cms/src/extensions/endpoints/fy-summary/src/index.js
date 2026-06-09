export default (router, { database }) => {

	// GET /fy-summary/production
	// Returns current and previous FY production totals by commodity
	// Previous FY is limited to the same fiscal months available in the current FY
	router.get('/production', async (req, res) => {
		try {
			// Find the max fiscal year that has production data
			const maxFyResult = await database
				.select(database.raw('MAX("p"."fiscal_year") as "max_fy"'))
				.from('production as prod')
				.join('period as p', 'prod.period', 'p.id')
				.where('p.type', 'Monthly')
				.first();

			const maxFy = maxFyResult?.max_fy;
			if (!maxFy) return res.json({ data: { current: [], previous: [] } });

			// Find the max fiscal month in the current FY with production data
			const maxMonthResult = await database
				.select(database.raw('MAX("p"."fiscal_month") as "max_month"'))
				.from('production as prod')
				.join('period as p', 'prod.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.first();

			const maxMonth = maxMonthResult?.max_month;

			// Current FY: all months
			const current = await database
				.select(
					'c.name as commodity',
					'prod.unit_abbr',
					database.raw('SUM("prod"."volume") as "volume"')
				)
				.from('production as prod')
				.join('period as p', 'prod.period', 'p.id')
				.join('commodity as c', 'prod.commodity', 'c.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.groupBy('c.name', 'prod.unit_abbr');

			// Previous FY: only months <= maxMonth
			const previous = await database
				.select(
					'c.name as commodity',
					'prod.unit_abbr',
					database.raw('SUM("prod"."volume") as "volume"')
				)
				.from('production as prod')
				.join('period as p', 'prod.period', 'p.id')
				.join('commodity as c', 'prod.commodity', 'c.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy - 1)
				.where('p.fiscal_month', '<=', maxMonth)
				.groupBy('c.name', 'prod.unit_abbr');

			res.json({
				data: {
					fiscal_year: maxFy,
					max_fiscal_month: maxMonth,
					current,
					previous,
				},
			});
		} catch (error) {
			console.error('fy-summary/production error:', error);
			res.status(500).json({ error: 'Failed to fetch production summary' });
		}
	});

	// GET /fy-summary/revenue
	// Returns current and previous FY revenue totals
	router.get('/revenue', async (req, res) => {
		try {
			const maxFyResult = await database
				.select(database.raw('MAX("p"."fiscal_year") as "max_fy"'))
				.from('revenue as r')
				.join('period as p', 'r.period', 'p.id')
				.where('p.type', 'Monthly')
				.first();

			const maxFy = maxFyResult?.max_fy;
			if (!maxFy) return res.json({ data: { current: null, previous: null } });

			const maxMonthResult = await database
				.select(database.raw('MAX("p"."fiscal_month") as "max_month"'))
				.from('revenue as r')
				.join('period as p', 'r.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.first();

			const maxMonth = maxMonthResult?.max_month;

			const currentResult = await database
				.select(database.raw('SUM("r"."amount") as "total"'))
				.from('revenue as r')
				.join('period as p', 'r.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.first();

			const previousResult = await database
				.select(database.raw('SUM("r"."amount") as "total"'))
				.from('revenue as r')
				.join('period as p', 'r.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy - 1)
				.where('p.fiscal_month', '<=', maxMonth)
				.first();

			res.json({
				data: {
					fiscal_year: maxFy,
					max_fiscal_month: maxMonth,
					current: { revenue: currentResult?.total, fy: 'current' },
					previous: { revenue: previousResult?.total, fy: 'previous' },
				},
			});
		} catch (error) {
			console.error('fy-summary/revenue error:', error);
			res.status(500).json({ error: 'Failed to fetch revenue summary' });
		}
	});

	// GET /fy-summary/disbursements
	// Returns current and previous FY disbursement totals
	router.get('/disbursements', async (req, res) => {
		try {
			const maxFyResult = await database
				.select(database.raw('MAX("p"."fiscal_year") as "max_fy"'))
				.from('disbursement as d')
				.join('period as p', 'd.period', 'p.id')
				.where('p.type', 'Monthly')
				.first();

			const maxFy = maxFyResult?.max_fy;
			if (!maxFy) return res.json({ data: { current: null, previous: null } });

			const maxMonthResult = await database
				.select(database.raw('MAX("p"."fiscal_month") as "max_month"'))
				.from('disbursement as d')
				.join('period as p', 'd.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.first();

			const maxMonth = maxMonthResult?.max_month;

			const currentResult = await database
				.select(database.raw('SUM("d"."amount") as "total"'))
				.from('disbursement as d')
				.join('period as p', 'd.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy)
				.first();

			const previousResult = await database
				.select(database.raw('SUM("d"."amount") as "total"'))
				.from('disbursement as d')
				.join('period as p', 'd.period', 'p.id')
				.where('p.type', 'Monthly')
				.where('p.fiscal_year', maxFy - 1)
				.where('p.fiscal_month', '<=', maxMonth)
				.first();

			res.json({
				data: {
					fiscal_year: maxFy,
					max_fiscal_month: maxMonth,
					current: { disbursement: currentResult?.total, fy: 'current' },
					previous: { disbursement: previousResult?.total, fy: 'previous' },
				},
			});
		} catch (error) {
			console.error('fy-summary/disbursements error:', error);
			res.status(500).json({ error: 'Failed to fetch disbursement summary' });
		}
	});

	// GET /fy-summary/max-month
	// Returns the max fiscal month and fiscal year for each dataset
	router.get('/max-month', async (req, res) => {
		try {
			async function getMaxMonth(table) {
				const maxFyResult = await database
					.select(database.raw('MAX("p"."fiscal_year") as "max_fy"'))
					.from(`${table}`)
					.join('period as p', `${table}.period`, 'p.id')
					.where('p.type', 'Monthly')
					.first();

				const maxFy = maxFyResult?.max_fy;
				if (!maxFy) return { fiscal_month: null, fiscal_year: null };

				const maxMonthResult = await database
					.select(database.raw('MAX("p"."fiscal_month") as "max_month"'))
					.from(`${table}`)
					.join('period as p', `${table}.period`, 'p.id')
					.where('p.type', 'Monthly')
					.where('p.fiscal_year', maxFy)
					.first();

				return { fiscal_month: maxMonthResult?.max_month, fiscal_year: maxFy };
			}

			const [production, revenue, disbursements] = await Promise.all([
				getMaxMonth('production'),
				getMaxMonth('revenue'),
				getMaxMonth('disbursement'),
			]);

			res.json({
				data: [
					{ dataset: 'production', ...production },
					{ dataset: 'revenue', ...revenue },
					{ dataset: 'disbursements', ...disbursements },
				],
			});
		} catch (error) {
			console.error('fy-summary/max-month error:', error);
			res.status(500).json({ error: 'Failed to fetch max month data' });
		}
	});
};
