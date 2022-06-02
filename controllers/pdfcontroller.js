const puppeteer = require('puppeteer')
const { writeFile } = require('fs');

module.exports. generatePdf=  async function(){

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('http://localhost:8090/leads', {
        waitUntil: 'networkidle0'
    })

    const pdf = await page.pdf({
        printBackground: true,
        format: 'Letter'
    })

    await browser.close()

    writeFile("./LeadsReport.pdf", pdf, {}, (err) => {
        if(err){
            return console.error('error')
        }

        console.log('PDF Generated!')
    })

}