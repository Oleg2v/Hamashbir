#!/usr/bin/env node
/**
 * Screenshot bench (Playwright, pre-installed Chromium).
 *
 *   node scripts/shoot.cjs --path /style-tile --out shots/st \
 *     [--sizes 1440x900,390x844] [--sun] [--reduced] [--full] [--scale 1]
 *     [--selector "#palette"] [--scroll 0,25,50,75,100] [--wait 900]
 *     [--base http://localhost:3000] [--axe] [--clean]
 *
 * --scroll takes percentages of the scrollable height (one shot per value).
 * --selector screenshots just that element (full element, scrolled into view).
 * --axe injects axe-core from node_modules if present and prints violations.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};

const base = opt('base', 'http://localhost:3000');
const route = opt('path', '/style-tile');
const out = opt('out', 'shots');
const sizes = String(opt('sizes', '1440x900,390x844'))
  .split(',')
  .map((s) => s.split('x').map(Number));
const sun = !!opt('sun', false);
const reduced = !!opt('reduced', false);
const full = !!opt('full', false);
const scale = Number(opt('scale', 1));
const selector = opt('selector', null);
const scroll = opt('scroll', null);
const wait = Number(opt('wait', 900));
const axe = !!opt('axe', false);
const clean = !!opt('clean', false); // hide fixed chrome (header, badge, skip link) for section shots

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: scale,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
      locale: 'he-IL',
      hasTouch: w < 768,
      isMobile: w < 768,
    });
    if (sun) {
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem('hm:sun', '1');
        } catch {}
      });
    }
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error(`[pageerror ${w}] ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && console.error(`[console ${w}] ${m.text()}`));
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(wait);
    if (clean) {
      await page.addStyleTag({
        content: '.skip-link,.demo-badge,body>header.fixed,header.fixed{visibility:hidden!important}',
      });
    }
    const tag = `${w}x${h}${sun ? '-sun' : ''}${reduced ? '-rm' : ''}`;

    if (selector) {
      const el = page.locator(String(selector)).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(wait);
      const file = path.join(out, `${tag}-${String(selector).replace(/[^a-z0-9]+/gi, '')}.png`);
      await el.screenshot({ path: file });
      console.log(file);
    } else if (scroll) {
      const stops = String(scroll).split(',').map(Number);
      for (const pct of stops) {
        await page.evaluate((p) => {
          const max = document.documentElement.scrollHeight - innerHeight;
          window.scrollTo({ top: (max * p) / 100, behavior: 'instant' });
        }, pct);
        await page.waitForTimeout(wait);
        const file = path.join(out, `${tag}-s${String(pct).padStart(3, '0')}.png`);
        await page.screenshot({ path: file });
        console.log(file);
      }
    } else {
      const file = path.join(out, `${tag}${full ? '-full' : ''}.png`);
      await page.screenshot({ path: file, fullPage: full });
      console.log(file);
    }

    if (axe) {
      let axePath;
      try {
        axePath = require.resolve('axe-core/axe.min.js', { paths: [process.cwd()] });
      } catch {
        console.error('axe-core not installed (npm i -D axe-core)');
      }
      if (axePath) {
        await page.addScriptTag({ path: axePath });
        const res = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const r = await axe.run(document, { resultTypes: ['violations'] });
          return r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.slice(0, 6).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]),
            count: v.nodes.length,
          }));
        });
        console.log(`axe ${tag}: ${res.length} violation types`);
        for (const v of res) console.log(JSON.stringify(v));
      }
    }
    await ctx.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
