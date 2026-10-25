// Capturas fijas de la casa (fuera y dentro) y del muelle, sin jugar la partida
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tag = process.argv[2] || 'v';
require('fs').mkdirSync(__dirname + '/capturas', { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe', headless: true });
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8765/'); await page.click('#startBtn');
  await page.waitForFunction(() => __dbg.S.phase === 'muelle', { timeout: 90000 });
  const look = (x, z, tx, tz, p) => page.evaluate(([x, z, tx, tz, p]) => { __dbg.S.started = true; __dbg.go(x, z, Math.atan2(-(tx - x), -(tz - z)), p); }, [x, z, tx, tz, p]);
  const views = [['muelle', -22, -41, -8, -8, 0.4], ['fuera', 5, 9, 0, 0, 0.1], ['dentro1', 1.5, 2.6, -2.5, -1.5, -0.15], ['dentro2', -1, -2.2, 2, 2.5, -0.1], ['dentro3', 2.5, -0.5, -3.5, 2, -0.2]];
  for (const [n, ...v] of views) { await look(...v); await sleep(2600); await page.screenshot({ path: `${__dirname}/capturas/${tag}-${n}.png` }); }
  await browser.close();
})();
