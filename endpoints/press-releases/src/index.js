const fetch = require('node-fetch');
const fs = require('fs');

const targetUrl = process.env.NODE_ENV === 'production' ? 'https://dev-onrr-cms.app.cloud.gov' : 'http://localhost:8055'
console.log('press-release targetUrl ----------------------> ', targetUrl);


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
  console.log("------------------------------------------------------------------------------------")
  console.log("                                                                    ")
  console.log("url:  ", url)
  console.log("                                                                    ")
  console.log("------------------------------------------------------------------------------------")

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
        console.log('press-releases results: ', results)
        // res.json(results)

        const filePath = `/tmp/${ file }`;
        const url = `/assets/${ results[0].id }`;
        //currently write file to /tmp  should be able to read stream from s3 and write directly?
        
        await getFile(filePath, `http://localhost:8055${ url }`);
        return res.sendFile(filePath)
      })
			.catch((error) => {
				return next(new ServiceUnavailableException(error.message));
			});
	});
};


