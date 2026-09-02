const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = '/Users/marlenemhangami/monas-cafe/video';
const BASE = 'http://127.0.0.1:4173';
const W = 1280, H = 800;

// Synthetic cursor — Playwright's video doesn't capture the real pointer.
const cursorScript = `
window.__cursor = () => {
  if (document.getElementById('__c')) return;
  const c = document.createElement('div');
  c.id = '__c';
  c.style.cssText = 'position:fixed;top:0;left:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transition:transform .45s cubic-bezier(.4,0,.2,1);will-change:transform';
  c.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M4 2l13 7.5-5.6 1.4L9 17z" fill="#1f1b2e" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.documentElement.appendChild(c);
};
window.__move = (x, y) => {
  window.__cursor();
  document.getElementById('__c').style.transform = 'translate(' + x + 'px,' + y + 'px)';
};
window.__tap = () => {
  const c = document.getElementById('__c');
  if (!c) return;
  const r = document.createElement('div');
  const m = c.style.transform.match(/translate\\(([-\\d.]+)px,\\s*([-\\d.]+)px\\)/);
  const x = m ? +m[1] : 0, y = m ? +m[2] : 0;
  r.style.cssText = 'position:fixed;left:' + (x - 18) + 'px;top:' + (y - 18) + 'px;width:56px;height:56px;border-radius:50%;border:2.5px solid #8957e5;z-index:2147483646;pointer-events:none;opacity:.9;transform:scale(.3);transition:transform .5s ease-out,opacity .5s ease-out';
  document.documentElement.appendChild(r);
  requestAnimationFrame(() => { r.style.transform = 'scale(1)'; r.style.opacity = '0'; });
  setTimeout(() => r.remove(), 600);
};
window.__glide = (to, ms) => new Promise(res => {
  const start = window.scrollY, delta = to - start, t0 = performance.now();
  const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  (function step(now){
    const t = Math.min((now - t0) / ms, 1);
    window.scrollTo(0, start + delta * ease(t));
    t < 1 ? requestAnimationFrame(step) : res();
  })(performance.now());
});
`;

const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: W, height: H } }
  });
  await ctx.addInitScript(cursorScript);
  const page = await ctx.newPage();

  const move = (x, y) => page.evaluate(([x, y]) => window.__move(x, y), [x, y]);
  const glide = (to, ms) => page.evaluate(([to, ms]) => window.__glide(to, ms), [to, ms]);

  // --- 1. Arrive at the cafe -------------------------------------------
  await page.goto(`${BASE}/index.html`);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const i = document.querySelector('.stage img');
    return i && i.complete && i.naturalWidth > 0;
  });
  await move(600, 430);
  await wait(1300);

  // Look over at Mona before anything else.
  const mona = await page.locator('.stage img').boundingBox();
  await move(mona.x + mona.width / 2, mona.y + mona.height * 0.42);
  await wait(2000);

  // Drift down to show the room, then back up.
  await glide(520, 1600);
  await wait(1200);
  await glide(0, 1100);
  await wait(700);

  // --- 2. Reach for the menu -------------------------------------------
  const btn = await page.locator('a.btn-primary').boundingBox();
  await move(btn.x + btn.width / 2, btn.y + btn.height / 2);
  await wait(900);
  await page.evaluate(() => window.__tap());
  await wait(350);
  await page.locator('a.btn-primary').click();

  // --- 3. The menu is broken -------------------------------------------
  await page.waitForLoadState('networkidle');
  await move(640, 300);
  await wait(2600);              // let the banner land

  await glide(360, 1500);        // NaN prices down the board
  await wait(1900);
  await glide(560, 1500);
  await wait(1700);

  // --- 4. Rest on the broken total -------------------------------------
  // Document-space position: boundingBox() is viewport-relative and we've scrolled.
  const totalDocY = await page.evaluate(() => {
    const el = document.getElementById('grand-total');
    return window.scrollY + el.getBoundingClientRect().top;
  });
  await glide(Math.max(0, totalDocY - H + 190), 1400);
  await wait(700);
  const t2 = await page.locator('#grand-total').boundingBox();
  await move(t2.x + t2.width / 2, t2.y + t2.height / 2);
  await wait(3200);

  await ctx.close();
  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.webm'));
  const src = path.join(OUT, files[0]);
  const dest = '/Users/marlenemhangami/monas-cafe/menu-bug.webm';
  fs.renameSync(src, dest);
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log('saved:', dest, (fs.statSync(dest).size / 1024).toFixed(0) + ' KB');
})();
