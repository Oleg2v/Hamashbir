#!/usr/bin/env node
/**
 * Section tiles for design review: a full-page capture cut into per-section
 * tiles (≤ maxH px tall) so every tile is legible when viewed at 1:1.
 *
 *   node scripts/shoot-sections.cjs --out shots/review [--path /style-tile]
 *     [--sizes 1440x900,390x844] [--sun] [--reduced] [--scale 1] [--maxH 1400]
 *
 * Writes <out>/<size>[-sun][-rm]/<nn>-<section>-<k>.png and index.json.
 * Requires python3 + Pillow for cropping (present in this environment).
 */
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  if (i === -1) return d;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};

const base = opt('base', 'http://localhost:3000');
const route = opt('path', '/style-tile');
const out = opt('out', 'shots/review');
const sizes = String(opt('sizes', '1440x900,390x844')).split(',').map((s) => s.split('x').map(Number));
const sun = !!opt('sun', false);
const reduced = !!opt('reduced', false);
const scale = Number(opt('scale', 1));
const maxH = Number(opt('maxH', 1400));

(async () => {
  const browser = await chromium.launch();
  const index = [];
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: scale,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
      locale: 'he-IL',
    });
    if (sun) await ctx.addInitScript(() => localStorage.setItem('hm:sun', '1'));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // let entrance animations settle, and trigger in-view effects
    await page.evaluate(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2600);
    await page.addStyleTag({ content: '.skip-link,.demo-badge,header.fixed{visibility:hidden!important}' });

    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('main > section, body > footer, main > * > section')]
        .filter((el, i, all) => all.indexOf(el) === i)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { id: el.id || el.tagName.toLowerCase(), top: Math.round(r.top + scrollY), height: Math.round(r.height) };
        }),
    );
    const tag = `${w}x${h}${sun ? '-sun' : ''}${reduced ? '-rm' : ''}`;
    const dir = path.join(out, tag);
    fs.mkdirSync(dir, { recursive: true });
    const full = path.join(dir, '_full.png');
    await page.screenshot({ path: full, fullPage: true });

    const jobs = [];
    boxes.forEach((b, n) => {
      const parts = Math.max(1, Math.ceil(b.height / maxH));
      for (let k = 0; k < parts; k++) {
        const y0 = b.top + k * maxH;
        const y1 = Math.min(b.top + b.height, y0 + maxH);
        const file = path.join(dir, `${String(n).padStart(2, '0')}-${b.id}-${k + 1}.png`);
        jobs.push({ file, y0: y0 * scale, y1: y1 * scale });
        index.push({ size: tag, section: b.id, part: k + 1, of: parts, file });
      }
    });
    execFileSync('python3', [
      '-c',
      `import json,sys
from PIL import Image
im=Image.open(sys.argv[1]); jobs=json.loads(sys.argv[2])
for j in jobs:
    im.crop((0,int(j['y0']),im.width,int(j['y1']))).save(j['file'])`,
      full,
      JSON.stringify(jobs),
    ]);
    fs.unlinkSync(full);
    if (errors.length) console.error(`[${tag}] console/page errors:\n  ` + errors.join('\n  '));
    console.log(`${tag}: ${jobs.length} tiles → ${dir}`);
    await ctx.close();
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
