export default {
	id: 'rerun-revenue-data-update',
	name: 'Rerun Revenue Data Update',
	icon: 'replay',
	description: 'Re-run the selected revenue_data_update item(s) from the stored dataset, period, and file.',
	overview: ({ keys }) => [
		{ label: 'Selected items', text: keys ? String(keys) : '{{$trigger.body.keys}}' },
	],
	options: [
		{
			field: 'keys',
			name: 'revenue_data_update keys',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: { language: 'json' },
				note: 'The revenue_data_update item key(s) to re-run. Defaults to the item(s) the flow was triggered on.',
			},
			schema: { default_value: '{{$trigger.body.keys}}' },
		},
	],
};
