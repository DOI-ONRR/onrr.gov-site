export default (router, { database }) => {
	router.get('/', async (req, res) => {
		const searchTerm = req.query.term;
		const queryResults = await database.select('title as name', 'filename_download as href')
			.from('directus_files')
			.whereILike('title', `%${searchTerm}%`)
			.orderBy('title')
		res.json({
			"success": true,
			"items": queryResults
		})
	});
};
