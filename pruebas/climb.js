// Bot que sube la senda de la montaña saltando las piedras, con capturas.
const puppeteer = require('puppeteer-core');
const out = __dirname + '/capturas/';
require('fs').mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe', headless: true, dumpio: !!process.env.DUMP,
    extraPrefsFirefox: { 'media.autoplay.default': 0, 'webgl.force-enabled': true } });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on('console', (m) => { if (['error', 'warning', 'log'].includes(m.type())) console.log('CONSOLE', m.type(), m.text()); });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle0' });
  await page.click('#startBtn');
  await sleep(6500); await page.screenshot({ path: out + 'c0-muelle.png' });
  await page.waitForFunction(() => __dbg.S.phase === 'muelle', { timeout: 90000 });
  await page.screenshot({ path: out + 'c1-muelle-faro.png' });
  // Arranca el bot dentro de la página
  await page.evaluate(() => {
    const D = __dbg, T = D.ROUTE.slice();
    window.__bot = { i: 0, n: T.length, falls: 0, log: [] };
    let lastSafeY = null;
    const step = () => {
      const b = window.__bot; if (b.i >= T.length) { D.keys.KeyW = false; b.done = true; return; }
      const t = T[b.i], dx = t.x - D.P.x, dz = t.z - D.P.z, d = Math.hypot(dx, dz);
      if (d < (t.stone ? 0.35 : 0.6) && D.S.onGround) { b.i++; }
      D.look(Math.atan2(-dx, -dz), 0.05);
      D.keys.KeyW = true;
      if (D.S.onGround) {
        const fx = D.P.x + dx / d * 0.55, fz = D.P.z + dz / d * 0.55;
        const g = D.floorAt(fx, fz, D.P.y + D.STEP);
        if (!g || g.y < D.P.y - 0.3) { D.jump(); }
      }
      if (D.S.respawning && !b.wasR) { b.falls++; if (b.log.length < 5) b.log.push('caida en objetivo ' + b.i); }
      b.wasR = D.S.respawning;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  let k = 0, last = null, stuck = 0;
  for (;;) {
    await sleep(3000);
    const st = await page.evaluate(() => ({ ...window.__bot, y: __dbg.P.y.toFixed(2), x: __dbg.P.x.toFixed(1), z: __dbg.P.z.toFixed(1), t: __dbg.S.time.toFixed(1), phase: __dbg.S.phase, why: __dbg.why, tg: window.__bot && __dbg.ROUTE[window.__bot.i] }));
    console.log(JSON.stringify(st));
    if (k % 3 === 0) await page.screenshot({ path: out + `c2-subida-${k}.png` });
    k++;
    if (st.done || st.phase !== 'muelle' || k > 60) break;
    if (last && last.i === st.i && last.x === st.x && last.z === st.z) { stuck++; if (stuck > 2) break; } else stuck = 0; last = st;
  }
  await page.screenshot({ path: out + 'c3-arriba.png' });
  await browser.close();
})().catch((e) => { console.log('FALLO', e.message); process.exit(1); });
