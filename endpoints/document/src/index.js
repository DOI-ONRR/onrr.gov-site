/*
export default {
  id: 'document',
  handler: (router) => {
      console.debug("R: ----------------->", router)
    router.get('/', (req, res) => res.send('Hello, World!'));
    router.get('/intro/:page/document/:name', (req, res) =>{
      console.debug('-----------------req', req);
      res.send('Nice to meet you.')
    }
                                             );
    router.get('/goodbye', (req, res) => res.send('Goodbye!'));
  },

};
*/

const fetch = require('node-fetch');
const fs = require('fs');


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
    const linkService = new ItemsService('links', { schema: req.schema, accountability: req.accountability });
    const file=req.params.file

    
    linkService
      .readByQuery({ fields: ['*'],  filter: {target: {'_eq': file}}})
      .then( async (results) => {
        const filePath='/tmp/'+file
        const url='/assets/'+results[0].directus_files_id;
        //currently write file to /tmp  should be able to read stream from s3 and write directly?
        
        await getFile(filePath,'https://dev-onrr-cms.app.cloud.gov'+url);
        return res.download(filePath)
      }
      )
      .catch((error) => {
	return next(new ServiceUnavailableException(error.message));
      });
  });
};


