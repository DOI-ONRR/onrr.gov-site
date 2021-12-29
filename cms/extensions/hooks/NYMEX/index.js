

const fetch = require('node-fetch');
const readXlsxFile=require('read-excel-file/node'); //absolultely requires /node
const util = require('util')
const fs = require('fs')
const streamPipeline = util.promisify(require('stream').pipeline)
// const AWS = require('aws-sdk');
const ENV=process.env


/*
AWS.config.update({region: ENV.STORAGE_AWS_REGION,
		   maxRetries: 3,
		   httpOptions: {timeout: 30000, connectTimeout: 5000},
		   accessKeyId: ENV.STORAGE_AWS_KEY,
		   secreatAccessKeyId: ENV.STORAGE_AWS_SECRET
		  }
		 )
const s3 = new AWS.S3({bucketEndpoint: ENV.STORAGE_AWS_ENDPOINT
		      })

*/

		  
		  
// from https://stackoverflow.com/questions/37614649/how-can-i-download-and-save-a-file-using-the-fetch-api-node-js
const download = (async (url, path) => {
    const res = await fetch(url);
   
    const fileStream = fs.createWriteStream(path)
    return new Promise((resolve, reject) => {
	res.body.pipe(fileStream);
	res.body.on("error", reject);
	fileStream.on("finish", ()=>{
	    fileStream.close();
	    console.log("file downloaded");
	});
	
    });

    
})


/*
close seems to keep file open and parseFile can't do its thing
const download = async (url,file) => {
    download("URL ", url, " file ", file);
    const response = await fetch(url)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    //    console.log("response :", response);

    console.log("write file")
    await streamPipeline(response.body, fs.createWriteStream(file))

    return file

}
*/
// const parseFile =  (file) => {
//     console.debug("FILE: ", file);
//     readXlsxFile(file, { dateFormat: 'MMMM YYYY' }).then((rows) => {
// 	console.log('Rows XXX!', rows)
//     })
// }

const ExcelDateToJSDate = (serial) => {
    let utc_days  = Math.floor(serial - 25568);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
   // console.debug("date_info: ", serial, utc_days, utc_value, date_info)
    let fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);
    let seconds = total_seconds % 60;
    total_seconds -= seconds;
    let hours = Math.floor(total_seconds / (60 * 60));//
    let minutes = Math.floor(total_seconds / 60) % 60;

   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

const parseFile =  (payload,file) => {
    return	readXlsxFile(file).then((rows) => {
	date=ExcelDateToJSDate(rows[0][0]);
	CMA=rows[1][1];
	Roll=rows[2][1];
	CMARoll=rows[3][1];
	payload.date=date
	payload.average=CMA
	payload.roll=Roll
	console.debug("month: ",date, " CMA: ", CMA, " Roll: ", Roll, " CMA + Roll: ", CMARoll);

	
    })
}

const downloadFile = (filePath, bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    fs.writeFileSync(filePath, data.Body.toString());
    console.log(`${filePath} has been created!`);
  });
};
/*
const getS3File = (async (payload,filePath) => {
    const params={Bucket: ENV.STORAGE_AWS_BUCKET, Key: payload.Spreadsheet+'.xlsx'}
    let readStream = s3.getObject(params).createReadStream();
    let promise = streamToFile(readStream, filePath);
    return promise
    
});
*/

const getFile = (async (payload,filePath,url) => {


/*    console.log("------------------------------------------------------------------------------------")
    console.log("                                                                    ")
    console.log("url:  ", url)
    console.log("                                                                    ")
    console.log("------------------------------------------------------------------------------------")
  const params={Bucket: ENV.STORAGE_AWS_BUCKET, Key: payload.Spreadsheet+'.xlsx'}
*/
  
    let response = await fetch(url)
    let promise = streamToFile(response.body, filePath);
    return promise
    
});


const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath)
    inputStream
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject)
  })
} 

module.exports = function Nymex({ filter, action }) {

    filter('items.create', async (payload, meta,context) => {
	
	
	const filePath='/tmp/'+payload.Spreadsheet+'.xlsx';
	const url='http://localhost:8055/assets/'+payload.Spreadsheet+'.xlsx'
	console.log('Payload!',payload);
	//console.log('PROCESS.ENV XXX!',process.env);
	await getFile(payload,filePath,url);
	await parseFile(payload,filePath);
	
    });
/*    action('items.create', (meta, context) => {
	console.log('Item created XXX!', meta, context);
	const url='http://localhost:8055/assets/'+meta.payload.Spreadsheet
	const file='/tmp/'+meta.payload.Spreadsheet+'.xlsx'
	console.log("FILE ", file,  " URL ", url)
	//download(url,file)
	
    });
*/
}

    
//    const readXlsxFile = require('read-excel-file/node')
//    readXlsxFile(fs.createReadStream('/path/to/file')).then((rows) => {
//	console.log('Rows XXX!', rows)
	// `rows` is an array of rows
	// each row being an array of cells.
//    })
