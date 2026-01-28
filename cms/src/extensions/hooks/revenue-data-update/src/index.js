export default ({ filter, action }) => {
	action('revenue_data_update.items.create', (meta, context) => {
		console.log('Item created', JSON.stringify(meta.payload, null, 2));
	});
};
