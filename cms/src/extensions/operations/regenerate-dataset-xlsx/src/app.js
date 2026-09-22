export default {
	id: 'regenerate-dataset-xlsx',
	name: 'Regenerate Dataset XLSX',
	icon: 'sync',
	description: "Rebuild a dataset's downloadable Excel file from current data, dictionary, and notes.",
	overview: ({ keys, datasets }) => [
		{ label: 'Selected keys', text: keys ? String(keys) : '{{$trigger.body.keys}}' },
		...(datasets ? [{ label: 'Source collections', text: String(datasets) }] : []),
	],
	options: [
		{
			field: 'keys',
			name: 'dataset_metadata keys',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: { language: 'json' },
				note: 'The selected dataset_metadata primary keys. Defaults to the items selected when the flow runs.',
			},
			schema: { default_value: '{{$trigger.body.keys}}' },
		},
		{
			field: 'datasets',
			name: 'Source collections (optional)',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'tags',
				note: 'Optional: source_collection name(s) to regenerate directly, e.g. federal_sales.',
			},
		},
	],
};
