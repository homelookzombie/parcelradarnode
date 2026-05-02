/**
 * npm postinstall: Chromium’u PUPPETEER_CACHE_DIR altına indirir (Render build + runtime aynı yol).
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(serverRoot, '.puppeteer-cache');
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || cache;
mkdirSync(cache, { recursive: true });

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const r = spawnSync(cmd, ['puppeteer', 'browsers', 'install', 'chrome'], {
  stdio: 'inherit',
  cwd: serverRoot,
  env: { ...process.env, PUPPETEER_CACHE_DIR: cache },
  shell: process.platform === 'win32',
});

const code = r.status ?? (r.error ? 1 : 0);
if (code !== 0) {
  console.warn('[install-chrome] Chromium indirilemedi (kod:', code, '). Render’da build loguna bakın.');
}
process.exit(code);
