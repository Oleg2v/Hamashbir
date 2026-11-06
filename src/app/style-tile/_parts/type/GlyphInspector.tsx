'use client';

import { useState } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';
import { CodePoint } from './bits';
import styles from './type.module.css';

/**
 * Suez One's vertical metrics in em, measured from the font's own outlines
 * (canvas measureText → actualBoundingBox, at 1000px):
 * flat-roofed letters reach 0.594em, ל rises to 0.766em, the descenders
 * (ק ך ן ף ץ) drop to −0.156em, and י floats 0.156em above the baseline.
 */
const METRICS = { asc: 0.766, top: 0.594, desc: 0.156 } as const;

/* SVG drawing space. The glyph is centred a little toward inline-end, so the
   line labels at inline-start (right) never collide with the word. */
const W = 720;
const H = 300;
const FS = 250;
const BASE = 230;
const CX = 316;

const Y = {
  asc: BASE - METRICS.asc * FS,
  top: BASE - METRICS.top * FS,
  base: BASE,
  desc: BASE + METRICS.desc * FS,
} as const;

type LineKey = keyof typeof Y;

const lines: Array<{ key: LineKey; label: string; em: string; dash?: boolean; strong?: boolean }> = [
  { key: 'asc', label: 'עולה', em: `${METRICS.asc}em`, dash: true },
  { key: 'top', label: 'קו עליון', em: `${METRICS.top}em` },
  { key: 'base', label: 'קו בסיס', em: '0', strong: true },
  { key: 'desc', label: 'יורדת', em: `−${METRICS.desc}em`, dash: true },
];

type Zone = 'body' | 'asc' | 'desc' | 'final' | 'closed' | 'hang' | 'tail';

const zoneCopy: Record<Zone, string> = {
  body: 'בגוף האות: תלויה מהקו העליון ויושבת על קו הבסיס.',
  asc: 'העולה היחידה באלף־בית: מתנשאת מעל הקו העליון.',
  desc: 'האות היחידה שאינה סופית ויורדת מתחת לקו הבסיס.',
  final: 'אות סופית: יורדת מתחת לקו הבסיס.',
  closed: 'הסופית היחידה שלא יורדת: סגורה, כולה בגוף האות.',
  hang: 'תלויה מהקו העליון ולא נוגעת בקו הבסיס.',
  tail: 'זנב קצר יורד מעט מתחת לקו הבסיס.',
};

const emphasis: Record<Zone | 'word', LineKey[]> = {
  word: ['asc', 'desc'],
  body: ['top', 'base'],
  asc: ['asc'],
  desc: ['desc'],
  final: ['desc'],
  closed: ['top', 'base'],
  hang: ['top'],
  tail: ['base', 'desc'],
};

export const letters: Array<{ ch: string; name: string; zone: Zone; final?: boolean }> = [
  { ch: 'א', name: 'אלף', zone: 'body' },
  { ch: 'ב', name: 'בית', zone: 'body' },
  { ch: 'ג', name: 'גימל', zone: 'body' },
  { ch: 'ד', name: 'דלת', zone: 'body' },
  { ch: 'ה', name: 'הא', zone: 'body' },
  { ch: 'ו', name: 'וו', zone: 'body' },
  { ch: 'ז', name: 'זין', zone: 'body' },
  { ch: 'ח', name: 'חית', zone: 'body' },
  { ch: 'ט', name: 'טית', zone: 'body' },
  { ch: 'י', name: 'יוד', zone: 'hang' },
  { ch: 'כ', name: 'כף', zone: 'body' },
  { ch: 'ך', name: 'כף סופית', zone: 'final', final: true },
  { ch: 'ל', name: 'למד', zone: 'asc' },
  { ch: 'מ', name: 'מם', zone: 'body' },
  { ch: 'ם', name: 'מם סופית', zone: 'closed', final: true },
  { ch: 'נ', name: 'נון', zone: 'body' },
  { ch: 'ן', name: 'נון סופית', zone: 'final', final: true },
  { ch: 'ס', name: 'סמך', zone: 'body' },
  { ch: 'ע', name: 'עין', zone: 'tail' },
  { ch: 'פ', name: 'פא', zone: 'body' },
  { ch: 'ף', name: 'פא סופית', zone: 'final', final: true },
  { ch: 'צ', name: 'צדי', zone: 'body' },
  { ch: 'ץ', name: 'צדי סופית', zone: 'final', final: true },
  { ch: 'ק', name: 'קוף', zone: 'desc' },
  { ch: 'ר', name: 'ריש', zone: 'body' },
  { ch: 'ש', name: 'שין', zone: 'body' },
  { ch: 'ת', name: 'תו', zone: 'body' },
];

const WORD = 'word';

/**
 * Letter anatomy, live. Hebrew has no capitals and no x-height: letters hang
 * from a top line, one letter ascends and five descend. Pick any of the 27
 * forms (native radios: Tab in, arrows move) and it is drawn on the measured
 * metric lines; the default is the brand word שלך, which touches all four.
 */
