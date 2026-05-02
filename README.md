# ParcelRadar — 17TRACK Node proxy (`server/`)

Bu klasör **Node.js + Puppeteer (Chromium)** ile çalışan HTTP API’dir. **Vercel** ve **Cloudflare Pages** yalnızca **statik dosya** (HTML/CSS/JS) sunar; buradaki sürekli Node süreci ve tarayıcı motoru **bu iki platformda doğrudan çalıştırılamaz**.

## Neyi nerede yayınlarsınız?

| Parça | Platform | Açıklama |
|--------|-----------|----------|
| **Bu `server/`** | [Render](https://render.com), Railway, VPS | `npm install` + `npm start`, `PORT` ortam değişkeni |
| **Expo web (uygulama arayüzü)** | **Vercel** veya **Cloudflare Pages** | Repo **kökü**; çıktı klasörü **`dist/`** (`npm run build:web`) |

Vercel / Cloudflare’de **Root Directory = `server` yapmayın**; aksi halde statik site aracı kaynak kodu veya boş dizin görür.

---

## Vercel (Expo web — repo kökü)

1. Vercel’e **tüm ParcelRadar** reposunu bağlayın.  
2. **Root Directory:** boş (`.`) — `server` değil.  
3. Kökteki **`vercel.json`** kullanılır: `build:web` → **`dist`**.  
4. Ortam: `EXPO_PUBLIC_TRACK17_PROXY_URL=https://<Render-proxy-adresiniz>` (sonunda `/` yok).

Yerel kontrol: `npm run build:web` sonrası `dist/index.html` oluşmalı.

---

## Cloudflare Pages (Expo web — repo kökü)

1. Pages projesinde repo **kökü** kullanın; **Build output** = **`dist`**.  
2. **Build command:** `npm run build:web`  
3. Wrangler CLI: repo kökünde `npm run build:web` sonra `npx wrangler pages deploy dist` (bkz. kök `wrangler.toml`).  
4. Proxy URL’si yine `EXPO_PUBLIC_TRACK17_PROXY_URL` ile (EAS / Pages env).

---

## Bu API’nin adresleri (proxy çalışırken)

- `GET /health` — sağlık  
- `GET /api/track?nums=...&fc=...` — 17TRACK REST JSON  

Yerel: `npm start` (`server` içinde). Üretim örneği: `https://parcelradarnode.onrender.com`.
