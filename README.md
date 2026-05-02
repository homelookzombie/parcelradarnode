# ParcelRadar ? 17TRACK Node proxy (`server/`)

Bu klas?r **Node.js + Puppeteer (Chromium)** ile ?al??an HTTP API?dir. **Vercel** ve **Cloudflare Pages** yaln?zca **statik dosya** (HTML/CSS/JS) sunar; buradaki s?rekli Node s?reci ve taray?c? motoru **bu iki platformda do?rudan ?al??t?r?lamaz**.

## Neyi nerede yay?nlars?n?z?

| Par?a | Platform | A??klama |
|--------|-----------|----------|
| **Bu `server/`** | [Render](https://render.com), Railway, VPS | `npm install` + `npm start`, `PORT` ortam de?i?keni |
| **Expo web (uygulama aray?z?)** | **Vercel** veya **Cloudflare Pages** | Repo **k?k?**; ??kt? klas?r? **`dist/`** (`npm run build:web`) |

Vercel / Cloudflare?de **Root Directory = `server` yapmay?n**; aksi halde statik site arac? kaynak kodu veya bo? dizin g?r?r.

---

## Vercel + Cloudflare Workers ? [parcelradarnode](https://github.com/homelookzombie/parcelradarnode)

**`index.mjs` Vercel?de ?sunucu? olarak ?al??maz**; statik hosting kaynak kodu d?z metin g?sterir. Bu y?zden:

1. Bu repoda **`vercel.json`** ? yaln?zca **`public/`** yay?nlan?r (y?nlendirme + a??klama; ham `.mjs` CDN?de g?r?nmez).  
2. Ger?ek API: Node'u kurdu?unuz **taban URL**; sabit domain yok. `GET /health` yan?t?nda ters vekil ba?l?klar? varsa `baseUrl` alan? d?ner.  
3. Expo ana uygulamas? ba?ka repoda ise k?kteki `vercel.json` ile **`dist`** kullan?l?r (bkz. monorepo README).

**Cloudflare Git + Workers:** K?kte **`wrangler.jsonc`** + **`worker.mjs`**: `public/` statik; **`GET /health`** ve **`GET /api/*`** i?in Worker ?nce ?al???r ve iste?i **`TRACK17_UPSTREAM`** de?i?kenindeki Node+Puppeteer taban?na iletir (sonda `/` yok). Tan?ml? de?ilse bu yollar **503** + JSON a??klama d?ner. Cloudflare: Workers ? Settings ? Variables / Secrets; yerel: `.dev.vars` (?rnek: `.dev.vars.example`). `npm run deploy` ? `wrangler deploy`. ([PR #1](https://github.com/homelookzombie/parcelradarnode/pull/1) autoconfig.)

---

## Vercel (Expo web ? t?m ParcelRadar monorepo k?k?)

1. **Root Directory:** bo?; **`build:web`** ? **`dist`**.  
2. `EXPO_PUBLIC_TRACK17_PROXY_URL` = kendi proxy'nizin taban adresi (sonda `/` yok).

---

## Cloudflare Pages (Expo web ? repo k?k?)

1. Pages projesinde repo **k?k?** kullan?n; **Build output** = **`dist`**.  
2. **Build command:** `npm run build:web`  
3. Wrangler CLI: repo k?k?nde `npm run build:web` sonra `npx wrangler pages deploy dist` (bkz. k?k `wrangler.toml`).  
4. Proxy URL?si yine `EXPO_PUBLIC_TRACK17_PROXY_URL` ile (EAS / Pages env).

---

## Bu API?nin adresleri (proxy ?al???rken)

- `GET /health` ? sa?l?k (m?mk?nse `baseUrl` ile d?? taban)  
- `GET /api/track?nums=...&fc=...` ? 17TRACK REST JSON  

Yerel: `npm start` (repo k?k?). ?retim: da??tt???n?z taban + `EXPO_PUBLIC_TRACK17_PROXY_URL`.

Kaynak kod: [github.com/homelookzombie/parcelradarnode](https://github.com/homelookzombie/parcelradarnode).

---

## Docker (Container App / k8s)

Kökte **`Dockerfile`** + **`.dockerignore`**. Görüntü: Debian `chromium` paketi + `PUPPETEER_EXECUTABLE_PATH`; `npm ci --omit=dev`.

```bash
docker build -t parcelradar-track17 .
docker run --rm -p 8080:8080 -e PORT=8080 parcelradar-track17
# Sa?l?k: http://localhost:8080/health
```

Platform `PORT` verirse (ör. `8080`) onu kullan?n; uygulama `process.env.PORT` okur.
