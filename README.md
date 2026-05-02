# ParcelRadar — 17TRACK Node proxy (`server/`)

Bu klasör **Node.js + Puppeteer (Chromium)** ile çalışan HTTP API’dir. **Vercel** ve **Cloudflare Pages** yalnızca **statik dosya** (HTML/CSS/JS) sunar; buradaki sürekli Node süreci ve tarayıcı motoru **bu iki platformda doğrudan çalıştırılamaz**.

## Neyi nerede yayınlarsınız?

| Parça | Platform | Açıklama |
|--------|-----------|----------|
| **Bu `server/`** | [Render](https://render.com), Railway, VPS | `npm install` + `npm start`, `PORT` ortam değişkeni |
| **Expo web (uygulama arayüzü)** | **Vercel** veya **Cloudflare Pages** | Repo **kökü**; çıktı klasörü **`dist/`** (`npm run build:web`) |

Vercel / Cloudflare’de **Root Directory = `server` yapmayın**; aksi halde statik site aracı kaynak kodu veya boş dizin görür.

---

## Vercel + Cloudflare Workers — [parcelradarnode](https://github.com/homelookzombie/parcelradarnode)

**`index.mjs` Vercel’de “sunucu” olarak çalışmaz**; statik hosting kaynak kodu düz metin gösterir. Bu yüzden:

1. Bu repoda **`vercel.json`** → yalnızca **`public/`** yayınlanır (yönlendirme + açıklama; ham `.mjs` CDN’de görünmez).  
2. Gerçek API: **`https://parcelradarnode.onrender.com`** (Render).  
3. Expo ana uygulaması başka repoda ise kökteki `vercel.json` ile **`dist`** kullanılır (bkz. monorepo README).

**Cloudflare Git + Workers:** Kökte **`wrangler.jsonc`** yalnızca **`public/`** klasörünü Workers “assets” olarak sunar ([PR #1](https://github.com/homelookzombie/parcelradarnode/pull/1) autoconfig). `npm run deploy` → `wrangler deploy`. **Puppeteer** yine tam Node ortamında (**Render** vb.) çalışır; Worker yalnızca statik landing içindir.

---

## Vercel (Expo web — tüm ParcelRadar monorepo kökü)

1. **Root Directory:** boş; **`build:web`** → **`dist`**.  
2. `EXPO_PUBLIC_TRACK17_PROXY_URL` = Render tabanı.

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

Yerel: `npm start` (repo kökü). Üretim örneği: `https://parcelradarnode.onrender.com`.

Kaynak kod: [github.com/homelookzombie/parcelradarnode](https://github.com/homelookzombie/parcelradarnode).
