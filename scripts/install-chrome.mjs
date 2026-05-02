/**
 * npm postinstall: Chromium’u PUPPETEER_CACHE_DIR altına indirir (Render build + runtime aynı yol).
 * Docker: sistem Chromium kullanılıyorsa PUPPETEER_SKIP_DOWNLOAD=true veya PUPPETEER_EXECUTABLE_PATH ile atlanır.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

if (
  process.env.PUPPETEER_SKIP_DOWNLOAD === 'true' ||
  (typeof process.env.PUPPETEER_EXECUTABLE_PATH === 'string' &&
    process.env.PUPPETEER_EXECUTABLE_PATH.trim().length > 0)
) {
  console.log('[install-chrome] Atlandi (Docker / sistem Chromium).');
  process.exit(0);
}

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(serverRoot, '.puppeteer-cache');
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || cache;
mkdirSync(cache, { recursive: true });

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const r = spawnSync(cmd, ['puppeteer', 'browsers', 'install', 'chrome'], {
  stdio: 'inherit',
  cwd: serverRoot,
  env: { ...process.env, PUPPETEER_CACHE_DIR: cache },
  shell: true,
});

const code = r.status ?? (r.error ? 1 : 0);
if (code !== 0) {
  console.warn('[install-chrome] Chromium indirilemedi (kod:', code, '). Render’da build loguna bakın.');
}
process.exit(code);
