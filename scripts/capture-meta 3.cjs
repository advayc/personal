const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => {
    const h1 = document.querySelector('h1');
    return h1 && h1.textContent?.toLowerCase().includes('advay');
  }, { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'public/meta.png', type: 'png' });
  await browser.close();
  console.log('Saved public/meta.png');
})();
