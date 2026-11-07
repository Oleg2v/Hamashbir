'use client';

import { useEffect, useState } from 'react';
import { Num } from '@/components/ui/Num';
import { layout, typeViewport } from '@/design/tokens';
import { cn } from '@/lib/cn';

const span = typeViewport.max - typeViewport.min;
const at = (w: number) => Math.min(1, Math.max(0, (w - typeViewport.min) / span));

/** Breakpoints from the layout grid that fall inside the fluid range. */
const marks = layout.grid.filter((g) => g.from > typeViewport.min && g.from < typeViewport.max);

/* Rules drawn on the ruler follow the line weight: 1px, 2px in sun mode. */
const rule = '[block-size:calc(var(--bw)*2)]';
const post = '[inline-size:calc(var(--bw)*2)]';
/* centre a label on its tick: half its width back toward inline-start, in any direction */
const centred = '[translate:calc(-50%*var(--dir-sign))_0]';

/**
 * The fluid range as a ruler: 360px at inline-start (low values start the
 * line, like the season), 1440px at inline-end. A marker shows where this
 * window sits on it – every "עכשיו" value in the scale is read from the same
 * clamp() the marker walks along.
 */
export function ViewportGauge({ minLabel, maxLabel }: { minLabel: React.ReactNode; maxLabel: React.ReactNode }) {
  const [w, setW] = useState<number | null>(null);

  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const t = w == null ? null : at(w);
  const pct = t == null ? 0 : t * 100;
  const where =
    w == null
      ? null
      : w < typeViewport.min
        ? 'מתחת לטווח\u00A0– המינימום נשמר'
        : w > typeViewport.max
          ? 'מעל הטווח\u00A0– המקסימום נשמר'
          : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      {/* the two ends share a line while they fit; at large text the max end wraps under, still at inline-end */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="grid gap-1">
          <Num className="text-title font-medium leading-none">{typeViewport.min}px</Num>
          {/* ratio on one line, its musical name on the next */}
          <span className="grid text-caption text-ink-2">{minLabel}</span>
        </div>
        <div className="ms-auto grid justify-items-end gap-1 text-end">
          <Num className="text-title font-medium leading-none">{typeViewport.max}px</Num>
          <span className="grid justify-items-end text-caption text-ink-2">{maxLabel}</span>
        </div>
      </div>

      {/* a size container in label em: where the breakpoint labels would meet (200% text on a phone),
          every second one drops to a line of its own under its tick */}
      <div aria-hidden="true" className="@container text-micro">
        <div className="relative h-4">
          {/* track */}
          <span className={cn('absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-line-strong', rule)} />
          {/* the part of the range this window has grown through */}
          <span
            className={cn(
              'absolute start-0 top-1/2 -translate-y-1/2 rounded-full bg-ink transition-[inline-size] duration-(--dur-slow) ease-out-quint',
              rule,
            )}
            style={{ inlineSize: `${pct}%` }}
          />
          {/* ends and layout breakpoints (grid tokens) */}
          <span className={cn('absolute start-0 top-0 h-4 bg-ink', post)} />
          <span className={cn('absolute end-0 top-0 h-4 bg-ink', post)} />
          {marks.map((m) => (
            <span
              key={m.from}
              className="absolute top-1 h-2 w-(--bw) bg-ink-3"
              style={{ insetInlineStart: `${at(m.from) * 100}%` }}
            />
          ))}
          {/* now */}
          <span
            className={cn(
              'absolute top-0 size-4 rounded-full border-[length:calc(var(--bw)*2)] border-ink bg-bud transition-[inset-inline-start,opacity] duration-(--dur-slow) ease-out-quint',
              t == null && 'opacity-0',
            )}
            style={{ insetInlineStart: `calc(${pct}% - 0.5rem)` }}
          />
        </div>
        <div className="relative mt-2 h-5 @max-[13em]:h-[2.5em]">
          {marks.map((m, i) => (
            // the positioned wrapper keeps the page direction; the <bdi> inside is LTR
            <span
              key={m.from}
              className={cn(
                'absolute top-0 text-micro leading-none text-ink-3',
                centred,
                i % 2 === 1 && '@max-[13em]:top-[1.5em]',
              )}
              style={{ insetInlineStart: `${at(m.from) * 100}%` }}
            >
              <Num>{m.from}</Num>
            </span>
          ))}
        </div>
      </div>

      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
        <span className="font-bold">
          החלון שלך עכשיו: <Num>{w == null ? '‒‒‒‒' : w}px</Num>
        </span>
        <span className="text-ink-2">
          {w == null ? (
            'נמדד בדפדפן'
          ) : where ? (
            where
          ) : (
            <>
              <Num>{Math.round(pct)}%</Num>&nbsp;מהדרך בין הקצוות
            </>
          )}
        </span>
      </p>
    </div>
  );
}
