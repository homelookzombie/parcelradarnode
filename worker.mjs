/**
 * Cloudflare Worker: `public/` statik dosyalar + GET /health ve /api/* için
 * TRACK17_UPSTREAM (Node+Puppeteer proxy tabanı) ile ters vekil.
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

function json(status, body) {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  for (const [k, v] of Object.entries(cors)) {
    h.set(k, v);
  }
  return new Response(JSON.stringify(body), { status, headers: h });
}

function wantsApiRoute(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/health') return true;
  if (p.startsWith('/api/')) return true;
  return false;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: new Headers(cors) });
    }

    const url = new URL(request.url);

    if (wantsApiRoute(url.pathname)) {
      if (request.method !== 'GET') {
        return json(405, { error: 'Yalnizca GET' });
      }

      const raw = env.TRACK17_UPSTREAM;
      const upstream = typeof raw === 'string' ? raw.trim() : '';
      if (!upstream) {
        return json(503, {
          error: 'TRACK17_UPSTREAM ayarli degil',
          hint:
            'Workers: Settings > Variables > TRACK17_UPSTREAM = Node proxy tabani (sonda / yok). Ornek: wrangler secret put TRACK17_UPSTREAM',
        });
      }

      const base = upstream.replace(/\/+$/, '');
      const targetUrl = `${base}${url.pathname}${url.search}`;
      const upstreamRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: request.headers.get('Accept') || 'application/json',
        },
      });

      const out = new Headers(upstreamRes.headers);
      out.set('Access-Control-Allow-Origin', '*');
      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        headers: out,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
