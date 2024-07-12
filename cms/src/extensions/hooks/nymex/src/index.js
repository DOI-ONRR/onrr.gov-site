import * as fileUtils from '../../../../utils/file-utils';

export default ({ filter, action }) => {
	filter('NYMEX.items.create', async (payload, meta, context) => {
		let base_url = 
			process.env.PUBLIC_URL !== '/' 
			? `${ process.env.PUBLIC_URL }/assets/` 
			: 'http://localhost:8055/assets/';
      	
		const url = `${ base_url + payload.Spreadsheet }.xlsx`;
      	const filePath = `/tmp/${payload.Spreadsheet}.xlsx`;

      	await fileUtils.getFile(filePath, url);
      	await fileUtils.parseFileNymex(payload, filePath);
	});
};
