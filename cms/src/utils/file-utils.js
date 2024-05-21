import fetch from 'node-fetch'
import readXlsxFile from 'read-excel-file/node'
import fs from 'fs'

const getMonthFromString = (month, year) => {
  return new Date(Date.parse(`${month} 1, ${year}`)).getMonth() + 1
}

const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath)
    inputStream.pipe(writeStream).on('finish', resolve).on('error', reject)
  })
}

export const parseFile = (payload, file) => {
	return readXlsxFile(file, {
    	transformData (data) {
      	    return data.filter((row, index) => index > 0)
        }
    }).then(rows => {
        const fDate = new Date(
        `${rows[0][0]}, ${getMonthFromString(rows[0][3], rows[0][0])}, 01`
        )
        let date = new Date(fDate.getFullYear(), fDate.getMonth(), fDate.getDate())
        let indexZoneItems = []

        rows.forEach(row => {
            let nObj = {}
            nObj.abbreviation = row[1]
            nObj.index_zone = row[2]
            nObj.price = row[4]

            indexZoneItems.push(nObj)
        })

        if (indexZoneItems.length > 0) {
            payload.date = date
            payload.index_zones = indexZoneItems
        }
  	})
}

export const getFile = async (payload, filePath, url) => {
	let response = await fetch(url)
  	let promise = streamToFile(response.body, filePath)
  	return promise
}