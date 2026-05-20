export default (router, { database }) => {
	const breakouts = {
		source: {
			join: 'location',
			joinField: 'land_type',
			joinOn: ['revenue.location', 'location.id'],
			filter: ['Federal onshore', 'Federal offshore', 'Native American'],
		},
		recipient: {
			join: 'fund',
			joinField: 'recipient',
			joinOn: ['revenue.fund', 'fund.id'],
			filter: ['Other funds', 'Historic Preservation Fund', 'Land and Water Conservation Fund', 'Native American tribes and individuals', 'Reclamation Fund', 'State and local governments', 'U.S. Treasury'],
		},
	};

	router.get('/', async (req, res) => {
		const breakout = req.query.breakout || 'source';

		const config = breakouts[breakout];
		if (!config) {
			return res.status(400).json({ error: `Invalid breakout: ${breakout}. Valid options: ${Object.keys(breakouts).join(', ')}` });
		}

		try {
			const query = database
				.select(
					database.raw(`"${config.join}"."${config.joinField}" as "breakout_value"`),
					'p.fiscal_year',
					'p.fiscal_month',
					'p.calendar_year',
					'p.period_date',
					'p.month_short',
					'p.month_long',
					database.raw('SUM("disbursement"."amount") as "total_amount"')
				)
				.from('disbursement')
				.join('period as p', 'disbursement.period', 'p.id')
				.join(`${config.join}`, `disbursement.${config.join}`, `${config.join}.id`)
				.where('p.type', 'Monthly');

			if (config.filter) {
				query.whereIn(`${config.join}.${config.joinField}`, config.filter);
			}

			const rows = await query
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
			console.error('disbursement-summary endpoint error:', error);
			res.status(500).json({ error: 'Failed to fetch disbursement summary' });
		}
	});
};
