const puppeteer = require('puppeteer-core');
const out = __dirname + '/capturas/';
require('fs').mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe', headless: true, dumpio: !!process.env.DUMP,
    extraPrefsFirefox: { 'media.autoplay.default': 0, 'webgl.force-enabled': true } });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('CONSOLE', m.type(), m.text(), m.location().url); });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  const t0 = Date.now();
  const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', ...a);
  const phase = (p) => page.waitForFunction((p) => window.__dbg && __dbg.S.phase === p, { timeout: 60000 }, p).then(() => log('fase', p));
  const go = (...a) => page.evaluate(async (a) => { __dbg.go(...a); for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(r)); }, a);
  const focus = () => page.evaluate(() => { const f = __dbg.focus; return f && (typeof f.label === 'function' ? f.label() : f.label); });
  const shot = (n) => page.screenshot({ path: out + n + '.png' });
  const use = async (expect) => { await sleep(250); const f = await focus(); log('apuntando a:', f); if (expect && f !== expect) throw new Error('esperaba ' + expect); await page.keyboard.press('KeyE'); };

  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle0' });
  await sleep(800); await shot('00-start');
  await page.click('#startBtn');
  await sleep(6500); await shot('01-muelle');
  await phase('muelle'); await shot('02-muelle-guantes');
  await go(5, 13, 0.35, 0.12); await sleep(1200); await shot('03-casa-fuera');
  await go(0, 2.2, 0, -0.1);
  await phase('tubo'); await shot('04-interior');
  await go(-2.7, -0.9, Math.PI / 2, 0); await use('Responder al tubo');
  await phase('registro');
  await go(-2.75, -2.0, Math.PI / 2, -0.7); await use('Escribir en el registro');
  await sleep(300); await page.keyboard.down('KeyE'); await sleep(6000); await shot('05-registro'); await page.waitForFunction(() => __dbg.S.wrote, { timeout: 120000 });
  await page.keyboard.up('KeyE');
  await phase('estufa');
  await go(2.3, -1.4, -0.9, -0.35); await use('Encender la estufa');
  await sleep(9500); await go(1.6, -0.6, -Math.PI / 2, 0); await sleep(500); await shot('06-ventana');
  await phase('bajar');
  await go(0.9, -1.6, 0, 0.1); await sleep(300); await shot('07-foto');
  await go(0.75, 1.0, 0, -0.9); await use('Coger el papel'); await sleep(500); await shot('07b-pagina1');
  await page.keyboard.press('KeyE');
  await go(2.3, 0.9, Math.PI, -1.0); await use('Bajar al sótano');
  await sleep(2500); await shot('08a-bajando');
  await phase('bidon'); await shot('08-sotano');
  await go(98.2, 2.0, Math.PI, -0.6); await use('Coger el papel'); await sleep(300); await page.keyboard.press('KeyE');
  await go(98.9, -2.6, 0, 0); await sleep(300); log('notas:', await focus());
  await go(102.6, -2.0, -0.43, -0.6); await use('Coger un bidón');
  await sleep(2600); await go(102.6, -2.0, 2.1, 0); await sleep(400); await shot('09-susto');
  await sleep(4000); await shot('10-susto-mira-arriba');
  await phase('faro'); await shot('11-vuelta-casa');
  await go(-4.2, -4.2, Math.atan2(3.8, 3.8), 0); await use('Entrar al faro');
  await phase('escalera'); await sleep(800); await shot('12-escalera-base');
  const climb = (yT) => page.evaluate((yT) => new Promise((res) => {
    const D = __dbg; const t0 = performance.now();
    const step = () => {
      if (D.P.y >= yT || D.S.ended || performance.now() - t0 > 90000) { D.keys.KeyW = false; return res(D.P.y); }
      const a = Math.atan2(D.P.z - D.TW.z, D.P.x - D.TW.x) + 0.45, tx = D.TW.x + Math.cos(a) * 1.45, tz = D.TW.z + Math.sin(a) * 1.45;
      D.look(Math.atan2(-(tx - D.P.x), -(tz - D.P.z)), 0.1); D.keys.KeyW = true; requestAnimationFrame(step);
    }; step();
  }), yT);
  log('subida hasta', await climb(5.5)); await sleep(2000); log('paso extra:', await page.evaluate(() => __dbg.S.extraStep));
  await page.evaluate(() => __dbg.look(__dbg.camera.rotation.y + 3.0, -0.8)); await sleep(500); await shot('13-charcos');
  log('charcos:', await page.evaluate(() => __dbg.S.saidPuddles));
  log('subida hasta', await climb(await page.evaluate(() => __dbg.Y_LOG - 0.1)));
  await page.evaluate(() => { const D = __dbg, sx = D.TW.x + Math.cos(D.A_LOG) * 2.35, sz = D.TW.z + Math.sin(D.A_LOG) * 2.35, sy = D.Y_LOG + 1.55;
    const dx = sx - D.P.x, dz = sz - D.P.z, ey = D.P.y + 1.6; D.look(Math.atan2(-dx, -dz), Math.atan2(sy - ey, Math.hypot(dx, dz))); });
  await sleep(400); const f1 = await focus(); log('apuntando a:', f1); await shot('14-hojas');
  if (f1 === 'Leer las hojas clavadas') { await page.keyboard.press('KeyE'); await sleep(600); await shot('15-hojas-leidas'); await page.keyboard.press('KeyE'); }
  await page.evaluate(() => { const D = __dbg, a = D.A_LOG + 0.75, sx = D.TW.x + Math.cos(a) * 2.35, sz = D.TW.z + Math.sin(a) * 2.35, sy = D.Y_LOG + 0.95;
    const dx = sx - D.P.x, dz = sz - D.P.z, ey = D.P.y + 1.6; D.look(Math.atan2(-dx, -dz), Math.atan2(sy - ey, Math.hypot(dx, dz))); });
  await sleep(400); const f2 = await focus(); log('apuntando a:', f2);
  if (f2 === 'Coger el papel') { await page.keyboard.press('KeyE'); await sleep(500); await shot('16-pagina3'); await page.keyboard.press('KeyE'); }
  log('subida hasta', await climb(99));
  await page.waitForFunction(() => __dbg.S.ended, { timeout: 60000 });
  await sleep(2500); await shot('11-fin');
  log('fin, páginas', await page.evaluate(() => __dbg.S.pages.size), 'tiempo juego', await page.evaluate(() => __dbg.S.time.toFixed(0)));
  await browser.close();
})().catch((e) => { console.log('FALLO', e.message); process.exit(1); });
