const { chromium } = require('playwright');

(async () => {
  const url = 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);  // optional, falls Daten dynamisch geladen werden

  // Inhalt holen
  const html = await page.content();

  // Beispiel: alle <p>-Tags extrahieren
  const paragraphs = await page.$$eval('p', nodes => nodes.map(n => n.innerText.trim()));

  console.log("=== Extrahierter Text ===");
  console.log(paragraphs.join('\n'));

  await browser.close();
})();