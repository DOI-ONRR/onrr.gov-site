

const fetch = require('node-fetch');
const ENV=process.env


module.exports = function documentLinks({ filter, action }) {

    filter('pages.items.update', async (payload, meta,context) => {

        console.debug("ENVIRONMENT: ", process.env);
        console.log('Payload!',payload);
	console.log('Meta!',meta);
	console.log('context!',meta);
        //console.log('PROCESS.ENV XXX!',process.env);
    });
   action('pages.items.update', (meta, context) => {
	console.log('Item created XXX!', meta, context);
    });

}

    
//    const readXlsxFile = require('read-excel-file/node')
//    readXlsxFile(fs.createReadStream('/path/to/file')).then((rows) => {
//	console.log('Rows XXX!', rows)
	// `rows` is an array of rows
	// each row being an array of cells.
//    })
