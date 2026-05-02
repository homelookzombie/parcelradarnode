# ParcelRadar ? 17TRACK Node proxy (`server/`)

Bu klasör **Node.js + Puppeteer (Chromium)** ile çal??an HTTP API?dir. **Vercel** ve **Cloudflare Pages** yaln?zca **statik dosya** (HTML/CSS/JS) sunar; buradaki sürekli Node süreci ve taray?c? motoru **bu iki platformda do?rudan çal??t?r?lamaz**.

## Neyi nerede yay?nlars?n?z?

| Parça | Platform | Aç?klama |
|--------|-----------|----------|
| **Bu `server/`** | [Render](https://render.com), Railway, VPS | `npm install` + `npm start`, `PORT` ortam de?i?keni |
| **Expo web (uygulama arayüzü)** | **Vercel** veya **Cloudflare Pages** | Repo **kökü**; ç?kt? klasörü **`dist/`** (`npm run build:web`) |

Vercel / Cloudflare?de **Root Directory = `server` yapmay?n**; aksi halde statik site arac? kaynak kodu veya bo? dizin görür.

---

## Vercel + Cloudflare Workers ? [parcelradarnode](https://github.com/homelookzombie/parcelradarnode)

**`index.mjs` Vercel?de ?sunucu? olarak çal??maz**; statik hosting kaynak kodu düz metin gösterir. Bu yüzden:

1. Bu repoda **`vercel.json`** ? yaln?zca **`public/`** yay?nlan?r (yönlendirme + aç?klama; ham `.mjs` CDN?de görünmez).  
2. Gerçek API: Node'u kurdu?unuz **taban URL**; sabit domain yok. `GET /health` yan?t?nda ters vekil ba?l?klar? varsa `baseUrl` alan? döner.  
3. Expo ana uygulamas? ba?ka repoda ise kökteki `vercel.json` ile **`dist`** kullan?l?r (bkz. monorepo README).

**Cloudflare Git + Workers:** Kökte **`wrangler.jsonc`** + **`worker.mjs`**: `public/` statik; **`GET /health`** ve **`GET /api/*`** için Worker önce çal???r ve iste?i **`TRACK17_UPSTREAM`** de?i?kenindeki Node+Puppeteer taban?na iletir (sonda `/` yok). Tan?ml? de?ilse bu yollar **503** + JSON aç?klama döner. Cloudflare: Workers ? Settings ? Variables / Secrets; yerel: `.dev.vars` (örnek: `.dev.vars.example`). `npm run deploy` ? `wrangler deploy`. ([PR #1](https://github.com/homelookzombie/parcelradarnode/pull/1) autoconfig.)

---

## Vercel (Expo web ? tüm ParcelRadar monorepo kökü)

1. **Root Directory:** bo?; **`build:web`** ? **`dist`**.  
2. `EXPO_PUBLIC_TRACK17_PROXY_URL` = kendi proxy'nizin taban adresi (sonda `/` yok).

---

## Cloudflare Pages (Expo web ? repo kökü)

1. Pages projesinde repo **kökü** kullan?n; **Build output** = **`dist`**.  
2. **Build command:** `npm run build:web`  
3. Wrangler CLI: repo kökünde `npm run build:web` sonra `npx wrangler pages deploy dist` (bkz. kök `wrangler.toml`).  
4. Proxy URL?si yine `EXPO_PUBLIC_TRACK17_PROXY_URL` ile (EAS / Pages env).

---

## Bu API?nin adresleri (proxy çal???rken)

- `GET /health` ? sa?l?k (mümkünse `baseUrl` ile d?? taban)  
- `GET /api/track?nums=...&fc=...` ? 17TRACK REST JSON  

Yerel: `npm start` (repo kökü). Üretim: da??tt???n?z taban + `EXPO_PUBLIC_TRACK17_PROXY_URL`.

Kaynak kod: [github.com/homelookzombie/parcelradarnode](https://github.com/homelookzombie/parcelradarnode).
