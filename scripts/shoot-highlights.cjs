#!/usr/bin/env node
/**
 * Presentation stills: one viewport per moment, at 2× (JPEG), for sharing.
 *
 *   node scripts/shoot-highlights.cjs --out shots/highlights [--base http://localhost:3100]
 *
 * Each moment = [file, viewport, selector to scroll to, offset px, sun?, clip?].
 * A clip moment is cut from the full page, `offset` px around the element's
 * top, so fixed chrome (the header is transparent over the hero) stays out.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const base = opt('base', 'http://localhost:3100');
const out = opt('out', 'shots/highlights');

const desktop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

const moments = [
  ['01-hero', desktop, null, 0, false],
  ['02-hero-parcels', desktop, '#hero [role="img"]', -24, false, true],
  ['03-palette', desktop, '#palette', 0, false],
  ['04-imagery', desktop, '#imagery h3', -150, false],
  ['05-type', desktop, '#type', 320, false],
  ['06-motion', desktop, '#motion', 520, false],
  ['07-components-buttons', desktop, '#components h3', -140, false],
  ['08-components-cards', desktop, '#components .card', -200, false],
  ['09-stance', desktop, '#stance', 120, false],
  ['10-sun-mode', desktop, '#components .card', -200, true],
  ['11-phone-hero', phone, null, 0, false],
  ['12-phone-table', phone, '#components .table-wrap', -160, false],
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, viewport, selector, offset, sun, clip] of moments) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'he-IL' });
    if (sun) await ctx.addInitScript(() => localStorage.setItem('hm:sun', '1'));
    const page = await ctx.newPage();
    await page.goto(base + '/style-tile', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2800); // let the opening sequence finish
    const file = path.join(out, `${name}.jpg`);
    if (clip) {
      const top = await page.evaluate(
        (sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY,
        selector,
      );
      await page.screenshot({
        path: file,
        type: 'jpeg',
        quality: 86,
        animations: 'disabled',
        fullPage: true,
        clip: { x: 0, y: Math.max(0, top + offset), width: viewport.width, height: viewport.height },
      });
      console.log(file);
      await ctx.close();
      continue;
    }
    if (selector) {
      await page.evaluate(
        ([sel, off]) => {
          const el = document.querySelector(sel);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: 'instant' });
        },
        [selector, offset],
      );
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: file, type: 'jpeg', quality: 86, animations: 'disabled' });
    console.log(file);
    await ctx.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
