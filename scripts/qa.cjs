#!/usr/bin/env node
/**
 * QA sweep of the built site: page-level horizontal overflow, axe-core
 * (WCAG A/AA rules) and console errors, for every page at phone → desktop
 * widths, in normal and sun mode. Exits non-zero when anything is off.
 *
 *   npm run build && npm run preview   # the export on :3100
 *   npm run qa [-- http://127.0.0.1:3100]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');

const base = process.argv[2] || 'http://127.0.0.1:3100';
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

(async () => {
  const b = await chromium.launch();
  const rows = [];
  for (const path of ['/style-tile', '/accessibility']) {
    for (const sun of [false, true]) {
      for (const w of [320, 360, 390, 768, 1024, 1440]) {
        const ctx = await b.newContext({ viewport: { width: w, height: 900 }, locale: 'he-IL' });
        if (sun) await ctx.addInitScript(() => localStorage.setItem('hm:sun', '1'));
        const p = await ctx.newPage();
        const errors = [];
        p.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 140)));
        p.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 140)));
        await p.goto(base + path, { waitUntil: 'networkidle' });
        await p.waitForTimeout(600);
        // walk the page so observers and lazy content fire
        await p.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
        });
        await p.waitForTimeout(400);
        const sw = await p.evaluate(() => document.documentElement.scrollWidth);
        let axe = '-';
        if (w === 390 || w === 1440) {
          await p.addScriptTag({ content: axeSrc });
          const res = await p.evaluate(async () => {
            const r = await window.axe.run(document, { resultTypes: ['violations'] });
            return r.violations.map((v) => `${v.id}×${v.nodes.length}`);
          });
          axe = res.length ? res.join(',') : '0';
        }
        rows.push({
          path,
          mode: sun ? 'sun' : 'normal',
          w,
          overflow: sw - w,
          axe,
          errors: errors.length ? errors.join(' | ') : '',
        });
        await ctx.close();
      }
    }
  }
  await b.close();
  for (const r of rows)
    console.log(
      `${r.path.padEnd(14)} ${r.mode.padEnd(6)} ${String(r.w).padStart(4)}  overflow ${String(r.overflow).padStart(3)}  axe ${r.axe}${r.errors ? '  ERR ' + r.errors : ''}`,
    );
  const bad = rows.filter((r) => r.overflow > 0 || (r.axe !== '-' && r.axe !== '0') || r.errors);
  console.log(bad.length ? `\n✗ ${bad.length} row(s) need attention` : '\n✓ clean');
  process.exit(bad.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