export function GlyphInspector() {
  const [sel, setSel] = useState<string>(WORD);
  const letter = letters.find((l) => l.ch === sel);
  const zone = letter?.zone;
  const hot = emphasis[zone ?? 'word'];

  // the name is already the caption's title; the line below it says only where the letter lives
  const caption = letter
    ? zoneCopy[letter.zone]
    : // no-break spaces keep each one-letter word with the word that follows it
      'שלוש אותיות, שלושה אזורים: ש\u00A0בגוף האות, ל\u00A0עולה מעל הקו העליון, ך\u00A0יורדת מתחת לקו הבסיס.';

  return (
    <div className="grid gap-x-(--gutter) gap-y-10 xl:grid-cols-12">
      {/* ── anatomy ── */}
      <figure className="grid content-start gap-5 xl:col-span-7">
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full overflow-visible"
            role="img"
            aria-label={`אנטומיה של ${letter ? `האות ${letter.name}` : 'המילה שלך'} על ארבעה קווי מתאר: עולה, קו עליון, קו בסיס ויורדת.`}
          >
            {/* the body zone: where every Hebrew letter lives */}
            <rect x={0} y={Y.top} width={W} height={BASE - Y.top} className="fill-tint-hover" />
            {lines.map((l) => (
              <line
                key={l.key}
                x1={0}
                x2={W}
                y1={Y[l.key]}
                y2={Y[l.key]}
                className={cn(
                  'transition-[stroke] duration-(--dur-fast)',
                  hot.includes(l.key) ? 'stroke-sprout-ink' : 'stroke-line-strong',
                )}
                strokeDasharray={l.dash ? '6 6' : undefined}
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: l.strong ? 'calc(var(--bw) * 2)' : 'var(--bw)' }}
              />
            ))}
            <g key={sel} className={styles.glyphIn}>
              <text
                x={CX}
                y={BASE}
                textAnchor="middle"
                fontSize={FS}
                className="fill-ink font-display"
                direction="rtl"
              >
                {letter ? (
                  letter.ch
                ) : (
                  <>
                    <tspan>ש</tspan>
                    <tspan className="fill-sprout-ink">ל</tspan>
                    <tspan className="fill-sprout-ink">ך</tspan>
                  </>
                )}
              </text>
            </g>
          </svg>

          {/* line labels: HTML so they stay readable at every width */}
          {lines.map((l) => {
            const on = hot.includes(l.key);
            return (
              <div
                key={l.key}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 flex -translate-y-full items-end justify-between pb-1 text-micro leading-none"
                style={{ top: `${(Y[l.key] / H) * 100}%` }}
              >
                <span className={cn(styles.lineLabel, on ? 'font-bold text-sprout-ink' : 'text-ink-2')}>{l.label}</span>
                <Num className={cn('hidden sm:inline', on ? 'text-sprout-ink' : 'text-ink-3')}>{l.em}</Num>
              </div>
            );
          })}
        </div>

        <figcaption className="grid gap-2 border-t-(length:--bw) border-line pt-4">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-lead font-bold">{letter ? letter.name : 'המילה „שלך”'}</span>
            {letter ? (
              <CodePoint ch={letter.ch} className="text-caption text-ink-2" />
            ) : (
              <span className="text-caption text-ink-2">
                <CodePoint ch="ש" /> <CodePoint ch="ל" /> <CodePoint ch="ך" />
              </span>
            )}
          </p>
          <p className="max-w-[52ch] text-body text-ink-2" aria-live="polite">
            {caption}
          </p>
        </figcaption>
      </figure>

      {/* ── the 27 forms ── */}
      <div role="radiogroup" aria-labelledby="type-glyph-legend" className="grid content-start gap-4 xl:col-span-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p id="type-glyph-legend" className="text-caption font-bold">
            האלף־בית: <Num>22</Num> אותיות ו־<Num>5</Num> סופיות
          </p>
          <label className={cn(styles.cell, 'grid-flow-col gap-3 px-4')}>
            <input
              type="radio"
              name="type-glyph"
              value={WORD}
              checked={sel === WORD}
              onChange={() => setSel(WORD)}
              className="sr-only"
              aria-label="המילה שלך"
            />
            <span aria-hidden="true" className="font-display text-h3 leading-none">
              שלך
            </span>
            <span aria-hidden="true" className={cn(styles.cellName, 'text-micro')}>
              מילה
            </span>
          </label>
        </div>

        <div className="grid grid-cols-9 gap-1">
          {letters.map((l) => (
            <label key={l.ch} className={cn(styles.cell, l.final && styles.cellFinal)}>
              <input
                type="radio"
                name="type-glyph"
                value={l.ch}
                checked={sel === l.ch}
                onChange={() => setSel(l.ch)}
                className="sr-only"
                aria-label={l.name}
              />
              <span aria-hidden="true" className={cn(styles.cellGlyph, 'font-display text-h3 leading-none')}>
                {l.ch}
              </span>
              <span aria-hidden="true" className={cn(styles.cellName, 'text-micro leading-none')}>
                {l.final ? 'סופית' : l.name}
              </span>
            </label>
          ))}
        </div>
        <p className="text-micro text-ink-2">
          בחרו אות&nbsp;– בעכבר, במגע או בחצים במקלדת. אותיות סופיות מסומנות בקו תחתון.
        </p>
      </div>
    </div>
  );
}
