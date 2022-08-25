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
  
  router.get('/:date', (req, res, next) => {
    const linkService = new ItemsService('reporter_letters', { schema: req.schema, accountability: req.accountability });
    const date=req.params.date

    
    linkService
      .readByQuery({ fields: ['*'],  filter: {date: {'_eq': date}}})
      .then( async (results) => {
        const filePath='/tmp/reporter_letter.'+date
        const url='/assets/'+results[0].file
        //currently write file to /tmp  should be able to read stream from s3 and write directly?
        
        await getFile(filePath,'https://dev-onrr-cms.app.cloud.gov'+url);
        return res.sendFile(filePath)
      }
      )
      .catch((error) => {
	return next(new ServiceUnavailableException(error.message));
      });
  });
  router.get('/:date/:index', (req, res, next) => {
    const linkService = new ItemsService('reporter_letters', { schema: req.schema, accountability: req.accountability });
    const date=req.params.date
    const index=req.params.index - 1
    
    linkService
      .readByQuery({ fields: ['*'],  filter: {date: {'_eq': date}}})
      .then( async (results) => {
        console.debug("----------------------------------------------------------------------------------");



        //        console.debug(results);
                console.debug(index);





        console.debug("----------------------------------------------------------------------------------");
        res.setHeader('Content-Disposition', '
filename=' + results[index].title + '.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        const filePath='/tmp/reporter_letter.'+results[index].file
        const url='/assets/'+results[index].file
        //currently write file to /tmp  should be able to read stream from s3 and write directly?
        
        await getFile(filePath,'https://dev-onrr-cms.app.cloud.gov'+url+'.pdf');
        return res.sendFile(filePath)
      }
      )
      .catch((error) => {
	return next(new ServiceUnavailableException(error.message));
      });
  });
};


