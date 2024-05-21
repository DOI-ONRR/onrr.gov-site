import * as fileUtils from '../../../../utils/file-utils';

export default ({ filter, action }) => {
	filter('index_zones.items.create', async payload => {
    	let base_url =
      		process.env.PUBLIC_URL !== '/'
        	? `${process.env.PUBLIC_URL}/assets/`
        	: 'http://localhost:8055/assets/'

    	const url = `${base_url + payload.spreadsheet}.xlsx`
    	const filePath = `/tmp/${payload.spreadsheet}.xlsx`

    	await fileUtils.getFile(payload, filePath, url)
    	await fileUtils.parseFile(payload, filePath)
	})
}
