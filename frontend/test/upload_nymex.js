const puppeteer = require('puppeteer');
const main = async () => {
    const browser = await puppeteer.launch({headless:false})
    const page = await browser.newPage()
    await page.goto('https://dev-onrr-cms.app.cloud.gov/admin/content/NYMEX/+')
    
  //  await page.$eval('#directus > div > div.container > div.content > form > div:nth-child(1) > div > input[type=email]', el => el.value = 'jerome.louis@onrr.gov');
  //  await page.waitForSelector('#directus > div > div.container > div.content > form > div:nth-child(2) > div > input[type=password]')
  //  await page.$eval('#directus > div > div.container > div.content > form > div:nth-child(2) > div > input[type=password]', el => el.value='admin2pass!');
//    await page.waitForSelector('button[type=submit]')
//    await page.$eval('button[type=submit]', el => el.click())
    await page.waitForSelector('#main-content > main > div.v-form.grid > div:nth-child(5) > div.interface > div > div.v-menu > div > div > div > div')
    await page.$eval('#main-content > main > div.v-form.grid > div:nth-child(5) > div.interface > div > div.v-menu > div > div > div > div', el => el.click())
    const el = await page.$x('/html/body/div[3]/div[24]/div/div[2]/ul/li[3]')
    const months=[ '04', '05','06', '07', '08', '09', '10', '11', '12']

    for(let ii=0; ii< months.length; ii++ ) {

	let month=months[ii];
        let myLocalValue='https://onrr.gov/valuation/ExcelFiles/NYMEX'+month+'19.xlsx'
	console.log('myLocalValue: ', myLocalValue );
        await page.waitForSelector('#dialog-outlet > div > div.v-card > div.v-card-text > div > div > input[type=text]')
        await page.$eval('#dialog-outlet > div > div.v-card > div.v-card-text > div > div > input[type=text]', (el, value) => el.value = value, myLocalValue)
	console.log('waiting for import button: ')
	await page.waitForSelector('#dialog-outlet > div > div.v-card > div.v-card-actions > div:nth-child(2) > button > span')
	console.log('waiting for Check box upload button: ')
	await page.waitForSelector('#main-content > header > div.actions > div.action-buttons > div:nth-child(2) > button > span > span > i')
	console.log('waiting for +  upload button: ')
        await page.waitForSelector('#main-content > header > div.actions > div.action-buttons > div:nth-child(3) > a')
	await page.goto('https://dev-onrr-cms.app.cloud.gov/admin/content/NYMEX/+')
    }

    //console.log("EL xpath: ", el)
    //el[0].click()
/*    await el[0].evaluate(btn => {
	console.debug("DWGH ------- >", btn);
	btn.closest("li").dispatchEvent(new Event("mousedown"));
	    btn.closest("li").dispatchEvent(new Event("mousepress"));
	//  ^--- .parentNode is also possible instead of .closest("li")
	    btn.closest("li").dispatchEvent(new Event("mouseup"));
    //  ^--- .parentNode is also possible instead of .closest("li")
  });
*/


 /*
    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click("[name='upload']"),
      ]);
    await fileChooser.accept(['C:/PATH/xyz.png']);/html/body/div[1]/div/div/div[1]/div[2]/form/div[3]/div/button
*/
}
main()
