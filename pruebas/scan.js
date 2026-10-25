// Recorre la senda: desde el centro de cada punto, comprueba si algo bloquea antes del borde (d < 1.3)
const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe', headless: true, extraPrefsFirefox: { 'media.volume_scale': '0.0', 'media.webspeech.synth.enabled': false } });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8765/');
  await page.waitForFunction(() => window.__dbg && __dbg.path);
  const r = await page.evaluate(() => {
    const D = __dbg, out = {};
    D.S.onGround = true;
    for (let i = 0; i < D.path.length; i++) {
      const p = D.path[i]; if (!p.carve || p.chasm) continue;
      const nx = -p.dz, nz = p.dx;
      for (const [ux, uz, nm] of [[nx, nz, 'izq'], [-nx, -nz, 'der'], [p.dx, p.dz, 'del']]) {
        D.P.set(p.x, p.y, p.z);
        for (let d = 0.15; d < 1.3; d += 0.15) {
          const x = p.x + ux * d, z = p.z + uz * d;
          if (D.blocked(x, z)) { const k = D.why + ' ' + nm; (out[k] = out[k] || []).push(i + '@' + d.toFixed(2)); break; }
          const g = D.floors[0].at(x, z); if (g !== null) D.P.set(x, g, z);
        }
      }
    }
    return out;
  });
  for (const [k, v] of Object.entries(r)) console.log(k, v.length, v.slice(0, 12).join(' '));
  await browser.close();
})();
