#!/usr/bin/env node
/**
 * RTL guard: fails on physical (left/right) layout in app code.
 * Logical properties only — see docs/design-system.md.
 *
 *   node scripts/check-rtl.mjs [--fix-hint]
 *
 * Exempt: SVG geometry attributes, comments, and lines carrying
 * `rtl-ok` (with a reason) for the rare intentional physical value.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const exts = new Set(['.tsx', '.ts', '.css']);
const skip = new Set(['node_modules', '.next', 'out', 'tokens.css']);

/** Tailwind utilities with a physical direction. */
const tw = [
  /(?<![\w-])-?(?:ml|mr|pl|pr)-[\w[(.-]+/,
  /(?<![\w-])-?(?:left|right)-[\w[(.-]+/,
  /(?<![\w-])text-(?:left|right)(?![\w-])/,
  /(?<![\w-])(?:rounded|border)-(?:l|r|tl|tr|bl|br)(?:-[\w[(.-]+)?(?![\w-])/,
  /(?<![\w-])float-(?:left|right)(?![\w-])/,
  /(?<![\w-])(?:scroll-)?(?:m|p)(?:l|r)-[\w[(.-]+/,
];

/** CSS declarations with a physical direction. */
const css = [
  /(?<![\w-])(?:margin|padding|border)-(?:left|right)\s*:/,
  /(?<![\w-])(?:left|right)\s*:\s*[^;]+;/,
  /text-align\s*:\s*(?:left|right)/,
  /float\s*:\s*(?:left|right)/,
  /border-(?:top|bottom)-(?:left|right)-radius/,
];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.has(p.slice(p.lastIndexOf('.')))) files.push(p);
  }
})(join(root, 'src'));

let problems = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const isCss = file.endsWith('.css');
  lines.forEach((raw, i) => {
    if (raw.includes('rtl-ok')) return;
    const line = raw.replace(/\/\*.*?\*\/|\/\/.*$/g, '');
    if (!line.trim()) return;
    // SVG geometry (x=, cx=, textAnchor…) is coordinate space, not layout.
    if (/\b(?:x|y|cx|cy|x1|x2|y1|y2|dx|dy|textAnchor|text-anchor)=/.test(line) && !/className=/.test(line)) return;
    const rules = isCss ? css : [...tw, ...css];
    for (const re of rules) {
      const m = line.match(re);
      if (!m) continue;
      // style objects: allow insetInlineStart etc. (already logical)
      if (/inset-inline|insetInline|margin-inline|marginInline|padding-inline|paddingInline/.test(m[0])) continue;
      problems++;
      console.log(`${relative(root, file)}:${i + 1}  ${m[0].trim()}`);
      break;
    }
  });
}

if (problems) {
  console.log(`\n✗ ${problems} physical-direction usage(s). Use logical properties (ms/me/ps/pe, start/end, text-start/end, *-inline-*).`);
  process.exit(1);
}
console.log(`✓ RTL check: ${files.length} files, logical properties only.`);
