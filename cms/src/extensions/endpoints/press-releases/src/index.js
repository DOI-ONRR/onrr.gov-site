const fetch = require('node-fetch');
const fs = require('fs');

const targetUrl = process.env.NODE_ENV === 'production' ? 'https://dev-onrr-cms.app.cloud.gov' : 'http://localhost:8055'

const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath)
    inputStream
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject)
  })
} 

const getFile = (async (filePath,url) => {
  let response = await fetch(url)
  let promise = streamToFile(response.body, filePath);
  return promise
});


export default (router, { services, exceptions }) => {
	const { ItemsService } = services;
	const { ServiceUnavailableException } = exceptions;

	router.get('/:file', (req, res, next) => {
		const fileService = new ItemsService('directus_files', { schema: req.schema, accountability: req.accountability });
    const file = req.params.file;

		fileService
			.readByQuery({ fields: ['*'], filter: {filename_download: {'_eq': file} } })
			.then(async (results) => {

        const filePath = `/tmp/${ file }`;
        const url = `/assets/${ results[0].id }`;
        
        await getFile(filePath, `${ targetUrl }${ url }`);
        return res.sendFile(filePath)
      })
			.catch((error) => {
				return next(new ServiceUnavailableException(error.message));
			});
	});
};


