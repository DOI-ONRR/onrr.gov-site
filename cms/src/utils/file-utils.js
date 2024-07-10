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


const ExcelDateToJSDate = (serial) => {
    let utc_days = Math.floor(serial - 25568);

    let utc_value = utc_days * 86400;

    let date_info = new Date(utc_value * 1000);

    let fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    let seconds = total_seconds % 60;

    total_seconds -= seconds;

    let hours = Math.floor(total_seconds / (60 * 60));

    let minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(
        date_info.getFullYear(),
        date_info.getMonth(),
        date_info.getDate(),
        hours,
        minutes,
        seconds
    );
};

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

export const parseFileNymex = (payload, file) => {
    return readXlsxFile(file).then((rows) => {
        const date = ExcelDateToJSDate(rows[0][0]);
        const CMA = rows[1][1];
        const Roll = rows[2][1];
        payload.date = date;
        payload.average = CMA;
        payload.roll = Roll;
    });
};

export const getFile = async (filePath, url) => {
	let response = await fetch(url)
    let promise = streamToFile(response.body, filePath)
  	return promise
}