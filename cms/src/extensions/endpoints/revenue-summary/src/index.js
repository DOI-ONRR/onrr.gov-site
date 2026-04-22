export default (router, { database }) => {
	const breakouts = {
		source: {
			join: 'location',
			joinField: 'land_type',
			alias: 'breakout_value',
			filter: ['Federal onshore', 'Federal offshore', 'Native American', 'Federal - not tied to a lease'],
		},
		revenue_type: {
			join: 'fund',
			joinField: 'revenue_type',
			alias: 'breakout_value',
			filter: ['Other revenues', 'Inspection fees', 'Civil penalties', 'Rents', 'Bonus', 'Royalties'],
		},
		commodity: {
			join: 'commodity',
			joinField: 'name',
			alias: 'breakout_value',
			filter: ['Oil', 'Gas', 'Coal', 'Not tied to a commodity'],
		},
	};

	router.get('/', async (req, res) => {
		const breakout = req.query.breakout || 'source';

		const config = breakouts[breakout];
		if (!config) {
			return res.status(400).json({ error: `Invalid breakout: ${breakout}. Valid options: ${Object.keys(breakouts).join(', ')}` });
		}

		try {
			const rows = await database
				.select(
					database.raw(`"${config.join}"."${config.joinField}" as "${config.alias}"`),
					'p.fiscal_year',
					'p.fiscal_month',
					'p.calendar_year',
					'p.period_date',
					'p.month_short',
					'p.month_long',
					database.raw('SUM("revenue"."amount") as "total_amount"')
				)
				.from('revenue')
				.join('period as p', 'revenue.period', 'p.id')
				.join(`${config.join}`, `revenue.${config.join}`, `${config.join}.id`)
				.where('p.type', 'Monthly')
				.whereIn(`${config.join}.${config.joinField}`, config.filter)
				.groupBy(
					`${config.join}.${config.joinField}`,
					'p.fiscal_year',
					'p.fiscal_month',
					'p.calendar_year',
					'p.period_date',
					'p.month_short',
					'p.month_long'
				)
				.orderBy('p.period_date', 'asc');

			res.json({ data: rows });
		} catch (error) {
			console.error('revenue-summary endpoint error:', error);
			res.status(500).json({ error: 'Failed to fetch revenue summary' });
		}
	});
};
