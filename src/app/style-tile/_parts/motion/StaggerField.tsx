'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { bezierCss, durations, easings, stagger, staggerDelay } from '@/design/tokens';
import { Block } from '../Section';
import { PlayButton, ReducedNote } from './controls';
import { cancelAll, prefersReducedMotion } from './hooks';
import s from './motion.module.css';

const ROW_CHOICES = ['8', '16', '24'] as const;
type RowChoice = (typeof ROW_CHOICES)[number];

/** 24 plants a row at the base density; a denser planting adds plants as well as rows. */
const BASE_ROWS = 8;
const BASE_COLS = 24;

/** Three vigour classes (share of a full-size plant): organic, never identical. */
const VIGOUR = [0.76, 0.88, 1] as const;

/** Which rows carry a delay label, so labels never collide as rows get denser. */
const labelEvery: Record<RowChoice, number> = { '8': 1, '16': 4, '24': 6 };

const growth = bezierCss(easings.growth.bezier);
const outQuint = bezierCss(easings['out-quint'].bezier);

/** Seeded PRNG (mulberry32), so the server and the browser plant the same field. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Each row is one SVG strip with a viewBox of one unit per plant. A plant is
 * a zero-length, round-capped subpath (`M x .5h0` draws one dot), and a row's
 * plants are grouped into one path per vigour class. So a row costs three
 * elements and three animations however dense the planting: 72 at the
 * densest setting instead of 1,728 spans.
 */
const plots = Object.fromEntries(
  ROW_CHOICES.map((choice) => {
    const rows = Number(choice);
    const cols = (BASE_COLS * rows) / BASE_ROWS;
    const rnd = prng(0x5eed + rows);
    const field = Array.from({ length: rows }, () => {
      const classes = VIGOUR.map(() => [] as number[]);
      for (let c = 0; c < cols; c++) classes[Math.floor(rnd() * VIGOUR.length)].push(c);
      return classes.map((cs) => cs.map((c, i) => (i === 0 ? `M${c + 0.5} .5h0` : `m${c - cs[i - 1]} 0h0`)).join(''));
    });
    return [choice, { rows, cols, field }];
  }),
) as Record<RowChoice, { rows: number; cols: number; field: string[][] }>;

/** The effective step for n rows, read back from the token function itself. */
const stepFor = (n: number) => staggerDelay(n - 1, n) / Math.max(1, n - 1);
const fmtMs = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * צמיחה שורה אחר שורה – a field whose rows grow one after another with
 * staggerDelay(). The plot keeps its size: more rows means a denser planting
 * and a shorter step, never a longer wait (the 480ms cap). Drawn grown; play
 * animates each row from bare ground toward that final state.
 */
export function StaggerField({ title, note, className }: { title: string; note?: ReactNode; className?: string }) {
  const [choice, setChoice] = useState<RowChoice>('8');
  const field = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  const pending = useRef(false);

  const play = useCallback(() => {
    cancelAll(anims.current);
    const el = field.current;
    if (!el || prefersReducedMotion()) return;
    const n = Number(el.dataset.rows);
    el.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
      const delay = staggerDelay(Number(row.dataset.row), n);
      // implicit end keyframe: each path grows toward its own CSS width
      row.querySelectorAll<SVGPathElement>('[data-plants]').forEach((path) => {
        anims.current.push(
          path.animate([{ strokeWidth: '0px', offset: 0 }], {
            duration: durations.grow.ms,
            delay,
            easing: growth,
            fill: 'backwards',
          }),
        );
      });
      const label = row.querySelector<HTMLElement>('[data-label]');
      if (label) {
        anims.current.push(
          label.animate([{ opacity: 0.2, offset: 0 }], {
            duration: durations.fast.ms,
            delay,
            easing: outQuint,
            fill: 'backwards',
          }),
        );
      }
    });
  }, []);

  // a new density replants the field once its rows are in the DOM
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    play();
  }, [choice, play]);

  useEffect(() => {
    const list = anims.current;
    return () => cancelAll(list);
  }, []);

  const { rows, cols, field: plot } = plots[choice];
  const step = stepFor(rows);
  const last = staggerDelay(rows - 1, rows);
  const every = labelEvery[choice];

  return (
    <Block className={className} title={title} note={note} action={<PlayButton onClick={play} context={title} />}>
      <figure className="grid gap-4">
        <div className="rounded-lg border-(length:--bw) border-line bg-sunken p-4 sm:p-6">
          {/* the density is a knob on the specimen; the legend names the radio group */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-caption font-bold" aria-hidden="true">
                שורות
              </span>
              <SegmentedControl
                label="שורות"
                hideLabel
                options={ROW_CHOICES.map((v) => ({ value: v, label: <Num>{v}</Num> }))}
                value={choice}
                onChange={(v) => {
                  pending.current = true;
                  setChoice(v);
                }}
              />
            </div>
            <span className="text-micro text-ink-3" aria-hidden="true">
              <Num>{cols}</Num>&nbsp;שתילים בשורה
            </span>
          </div>
          <div
            ref={field}
            className={s.field}
            data-rows={rows}
            style={{ '--rows': rows, '--cols': cols } as CSSProperties}
            role="img"
            aria-label={`שדה של ${rows} שורות ו־${cols} שתילים בכל שורה. כל שורה צומחת ${fmtMs(step)} אלפיות שנייה אחרי הקודמת; השורה האחרונה מתחילה אחרי ${last} אלפיות שנייה.`}
          >
            {plot.map((paths, r) => {
              const showLabel = r % every === 0 || r === rows - 1;
              return (
                <div key={`${rows}-${r}`} className={s.fieldRow} data-row={r}>
                  <span className={`${s.rowLabel} text-micro leading-none`}>
                    {showLabel ? (
                      <Num data-label="">
                        +{staggerDelay(r, rows)}
                        {r === rows - 1 ? 'ms' : null}
                      </Num>
                    ) : null}
                  </span>
                  <svg
                    className={s.strip}
                    viewBox={`0 0 ${cols} 1`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    {paths.map((d, k) => (
                      <path key={k} d={d} data-plants="" style={{ '--k': VIGOUR[k] } as CSSProperties} />
                    ))}
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
        <figcaption className="grid gap-2 text-caption text-ink-2">
          <p>
            <Num className="font-medium text-ink">{rows}</Num>&nbsp;שורות · צעד&nbsp;
            <Num className="font-medium text-ink">{fmtMs(step)}ms</Num> · השורה האחרונה ב־
            <Num className="font-medium text-ink">{last}ms</Num>
          </p>
          <p className="max-w-[60ch]">
            <Num>{stagger.stepMs}ms</Num>&nbsp;בין שורה לשורה, ולכל היותר <Num>{stagger.maxTotalMs}ms</Num>&nbsp;עד
            השורה האחרונה: בשדה צפוף הצעד מתקצר, וההמתנה לא מתארכת. <ReducedNote />
          </p>
          <p className="text-micro text-ink-3">
            <code>
              <Num>
                {/* each half moves whole (inline-block); it wraps inside only at 200% text */}
                <span className="inline-block">staggerDelay(i, n) =</span>{' '}
                <span className="inline-block">
                  i × min({stagger.stepMs}, {stagger.maxTotalMs} / (n − 1))
                </span>
              </Num>
            </code>
          </p>
        </figcaption>
      </figure>
    </Block>
  );
}
