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

export const parseFileIndexZones = (payload, file) => {
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

export const parseFileIndianGasMajorPortion = (payload, file) => {
    return readXlsxFile(file, {
        transformData(data) {
            return data.filter((row, index) => index > 0);
        },
    }).then((rows) => {
        const fDate = new Date(
            `${rows[0][1]}, ${getMonthFromString(rows[0][2], rows[0][1])}, 01`
        );
        let date = new Date(
            fDate.getFullYear(),
            fDate.getMonth(),
            fDate.getDate()
        );
        let indexZoneItems = [];

        rows.forEach((row) => {
            let nObj = {};
            let dueDate = new Date(row[4]);
            let splitDate = dueDate.toISOString().split("T")[0];
            let [year, month, day] = splitDate.split("-");
            let formattedDueDate = [year, month, day].join("-");
            nObj.designatedArea = row[0];
            nObj.price = row[3];
            nObj.dueDate = formattedDueDate;

            indexZoneItems.push(nObj);
        });

        if (indexZoneItems.length > 0) {
            payload.date = date;
            payload.index_zones = indexZoneItems;
        }
    });
};

export const parseFileIbmp = (payload, file) => {
    return readXlsxFile(file, {
        transformData(data) {
            return data.filter((row, index) => index > 0);
        },
    }).then((rows) => {
        const fDate = new Date(
            `${rows[0][0]}, ${getMonthFromString(rows[0][1], rows[0][0])}, 01`
        );
        let date = new Date(
            fDate.getFullYear(),
            fDate.getMonth(),
            fDate.getDate()
        );
        let lineItems = [];

        rows.forEach((row) => {
            let nObj = {};
            nObj.designatedArea = row[2];
            nObj.condensate02 = row[3];
            nObj.sweet61 = row[4];
            nObj.sour62 = row[5];
            nObj.asphaltic63 = row[6];
            nObj.blackWax64 = row[7];
            nObj.yellowWax65 = row[8];

            lineItems.push(nObj);
        });

        if (lineItems.length > 0) {
            payload.date = date;
            payload.ibmp_line_items = lineItems;
        }
    });
};

export const getFile = async (payload, filePath, url) => {
	let response = await fetch(url)
  	let promise = streamToFile(response.body, filePath)
  	return promise
}