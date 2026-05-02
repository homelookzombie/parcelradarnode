/**
 * ParcelRadar — 17TRACK Puppeteer proxy (Node.js HTTP API)
 *
 * Android / Expo uygulaması buraya HTTP ister; sunucu headless Chromium ile
 * t.17track.net sayfasını açar, sayfanın attığı `track/restapi` yanıtını JSON olarak döner.
 *
 * Kurulum: cd server && npm install
 * Çalıştır: npm start   veya   PORT=10000 node index.mjs
 * Render: `PORT` otomatik verilir; yerel: `TRACK17_PROXY_PORT` veya 3847.
 *
 * API:
 *   GET /api/track?nums=BARKOD&fc=17TRACK_CARRIER_KEY
 *   GET /health  → { "ok": true }
 *
 * Eski uyumluluk: GET /?nums=...&fc=... (aynı JSON)
 *
 * Expo .env: EXPO_PUBLIC_TRACK17_PROXY_URL=http://SUNUCU_IP:3847
 */

import http from 'node:http';
import { URL } from 'node:url';

import puppeteer from 'puppeteer';

const PORT = Number(
  process.env.PORT || process.env.TRACK17_PROXY_PORT || 3847
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

/**
 * @returns {Promise<object|null>} 17TRACK track/restapi JSON gövdesi
 */
async function captureRestJson(nums, fc) {
  const trackUrl = `https://t.17track.net/en?nums=${encodeURIComponent(nums)}&fc=${encodeURIComponent(String(fc))}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    let captured = null;
    page.on('response', async (response) => {
      try {
        const req = response.request();
        if (!req.url().includes('track/restapi') || req.method() !== 'POST') {
          return;
        }
        const text = await response.text();
        try {
          captured = JSON.parse(text);
        } catch {
          captured = { _parseError: true, _snippet: text.slice(0, 500) };
        }
      } catch {
        /* */
      }
    });

    await page.goto(trackUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    await new Promise((r) => setTimeout(r, 8000));
    return captured;
  } finally {
    await browser.close();
  }
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Yalnızca GET');
    return;
  }

  let u;
  try {
    u = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Geçersiz URL');
    return;
  }

  const path = (u.pathname || '/').replace(/\/$/, '') || '/';

  if (path === '/health') {
    sendJson(res, 200, { ok: true, service: 'parcelradar-track17-server' });
    return;
  }

  const isTrack = path === '/api/track' || path === '/';
  if (!isTrack) {
    sendJson(res, 404, { error: 'Bilinmeyen yol. Kullanım: GET /api/track?nums=&fc=' });
    return;
  }

  const nums = u.searchParams.get('nums');
  const fc = u.searchParams.get('fc');
  if (!nums || !fc) {
    sendJson(res, 400, { error: 'nums ve fc sorgu parametreleri zorunlu' });
    return;
  }

  try {
    const body = await captureRestJson(nums, fc);
    if (!body) {
      sendJson(res, 502, { error: 'track/restapi yakalanamadı' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(
    `[track17-server] http://0.0.0.0:${PORT}/  GET /api/track?nums=&fc=  |  GET /health`
  );
});
