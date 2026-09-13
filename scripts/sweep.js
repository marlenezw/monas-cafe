const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:4180';
const PHASE = process.env.PHASE || 'before';
const PAGES = (process.env.PAGES || 'index.html,menu.html').split(',');
const OUT = path.join(__dirname, '..', 'evidence');

const BAD_TEXT = ['NaN', 'undefined', 'null', 'Invalid Date', '[object Object]'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const results = [];

  for (const p of PAGES) {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('console', m => m.type() === 'error' && errors.push(`console: ${m.text()}`));
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('response', r => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

    await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const text = await page.evaluate(() => document.body.innerText);
    for (const bad of BAD_TEXT) {
      if (text.includes(bad)) errors.push(`rendered text contains "${bad}"`);
    }

    const banner = await page.evaluate(() => {
      const els = [...document.querySelectorAll('.banner, [role=alert], .error, .alert')];
      return els.filter(e => e.offsetParent !== null).map(e => e.innerText.trim().replace(/\s+/g, ' '));
    });
    banner.forEach(b => errors.push(`visible error banner: ${b}`));

    const brokenImgs = await page.evaluate(() =>
      [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
    brokenImgs.forEach(s => errors.push(`image failed to load: ${s}`));

    const name = p.replace(/\.html$/, '');
    if (errors.length) {
      await page.screenshot({ path: path.join(OUT, `${name}-${PHASE}.png`), fullPage: true });
    }
    results.push({ page: p, errors });
    await page.close();
  }

  await browser.close();

  let broken = 0;
  for (const r of results) {
    if (r.errors.length) {
      broken++;
      console.log(`BROKEN ${r.page}`);
      r.errors.forEach(e => console.log(`   - ${e}`));
    } else {
      console.log(`OK     ${r.page}`);
    }
  }
  console.log(`\n${broken} of ${results.length} pages broken.`);
  process.exit(0);
})();
