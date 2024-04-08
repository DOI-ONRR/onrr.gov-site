export default (router, { database }) => {
	router.get('/search/:term', async (req, res) => {
		const searchTerm = req.params.term;
		const queryResults = await database.select('title as title', 'filename_download as href')
			.from('directus_files')
			.whereILike('title', `%${searchTerm}%`)
			.orderBy('title')
		res.json(queryResults)
	});
};
