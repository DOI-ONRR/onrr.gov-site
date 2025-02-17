import * as fileUtils from '../../../../utils/file-utils';

export default ({ filter, action }) => {
	filter('index_zones.items.create', async (payload, meta, context) => {
    	let base_url =
      		process.env.PUBLIC_URL !== '/'
        	? `${process.env.PUBLIC_URL}/assets/`
        	: 'http://localhost:8055/assets/'

    	const url = `${base_url + payload.spreadsheet}.xlsx`
    	const filePath = `/tmp/${payload.spreadsheet}.xlsx`

		await fileUtils.getFile(filePath, url)
    	await fileUtils.parseFileIndexZones(payload, filePath)
	})
}
