const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const htmlPath = path.resolve(__dirname, 'brochure_content.html');
    const outputPath = path.resolve(__dirname, 'Al_Jazeera_Brochure_Content.pdf');
    
    console.log('Rendering content PDF from:', htmlPath);
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 1697,
      deviceScaleFactor: 2
    });

    await page.goto(fileUrl, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        right: '16mm',
        bottom: '16mm',
        left: '16mm'
      }
    });

    await browser.close();

    const stats = fs.statSync(outputPath);
    console.log(`SUCCESS: Content PDF created at ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('ERROR creating Content PDF:', err);
    process.exit(1);
  }
})();
