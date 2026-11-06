'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Num } from '@/components/ui/Num';
import { bezierCss, durations, easings, stagger, staggerDelay } from '@/design/tokens';
import { PlayButton, ReducedNote, ToggleChip } from './controls';
import { cancelAll, prefersReducedMotion } from './hooks';
import s from './motion.module.css';

const ROW_CHOICES = [8, 16, 24] as const;
type Rows = (typeof ROW_CHOICES)[number];

/** 24 plants a row at the base density; denser plantings keep rows wider apart than plants. */
const BASE_COLS = 24;
const colsFor = (rows: Rows) => (BASE_COLS * rows) / ROW_CHOICES[0];

/** Which rows carry a delay label, so labels never collide as rows get denser. */
const labelEvery: Record<Rows, number> = { 8: 1, 16: 4, 24: 6 };

const growth = bezierCss(easings.growth.bezier);
const outQuint = bezierCss(easings['out-quint'].bezier);

/** Seeded vigour per plant (0.72–1): organic sizes, identical on server and client. */
const vigour = (() => {
  let a = 0x5eed;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const max = ROW_CHOICES[ROW_CHOICES.length - 1];
  return Array.from({ length: max * colsFor(max) }, () => Number((0.72 + rnd() * 0.28).toFixed(3)));
})();

/** The effective step for n rows, read back from the token function itself. */
const stepFor = (n: number) => staggerDelay(n - 1, n) / Math.max(1, n - 1);
const fmtMs = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * צמיחה שורה אחר שורה – a field that sprouts row by row with staggerDelay().
 * The plot keeps its size: more rows means denser planting and a shorter
 * step, never a longer wait (the 480ms cap).
 */
export function StaggerField() {
  const [rows, setRows] = useState<Rows>(8);
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
      row.querySelectorAll<HTMLElement>('[data-plant]').forEach((plant) => {
        anims.current.push(
          plant.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
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
          label.animate([{ opacity: 0.2 }, { opacity: 1 }], {
            duration: durations.fast.ms,
            delay,
            easing: outQuint,
            fill: 'backwards',
          }),
        );
      }
    });
  }, []);

  // a new density replants the field once the new rows are in the DOM
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    play();
  }, [rows, play]);

  useEffect(() => {
    const list = anims.current;
    return () => cancelAll(list);
  }, []);

  const step = stepFor(rows);
  const last = staggerDelay(rows - 1, rows);
  const every = labelEvery[rows];
  const cols = colsFor(rows);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <PlayButton onClick={play} context="צמיחה שורה אחר שורה" />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="motion-rows-label">
          <span id="motion-rows-label" className="me-1 text-caption font-semibold">
            שורות
          </span>
          {ROW_CHOICES.map((n) => (
            <ToggleChip
              key={n}
              pressed={rows === n}
              onClick={() => {
                pending.current = n !== rows;
                setRows(n);
                if (n === rows) play();
              }}
            >
              <Num>{n}</Num>
            </ToggleChip>
          ))}
        </div>
      </div>

      <figure className="grid gap-4">
        <div className="rounded-lg border border-line bg-sunken p-4 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between gap-4 text-micro text-ink-3" aria-hidden="true">
            <Num>ms</Num>
            <span>
              <Num>{cols}</Num> שתילים בשורה
            </span>
          </div>
          <div
            ref={field}
            className={s.field}
            data-rows={rows}
            style={{ '--rows': rows, '--cols': cols } as CSSProperties}
            role="img"
            aria-label={`שדה של ${rows} שורות ו־${cols} שתילים בכל שורה. כל שורה נובטת ${fmtMs(step)} אלפיות שנייה אחרי הקודמת; השורה האחרונה מתחילה אחרי ${last} אלפיות שנייה.`}
          >
            {Array.from({ length: rows }, (_, r) => {
              const showLabel = r % every === 0 || r === rows - 1;
              return (
                <div key={`${rows}-${r}`} className={s.fieldRow} data-row={r}>
                  <Num className={`${s.rowLabel} text-micro`} data-label={showLabel ? '' : undefined}>
                    {showLabel ? `+${staggerDelay(r, rows)}` : ''}
                  </Num>
                  {Array.from({ length: cols }, (_, c) => (
                    <span
                      key={c}
                      className={s.plant}
                      data-plant=""
                      style={{ '--k': vigour[(r * cols + c) % vigour.length] } as CSSProperties}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <figcaption className="grid gap-2 text-caption text-ink-2">
          <p>
            <Num className="font-medium text-ink">{rows}</Num> שורות · צעד{' '}
            <Num className="font-medium text-ink">{fmtMs(step)}ms</Num> · השורה האחרונה ב־
            <Num className="font-medium text-ink">{last}ms</Num>
          </p>
          <p className="max-w-[60ch]">
            <Num>{stagger.stepMs}ms</Num> בין שורה לשורה, ולעולם לא יותר מ־<Num>{stagger.maxTotalMs}ms</Num> בסך
            הכול: בשדה צפוף הצעד מתקצר, והשורה האחרונה מגיעה באותו זמן. <ReducedNote />
          </p>
          <code className="flex flex-wrap justify-end justify-self-start gap-x-2 text-micro text-ink-3" dir="ltr">
            <Num className="whitespace-nowrap">staggerDelay(i, n) =</Num>
            <Num className="whitespace-nowrap">
              i × min({stagger.stepMs}, {stagger.maxTotalMs} / (n − 1))
            </Num>
          </code>
        </figcaption>
      </figure>
    </div>
  );
}
