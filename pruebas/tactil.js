// Controles del celular con toques reales (pantalla táctil emulada en Firefox): joystick, mirar y botón E
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = process.argv[2] || 'http://localhost:8765/?tactil&casa';
(async () => {
  const b = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe', headless: true,
    extraPrefsFirefox: { 'media.volume_scale': '0.0', 'media.webspeech.synth.enabled': false, 'dom.w3c_touch_events.enabled': 1 } });
  const p = await b.newPage(); await p.setViewport({ width: 915, height: 412, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto(url); await sleep(1500);
  await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'click'])
    addEventListener(t, (e) => __ev.push(t + ':' + (e.pointerType || '') + ':' + (e.target.id || e.target.tagName)), true); });
  // tocar «Empezar» con el dedo
  const sb = await p.evaluate(() => { const r = document.getElementById('startBtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(sb[0], sb[1]); await sleep(500);
  console.log('tras tocar Empezar:', await p.evaluate(() => ({ started: __dbg.S.started, ui: document.getElementById('touch').className, ev: __ev.splice(0).join(' ') })));
  await p.waitForFunction(() => __dbg.S.phase === 'tubo' && !__dbg.S.cutscene, { timeout: 60000 }).catch(() => console.log('no llegó a tubo'));
  await sleep(800);
  const st = () => p.evaluate(() => ({ x: +__dbg.P.x.toFixed(2), z: +__dbg.P.z.toFixed(2), yaw: +__dbg.camera.rotation.y.toFixed(2), paused: __dbg.S.paused, cut: __dbg.S.cutscene }));
  const s0 = await st();
  const c = await p.evaluate(() => { const r = document.getElementById('stick').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.touchStart(c[0], c[1]); await p.touchscreen.touchMove(c[0], c[1] - 20); await p.touchscreen.touchMove(c[0], c[1] - 35);
  await sleep(1000); const s1 = await st(); await p.touchscreen.touchEnd();
  console.log('joystick:', s0, '→', s1, 'eventos:', await p.evaluate(() => __ev.splice(0).slice(0, 12).join(' ')));
  await p.touchscreen.touchStart(750, 200); await p.touchscreen.touchMove(720, 200); await p.touchscreen.touchMove(680, 200); await p.touchscreen.touchEnd(); await sleep(200);
  const s2 = await st(); console.log('mirar:', s1.yaw, '→', s2.yaw, 'eventos:', await p.evaluate(() => __ev.splice(0).slice(0, 8).join(' ')));
  await p.evaluate(() => __dbg.go(-2.7, -0.9, Math.PI / 2, 0)); await sleep(500);
  const e = await p.evaluate(() => { const r = document.getElementById('btnUse').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(e[0], e[1]);
  await p.waitForFunction(() => __dbg.S.phase !== 'tubo', { timeout: 8000 }).then(() => console.log('botón E: respondió al tubo')).catch(() => console.log('botón E: NO'));
  console.log('pausado al final:', await p.evaluate(() => __dbg.S.paused));
  await b.close();
})().catch((e) => { console.log('FALLO', e.message); process.exit(1); });
