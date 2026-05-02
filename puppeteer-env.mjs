/**
 * Render vb.: Chromium önbelleği proje dizininde olsun (deploy paketine girsin).
 * `node --import ./puppeteer-env.mjs ...` ile index’ten önce yüklenir.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const cache = path.join(serverRoot, '.puppeteer-cache');
if (!process.env.PUPPETEER_CACHE_DIR) {
  process.env.PUPPETEER_CACHE_DIR = cache;
}
try {
  mkdirSync(cache, { recursive: true });
} catch {
  /* */
}
