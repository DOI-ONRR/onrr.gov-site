

const fetch = require('node-fetch');
const readXlsxFile = require('read-excel-file/node'); //absolultely requires /node
const util = require('util');
const fs = require('fs');
// const streamPipeline = util.promisify(require('stream').pipeline);
// const AWS = require('aws-sdk');
const ENV = process.env;

// AWS.config.update({
//   region: ENV.STORAGE_AWS_REGION,
//   maxRetries: 3,
//   httpOptions: {timeout: 30000, connectTimeout: 5000},
//   accessKeyId: ENV.STORAGE_AWS_KEY,
//   secreatAccessKeyId: ENV.STORAGE_AWS_SECRET
// });

// const s3 = new AWS.S3({bucketEndpoint: ENV.STORAGE_AWS_ENDPOINT})


// from https://stackoverflow.com/questions/37614649/how-can-i-download-and-save-a-file-using-the-fetch-api-node-js
const download = (async (url, path) => {
  const res = await fetch(url);
  
  const fileStream = fs.createWriteStream(path)
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('file downloaded');
    });
  });
});


const getMonthFromString = (month, year) => {
   return new Date(Date.parse(`${ month } 1, ${ year }`)).getMonth()+1
}

const ExcelDateToJSDate = (serial) => {
    let utc_days  = Math.floor(serial - 25568);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
   // console.debug('date_info: ', serial, utc_days, utc_value, date_info)
    let fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);
    let seconds = total_seconds % 60;
    total_seconds -= seconds;
    let hours = Math.floor(total_seconds / (60 * 60));//
    let minutes = Math.floor(total_seconds / 60) % 60;

   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

const parseFile = (payload, file) => {
  return readXlsxFile(file, { 
    transformData(data) {

      // Remove header row
      return data.filter((row, index) => (index > 0));
  }}).then(rows => {
    // console.debug('rows ---------> ', rows);
    // console.log('get month num', getMonthFromString(rows[0][3], rows[0][0]))
    const fDate = new Date(`${ rows[0][0] }, ${ getMonthFromString(rows[0][3], rows[0][0]) }, 01`);
    let date = new Date (fDate.getFullYear(), fDate.getMonth(), fDate.getDate())
    let indexZoneItems = []

    rows.forEach(row => {
      // console.log('rows.forEach row: ', row);
      let nObj = {}
      nObj.abbreviation = row[1]
      nObj.index_zone = row[2]
      nObj.price = row[4]

      indexZoneItems.push(nObj)
    })


    if (indexZoneItems.length > 0) {
      // console.debug('month ---------> ', date);
      payload.date = date;
      payload.index_zones = indexZoneItems;
    }
    
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

const getFile = (async (payload,filePath,url) => {
  console.log('------------------------------------------------------------------------------------')
  console.log('                                                                    ')
  console.log('url:  ', url)
  console.log('                                                                    ')
  console.log('------------------------------------------------------------------------------------')

  let response = await fetch(url);
  let promise = streamToFile(response.body, filePath);
  return promise;
});


const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    inputStream
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject)
  })
} 

module.exports = function index_zones({ filter, action }) {
  filter('index_zones.items.create', async (payload, meta,context) => {

      console.debug('ENVIRONMENT ------> ', process.env);
      let base_url = (ENV.PUBLIC_URL !== '/') ? `${ ENV.PUBLIC_URL }/assets/` : 'http://localhost:8055/assets/';
      console.debug('base_url -------> ', base_url);
      const url = `${ base_url + payload.spreadsheet }.xlsx`;
      const filePath = `/tmp/${ payload.spreadsheet }.xlsx`;

      console.log('Payload!', payload);
      //console.log('PROCESS.ENV XXX!',process.env);
      await getFile(payload,filePath,url);
      await parseFile(payload,filePath);
  });
}