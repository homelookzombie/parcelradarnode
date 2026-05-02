/**
 * ParcelRadar — 17TRACK Puppeteer proxy (Node.js HTTP API)
 *
 * Android / Expo uygulaması buraya HTTP ister; sunucu headless Chromium ile
 * t.17track.net sayfasını açar, sayfanın attığı `track/restapi` yanıtını JSON olarak döner.
 *
 * Render: `PORT` otomatik; Chromium `postinstall` + `.puppeteer-cache/` + `puppeteer-env.mjs`.
 * İstek süresi Render limitlerine sığsın diye sayfa yükleme kısaltıldı; Puppeteer gecikmeli import.
 *
 * API:
 *   GET /api/track?nums=BARKOD&fc=17TRACK_CARRIER_KEY
 *   GET /health  → { "ok": true }
 */

import http from 'node:http';
import { URL } from 'node:url';

process.on('unhandledRejection', (reason) => {
  console.error('[track17-server] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[track17-server] uncaughtException:', err);
});

const PORT = Number(
  process.env.PORT || process.env.TRACK17_PROXY_PORT || 3847
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

/** Dış dünyadaki taban URL (Render/nginx X-Forwarded-*); yoksa dönmez */
function getRequestPublicBase(req) {
  const rawProto = req.headers['x-forwarded-proto'];
  const protoHead =
    typeof rawProto === 'string'
      ? rawProto.split(',')[0].trim()
      : Array.isArray(rawProto)
        ? String(rawProto[0] || '').split(',')[0].trim()
        : '';
  const scheme =
    protoHead === 'https' || protoHead === 'http'
      ? protoHead
      : req.socket?.encrypted
        ? 'https'
        : 'http';
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host;
  const host =
    typeof rawHost === 'string'
      ? rawHost.split(',')[0].trim()
      : Array.isArray(rawHost)
        ? String(rawHost[0] || '').split(',')[0].trim()
        : '';
  if (!host) return undefined;
  return `${scheme}://${host}`;
}

/** Render / küçük VM: bellek ve /dev/shm; istek süresi sınırına uyum */
const CHROME_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-extensions',
  '--no-zygote',
  '--disable-blink-features=AutomationControlled',
];

/** Toplam sayfa aşaması ~55s + tarayıcı açılışı (Render HTTP zaman aşımı genelde <100s) */
const GOTO_TIMEOUT_MS = 50000;
const POST_GOTO_WAIT_MS = 6000;

/**
 * @returns {Promise<object|null>} 17TRACK track/restapi JSON gövdesi
 */
async function captureRestJson(nums, fc) {
  const puppeteer = (await import('puppeteer')).default;

  const trackUrl = `https://t.17track.net/en?nums=${encodeURIComponent(nums)}&fc=${encodeURIComponent(String(fc))}`;

  const launchOpts = {
    headless: true,
    args: CHROME_ARGS,
  };
  try {
    const envEx = process.env.PUPPETEER_EXECUTABLE_PATH;
    const ex =
      typeof envEx === 'string' && envEx.trim().length > 0
        ? envEx.trim()
        : puppeteer.executablePath?.();
    if (typeof ex === 'string' && ex.length > 0) {
      launchOpts.executablePath = ex;
    }
  } catch {
    /* varsayılan */
  }

  const browser = await puppeteer.launch(launchOpts);
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

    await page.goto(trackUrl, { waitUntil: 'networkidle2', timeout: GOTO_TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, POST_GOTO_WAIT_MS));
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
    const baseUrl = getRequestPublicBase(req);
    sendJson(res, 200, {
      ok: true,
      service: 'parcelradar-track17-server',
      ...(baseUrl ? { baseUrl } : {}),
    });
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
    if (path === '/') {
      const baseUrl = getRequestPublicBase(req);
      sendJson(res, 200, {
        ok: true,
        service: 'parcelradar-track17-server',
        hint: 'GET /health | GET /api/track?nums=BARKOD&fc=17TRACK_CARRIER_KEY',
        ...(baseUrl ? { baseUrl } : {}),
      });
      return;
    }
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
  console.log(
    `[track17-server] http://0.0.0.0:${PORT}/  GET /api/track?nums=&fc=  |  GET /health`
  );
  void (async () => {
    try {
      const puppeteer = (await import('puppeteer')).default;
      const ex = puppeteer.executablePath?.();
      console.log('[track17-server] chromium:', ex ?? '(varsayılan)');
    } catch (e) {
      console.error('[track17-server] puppeteer yüklenemedi:', e);
    }
  })();
});
