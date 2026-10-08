const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const htmlPath = path.resolve(__dirname, 'brochure.html');
    const outputPath = path.resolve(__dirname, 'Al_Jazeera_Corporate_Brochure.pdf');
    
    console.log('Loading brochure from:', htmlPath);
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    const page = await browser.newPage();
    
    // Set viewport to high resolution A4 ratio
    await page.setViewport({
      width: 1200,
      height: 1697,
      deviceScaleFactor: 2
    });

    await page.goto(fileUrl, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000
    });

    // Wait a brief moment to ensure webfonts render cleanly
    await new Promise(r => setTimeout(r, 1500));

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    const stats = fs.statSync(outputPath);
    console.log(`SUCCESS: PDF created at ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.error('ERROR creating PDF:', err);
    process.exit(1);
  }
})();
