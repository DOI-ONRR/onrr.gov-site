const puppeteer = require('puppeteer');
const main = async () => {
    const browser = await puppeteer.launch({headless:false})
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(120000); //timeout 60 seconds now
        await page.setDefaultTimeout(120000); //timeout 60 seconds now
    await page.goto('https://dev-onrr-cms.app.cloud.gov/admin/content/NYMEX/+')
    
  //  await page.$eval('#directus > div > div.container > div.content > form > div:nth-child(1) > div > input[type=email]', el => el.value = 'jerome.louis@onrr.gov');
  //  await page.waitForSelector('#directus > div > div.container > div.content > form > div:nth-child(2) > div > input[type=password]')
  //  await page.$eval('#directus > div > div.container > div.content > form > div:nth-child(2) > div > input[type=password]', el => el.value='admin2pass!');
//    await page.waitForSelector('button[type=submit]')
//    await page.$eval('button[type=submit]', el => el.click())


    //    const el = await page.$x('/html/body/div[3]/div[24]/div/div[2]/ul/li[3]')
    const years =['15','16', '17']
    const months=[ '01','02','03','04', '05','06', '07', '08', '09', '10', '11', '12']
    for(let jj=0; jj< years.length; jj++ ) {
    for(let ii=0; ii< months.length; ii++ ) {
	let year=years[jj];
	let month=months[ii];
        let myLocalValue='https://onrr.gov/valuation/ExcelFiles/NYMEX'+month+year+'.xlsx'
	    await page.waitForSelector('#main-content > main > div.v-form.grid > div:nth-child(5) > div.interface > div > div.v-menu > div > div > div > div')
	await page.click('#main-content > main > div.v-form.grid > div:nth-child(5) > div.interface > div > div.v-menu > div > div > div > div')
//    await page.$eval('#main-content > main > div.v-form.grid > div:nth-child(5) > div.interface > div > div.v-menu > div > div > div > div', el => el.click())
	await page.waitForSelector('div.v-menu-content > ul > li:nth-child(3)')
	await page.click('div.v-menu-content > ul > li:nth-child(3)')
	console.log('myLocalValue: ', myLocalValue );
        await page.waitForSelector('#dialog-outlet > div > div.v-card > div.v-card-text > div > div > input[type=text]')
/*        await page.$eval('#dialog-outlet > div > div.v-card > div.v-card-text > div > div > input[type=text]', (el, value) =>
          { el.value = value
           const event = new Event('change');
           el.dispatchEvent(event);
          },  myLocalValue)
*/
	await page.type('#dialog-outlet > div > div.v-card > div.v-card-text > div > div > input[type=text]', myLocalValue)
	console.log('waiting for import button: ')
	await page.waitForSelector('#dialog-outlet > div > div.v-card > div.v-card-actions > div:nth-child(2) > button > span')
	await page.click('#dialog-outlet > div > div.v-card > div.v-card-actions > div:nth-child(2) > button > span')
	console.log('waiting for Check box upload button: ')
	await page.waitForSelector('#main-content > header > div.actions > div.action-buttons > div:nth-child(2) > button > span > span > i')
	await page.click('#main-content > header > div.actions > div.action-buttons > div:nth-child(2) > button > span > span > i')
	console.log('waiting for +  upload button: ')
        await page.waitForSelector('#main-content > header > div.actions > div.action-buttons > div:nth-child(3) > a')
        //await page.click('#main-content > header > div.actions > div.action-buttons > div:nth-child(3) > a')

    }
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
