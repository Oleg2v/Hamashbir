#!/usr/bin/env node
/**
 * RTL + Hebrew typography guard for app code (docs/design-system.md).
 *
 *   node scripts/check-rtl.mjs            # fail on any problem
 *
 * 1. Physical direction: Tailwind ml/mr/pl/pr/left/right/text-left/right,
 *    rounded/border-l/r, float, translate-x-*, origin-left/right, [left:…];
 *    CSS margin/padding/border-left/right, left:/right:, text-align
 *    left/right, transform-origin left/right; JS style keys marginLeft,
 *    paddingRight, left:, right:, textAlign 'left'; translateX(...) without
 *    var(--dir-sign).
 * 2. Hebrew typesetting: a breaking space between </Num> and a Hebrew unit,
 *    a breaking space before an en dash, ≥/≤ glyphs in Hebrew text, gershayim
 *    used as quotation marks, em dashes in copy.
 *
 * Exempt: SVG geometry attributes, comments, generated tokens.css, and any
 * line carrying `rtl-ok` (with a reason) for an intentional physical value.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const exts = new Set(['.tsx', '.ts', '.css']);
const skip = new Set(['node_modules', '.next', 'out', 'tokens.css']);

const tw = [
  /(?<![\w-])-?(?:ml|mr|pl|pr)-[\w[(.-]+/,
  /(?<![\w-])-?(?:left|right)-[\w[(.-]+/,
  /(?<![\w-])text-(?:left|right)(?![\w-])/,
  /(?<![\w-])(?:rounded|border)-(?:l|r|tl|tr|bl|br)(?:-[\w[(.-]+)?(?![\w-])/,
  /(?<![\w-])float-(?:left|right)(?![\w-])/,
  /(?<![\w-])scroll-(?:m|p)(?:l|r)-[\w[(.-]+/,
  /(?<![\w-])-?translate-x-[\w[(.-]+/,
  /(?<![\w-])origin-(?:left|right|top-left|top-right|bottom-left|bottom-right)(?![\w-])/,
  /\[(?:left|right|margin-left|margin-right|padding-left|padding-right):/,
];

const css = [
  /(?<![\w-])(?:margin|padding|border)-(?:left|right)\s*:/,
  /(?<![\w-.])(?:left|right)\s*:\s*[^;{]+;/,
  /text-align\s*:\s*(?:left|right)/,
  /float\s*:\s*(?:left|right)/,
  /border-(?:top|bottom)-(?:left|right)-radius/,
  /transform-origin\s*:\s*(?:left|right)/,
];

const js = [
  /\b(?:marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight)\s*:/,
  /[{,]\s*(?:left|right)\s*:\s*['"`\d]/,
  /textAlign\s*:\s*['"](?:left|right)['"]/,
  /transformOrigin\s*:\s*['"](?:left|right)/,
];

const translateX = /translateX\((?![^)]*--dir-sign)/;

const typo = [
  { re: /<\/Num>[ \t\n](?=[֐-׿])/, msg: 'breaking space between </Num> and a Hebrew unit (use \\u00a0 or <NumText>)' },
  { re: /(?<=[֐-׿\w)»”]) – /, msg: 'breaking space before an en dash (use \\u00a0– )' },
  { re: /[≥≤](?=[^<]*[֐-׿])|(?<=[֐-׿][^>]*)[≥≤]/, msg: '≥/≤ in Hebrew text (mirrored by bidi; write „לפחות”/„לכל היותר”)' },
  { re: /(?<=[\s(>{'"])״[֐-׿][^״\n]{0,40}״(?=[\s.,:;)<'"])/, msg: 'gershayim used as quotation marks (use „…”)' },
  { re: /[֐-׿][^'"`<>]*—|—[^'"`<>]*[֐-׿]/, msg: 'em dash in Hebrew copy (use a spaced en dash)' },
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
const report = (file, i, what) => {
  problems++;
  console.log(`${relative(root, file)}:${i + 1}  ${what}`);
};

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const isCss = file.endsWith('.css');
  let inBlock = false;
  lines.forEach((raw, i) => {
    if (raw.includes('rtl-ok')) return;
    // strip comments (block comments may span lines)
    let line = raw;
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end === -1) return;
      line = line.slice(end + 2);
      inBlock = false;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    const open = line.indexOf('/*');
    if (open !== -1) {
      line = line.slice(0, open);
      inBlock = true;
    }
    line = line.replace(/(^|[^:'"`])\/\/.*$/, '$1');
    if (!line.trim()) return;
    // JSX/TSX comment lines {/* … */}
    if (/^\s*\{\/\*.*\*\/\}\s*$/.test(raw)) return;
    // SVG geometry (x=, cx=, textAnchor…) is coordinate space, not layout.
    const svgGeometry =
      /\b(?:x|y|cx|cy|x1|x2|y1|y2|dx|dy|textAnchor|text-anchor)=/.test(line) && !/className=/.test(line);

    const rules = isCss ? css : [...tw, ...css, ...js];
    if (!svgGeometry) {
      for (const re of rules) {
        const m = line.match(re);
        if (!m) continue;
        if (/inset-inline|insetInline|margin-inline|marginInline|padding-inline|paddingInline/.test(m[0])) continue;
        report(file, i, `physical direction: ${m[0].trim()}`);
        break;
      }
      if (translateX.test(line)) report(file, i, 'translateX() without var(--dir-sign)');
    }
    if (!isCss) {
      for (const t of typo) {
        if (t.re.test(line)) {
          report(file, i, t.msg);
          break;
        }
      }
    }
  });
}

if (problems) {
  console.log(`\n✗ ${problems} problem(s). See docs/design-system.md › RTL and Hebrew.`);
  process.exit(1);
}
console.log(`✓ RTL + Hebrew check: ${files.length} files clean.`);
