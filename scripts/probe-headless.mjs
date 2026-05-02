/**
 * Puppeteer ile 17TRACK restapi yanıtını konsola yazdırır.
 * Kullanım: npm run probe:headless -- 23074173112231 100703
 * (server klasöründen)
 */

import puppeteer from 'puppeteer';

const nums = process.argv[2] || '23074173112231';
const fc = process.argv[3] || '100703';
const trackUrl = `https://t.17track.net/en?nums=${encodeURIComponent(nums)}&fc=${encodeURIComponent(String(fc))}`;

async function main() {
  console.log('Headless tarayıcı başlatılıyor…');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1366, height: 768 });

  /** @type {{ status: number; body: unknown; url: string } | null} */
  let captured = null;

  page.on('response', async (response) => {
    try {
      const req = response.request();
      if (!req.url().includes('track/restapi') || req.method() !== 'POST') {
        return;
      }
      const status = response.status();
      const text = await response.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        body = { _raw: text.slice(0, 2000) };
      }
      captured = { status, body, url: req.url() };
    } catch {
      /* */
    }
  });

  console.log('Sayfa:', trackUrl);
  await page.goto(trackUrl, {
    waitUntil: 'networkidle2',
    timeout: 120000,
  });

  await new Promise((r) => setTimeout(r, 8000));

  if (captured) {
    console.log('\n--- track/restapi yanıtı ---');
    console.log('HTTP:', captured.status);
    console.log(JSON.stringify(captured.body, null, 2));
    const mc = captured.body?.meta?.code;
    console.log('\nmeta.code:', mc);
  } else {
    console.log('\nUyarı: track/restapi POST yakalanamadı.');
    const len = await page.evaluate(() => document.documentElement.outerHTML.length);
    console.log('document.outerHTML uzunluk:', len);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
