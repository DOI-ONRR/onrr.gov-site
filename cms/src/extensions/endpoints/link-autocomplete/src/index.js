export default (router, { database }) => {
	const query = `
	(select title as name,
		filename_download as href,
		COALESCE((select '/press-releases/' from press_releases where file = d.id),
			(select '/reporter-letters/' from reporter_letters where file = d.id),
			(select '/unbundling/' from plant_specific_ucas where file = d.id), '/document/') as path
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
		const queryResults = await database.select('name', 'href', 'path').fromRaw(query, [searchTerm, searchTerm])
		res.json({
			"success": true,
			"items": queryResults
		})
	});
};
