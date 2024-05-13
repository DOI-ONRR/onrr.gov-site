export default (router, { database }) => {
	const query = `
	(select title as name,
		filename_download as href
	from directus_files d
	where (lower(title) like '%' || lower(?) || '%'
		or lower(filename_download) like '%' || lower(?) || '%')
		and not exists (
			select 1
			from ibmp
			where spreadsheet = d.id)
		and not exists (
			select 1
			from index_zones
			where spreadsheet = d.id)
		and not exists (
			select 1
			from indian_gas_major_portion
			where spreadsheet = d.id)
		and not exists (
			select 1
			from "NYMEX"
			where "Spreadsheet" = d.id)) as results
	`;
	router.get('/', async (req, res) => {
		const searchTerm = req.query.term;
		const queryResults = await database.select('name', 'href').fromRaw(query, [searchTerm, searchTerm])
		res.json({
			"success": true,
			"items": queryResults
		})
	});
};
