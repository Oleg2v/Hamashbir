'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { PlayIcon } from '@/components/ui/icons';
import { Num } from '@/components/ui/Num';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Verdict } from '@/components/ui/Verdict';
import { durations, easings, spring, type EasingKey } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { Block } from '../Section';
import { PlayButton, ReducedNote } from './controls';
import { PLOT_H, PLOT_W, coord, curves, px, py, springInfo, type CurveSpec } from './curves';
import { cancelAll, prefersReducedMotion } from './hooks';
import s from './motion.module.css';

type Pace = 'uniform' | 'real';
type Signal = { n: number; pace: Pace };

/** Uniform pace: every curve over the season token, so shapes compare 1:1. */
const UNIFORM_MS = durations.season.ms;

/** Real pace: the duration each easing is paired with in the product. */
const realPace = Object.fromEntries([
  ...Object.entries(easings).map(([k, e]) => [k, { ms: durations[e.pace].ms, token: `--dur-${e.pace}` }]),
  ['spring', { ms: spring.durationMs, token: '--dur-spring' }],
]) as Record<EasingKey, { ms: number; token: string }>;

const msFor = (key: EasingKey, pace: Pace) => (pace === 'uniform' ? UNIFORM_MS : realPace[key].ms);

/** Hover, focus and click within one base beat are one gesture: play once. */
const GESTURE_MS = durations.base.ms;

/** Spoken shape of each curve – the plot's accessible description. */
const shape: Record<EasingKey, string> = {
  'out-quint': 'יציאה מהירה ונחיתה רכה',
  'out-expo': 'זינוק חד ונחיתה ארוכה מאוד',
  'in-out-quart': 'האצה, שיא מהירות באמצע והאטה',
  'in-quint': 'יציאה איטית מאוד והאצה עד הסוף',
  growth: 'נביטה איטית, צמיחה מהירה והתייצבות',
  spring: 'חריגה מעל היעד וחזרה מרוסנת',
};

const pct = (v: number) => Math.round(v * 100);
const overshoot = Number(((springInfo.peak.y - 1) * 100).toFixed(1));

/** The x tracer and the track dot start at inline-start: right in RTL. */
const FROM_START = 'translateX(calc(var(--dir-sign) * -100%))';

function Readout({ c, id }: { c: CurveSpec; id: string }) {
  return (
    <p id={id} className="text-caption">
      {c.mark.kind === 'p90' ? (
        <>
          <Num className="font-medium">90%</Num>&nbsp;מהדרך ב־<Num className="font-medium">{pct(c.mark.at.x)}%</Num>
          &nbsp;מהזמן
        </>
      ) : (
        <>
          שיא <Num className="font-medium">+{overshoot}%</Num>&nbsp;מעל היעד, ב־
          <Num className="font-medium">{pct(c.mark.at.x)}%</Num>&nbsp;מהזמן
        </>
      )}
    </p>
  );
}

function Plot({ c }: { c: CurveSpec }) {
  const quarters = [0.25, 0.5, 0.75];
  const label =
    c.mark.kind === 'p90'
      ? `גרף העקומה ${c.token}: ${shape[c.key]}. 90% מהדרך ב־${pct(c.mark.at.x)}% מהזמן.`
      : `גרף העקומה ${c.token}: ${shape[c.key]}. שיא של ${overshoot}% מעל היעד ב־${pct(c.mark.at.x)}% מהזמן.`;
  const m = c.mark.at;
  return (
    <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className={s.plotSvg} role="img" aria-label={label} focusable="false">
      {quarters.map((v) => (
        <line key={`t${v}`} x1={px(v)} y1="0" x2={px(v)} y2={PLOT_H} className={s.gridLine} />
      ))}
      {quarters.map((v) => (
        <line key={`p${v}`} x1="0" y1={py(v)} x2={PLOT_W} y2={py(v)} className={s.gridLine} />
      ))}
      <line x1="0" y1={py(1)} x2={PLOT_W} y2={py(1)} className={s.target} />
      <path d={`M${PLOT_W} 0V${PLOT_H}H0`} className={s.axis} />

      {c.handles ? (
        <g>
          <line
            x1={px(0)}
            y1={py(0)}
            x2={coord(px(c.handles[0].x))}
            y2={coord(py(c.handles[0].y))}
            className={s.handle}
          />
          <line
            x1={px(1)}
            y1={py(1)}
            x2={coord(px(c.handles[1].x))}
            y2={coord(py(c.handles[1].y))}
            className={s.handle}
          />
          {c.handles.map((h, i) => (
            <circle key={i} cx={coord(px(h.x))} cy={coord(py(h.y))} r="2.25" className={s.handlePoint} />
          ))}
        </g>
      ) : null}

      {c.mark.kind === 'p90' ? (
        <line x1={coord(px(m.x))} y1={coord(py(m.y))} x2={coord(px(m.x))} y2={PLOT_H} className={s.dropLine} />
      ) : (
        <g className={s.dimension}>
          <line x1={coord(px(m.x))} y1={py(1)} x2={coord(px(m.x))} y2={coord(py(m.y))} />
          <line x1={coord(px(m.x) - 3)} y1={py(1)} x2={coord(px(m.x) + 3)} y2={py(1)} />
        </g>
      )}

      <path d={c.path} className={s.curve} />
      {/* the linear() samples: one path of round-capped dots, not 41 circles */}
      {c.stops ? (
        <path d={c.stops.map((p) => `M${coord(px(p.x))} ${coord(py(p.y))}h0`).join('')} className={s.stops} />
      ) : null}
      <circle cx={coord(px(m.x))} cy={coord(py(m.y))} r="2.5" className={s.markRing} />
    </svg>
  );
}

/** An LTR code value: a shrink-wrapped box at inline-start whose wrapped lines read left to right. */
function CodeValue({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <code dir="ltr" className="inline-block max-w-full break-words text-micro" title={title}>
      <Num>{children}</Num>
    </code>
  );
}

/**
 * Keyboard focus inside the swipeable row: bring the focused card fully into view (inside the
 * row's scroll padding), or just the focused control when the card is wider than the row.
 * Chrome alone scrolls only a fully hidden target, so a half-visible card stayed half off-screen.
 */
function revealFocused(e: React.FocusEvent<HTMLUListElement>) {
  const row = e.currentTarget;
  if (row.scrollWidth <= row.clientWidth) return; // the desktop grid does not scroll
  const card = (e.target as HTMLElement).closest('li');
  if (!card) return;
  const pad = parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0;
  const box = row.getBoundingClientRect();
  const lo = box.left + pad;
  const hi = box.right - pad;
  const cr = card.getBoundingClientRect();
  const r = cr.width <= hi - lo ? cr : (e.target as HTMLElement).getBoundingClientRect();
  const dx = r.left < lo ? r.left - lo : r.right > hi ? r.right - hi : 0;
  // rtl-ok: getBoundingClientRect and scrollBy are both physical, so the offset is too
  if (dx) row.scrollBy({ left: dx, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); // rtl-ok
}

function CurveCard({ c, signal, pace }: { c: CurveSpec; signal: Signal; pace: Pace }) {
  const id = useId();
  const card = useRef<HTMLElement>(null);
  const tx = useRef<HTMLSpanElement>(null);
  const ty = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);
  const last = useRef(Number.NEGATIVE_INFINITY);

  /**
   * x moves linearly with time and y with the easing, so the tracer draws the
   * curve; the dot on the track moves with the easing alone, as UI would.
   */
  const play = useCallback(
    (ms: number, force = false) => {
      const el = card.current;
      if (!el || !tx.current || !ty.current || !rail.current) return;
      if (prefersReducedMotion()) return;
      const now = performance.now();
      if (!force && now - last.current < GESTURE_MS) return;
      last.current = now;
      cancelAll(anims.current);
      const x = tx.current.animate([{ transform: FROM_START }, { transform: 'none' }], {
        duration: ms,
        easing: 'linear',
      });
      const y = ty.current.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], {
        duration: ms,
        easing: c.css,
      });
      const d = rail.current.animate([{ transform: FROM_START }, { transform: 'none' }], {
        duration: ms,
        easing: c.css,
      });
      anims.current.push(x, y, d);
      el.dataset.playing = '';
      x.finished.then(
        () => {
          if (anims.current.includes(x)) delete el.dataset.playing;
        },
        () => {},
      );
    },
    [c.css],
  );

  useEffect(() => {
    if (signal.n > 0) play(msFor(c.key, signal.pace), true);
  }, [signal, play, c.key]);

  useEffect(() => {
    const list = anims.current;
    return () => cancelAll(list);
  }, []);

  const ms = msFor(c.key, pace);
  const real = realPace[c.key];
  const isSpring = c.key === 'spring';

  return (
    <article
      ref={card}
      className={cn('card', s.curveCard)}
      aria-labelledby={`${id}-title`}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') play(ms);
      }}
      onFocus={(e) => {
        if (e.target instanceof HTMLElement && e.target.matches(':focus-visible')) play(ms);
      }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        {/* the Hebrew name leads; the token is its code caption, never a Latin eyebrow */}
        <div className="grid min-w-0 gap-1">
          <h4 id={`${id}-title`} className="text-lead font-extrabold">
            {c.he}
          </h4>
          <code className="text-caption font-medium text-ink-2">
            <Num>{c.token}</Num>
          </code>
        </div>
        <Button
          variant="icon"
          className="shrink-0"
          onClick={() => play(ms)}
          aria-label={`הפעלת העקומה ${c.token}`}
          aria-describedby={`${id}-readout`}
        >
          <PlayIcon size={18} strokeWidth={2} />
        </Button>
      </header>

      <div className="px-5 pt-5">
        {/* a mouse convenience; the keyboard path is the play button above */}
        <div className={s.screen} onClick={() => play(ms)}>
          <span className={s.plot}>
            <Plot c={c} />
            <span className={`${s.axisLabel} text-micro leading-none`} data-pos="y1" aria-hidden="true">
              <Num>1</Num>
            </span>
            <span className={`${s.axisLabel} text-micro leading-none`} data-pos="origin" aria-hidden="true">
              <Num>0</Num>
            </span>
            <span className={`${s.axisLabel} text-micro leading-none`} data-pos="x1" aria-hidden="true">
              <Num>1</Num>
            </span>
            <span className={`${s.axisLabel} text-micro leading-none`} data-pos="time" aria-hidden="true">
              זמן ←
            </span>
            <span ref={tx} className={s.tracerX} aria-hidden="true">
              <span ref={ty} className={s.tracerY}>
                <span className={s.tracer} />
              </span>
            </span>
          </span>
          <span
            className={s.track}
            aria-hidden="true"
            style={isSpring ? ({ '--beyond': `${overshoot}%` } as CSSProperties) : undefined}
          >
            <span className={s.trackLine} />
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <span
                key={v}
                className={s.trackTick}
                data-edge={v === 0 || v === 1 ? '' : undefined}
                style={{ '--at': `${v * 100}%` } as CSSProperties}
              />
            ))}
            {isSpring ? <span className={s.trackBeyond} /> : null}
            <span ref={rail} className={s.rail}>
              <span className={s.trackDot} />
            </span>
          </span>
        </div>
      </div>

      <div className="px-5 pt-4">
        <Readout c={c} id={`${id}-readout`} />
      </div>

      <dl className="grid grid-cols-[3.5rem_minmax(0,1fr)] content-start items-baseline gap-x-4 gap-y-2 px-5 pt-4 pb-6 text-caption">
        {/* code rows stack: the value gets the card's full width and never breaks mid-expression */}
        <div className="col-span-2 grid gap-1">
          <dt className="text-micro text-ink-3">CSS</dt>
          <dd className="min-w-0">
            {isSpring ? (
              <>
                <code className="block truncate text-micro" dir="ltr" title={c.css}>
                  <Num>{c.css}</Num>
                </code>
                <details className={s.fullValue}>
                  <summary>
                    הערך המלא · <Num>{springInfo.stops}</Num>&nbsp;נקודות
                  </summary>
                  <pre dir="ltr" className="text-micro">
                    <Num>{c.css}</Num>
                  </pre>
                </details>
              </>
            ) : (
              <CodeValue>{c.css}</CodeValue>
            )}
          </dd>
        </div>
        <div className="col-span-2 mb-2 grid gap-1">
          <dt className="text-micro text-ink-3">GSAP</dt>
          <dd className="min-w-0">
            {c.gsap ? (
              <CodeValue>{c.gsap}</CodeValue>
            ) : (
              <>
                <code className="text-micro">
                  <Num>CustomEase</Num>
                </code>
                &nbsp;מאותן <Num>{springInfo.stops}</Num>&nbsp;נקודות
              </>
            )}
          </dd>
        </div>
        <div className="contents">
          <dt className="text-ink-3">משך</dt>
          <dd>
            <Num className="font-medium">{real.ms}ms</Num>{' '}
            <code className="text-micro text-ink-3">
              <Num>{real.token}</Num>
            </code>
          </dd>
        </div>
        <div className="contents">
          <dt className="text-ink-3">שימוש</dt>
          <dd className="text-ink-2">
            {c.use}
            {isSpring ? (
              <div className="mt-2">
                <Verdict ok={false} label="לעולם לא על נתונים" />
              </div>
            ) : null}
          </dd>
        </div>
      </dl>
    </article>
  );
}

const PACES = [
  {
    value: 'uniform',
    label: (
      <>
        אחיד&nbsp;· <Num>{UNIFORM_MS}ms</Num>
      </>
    ),
  },
  { value: 'real', label: 'אמיתי · לפי הטוקן' },
] as const;

/**
 * Six easing cards. One play control runs them all at once; each card also
 * plays on hover, keyboard focus or its own button. "Uniform" pace runs every
 * curve over 1200ms so the shapes compare; "real" uses each one's own token.
 * Below desktop the cards are one swipeable row, so the block stays one
 * screen tall on a phone instead of six.
 */
export function EasingLab({ title, note }: { title: string; note?: ReactNode }) {
  const [pace, setPace] = useState<Pace>('uniform');
  const [signal, setSignal] = useState<Signal>({ n: 0, pace: 'uniform' });
  const playAll = (p: Pace) => setSignal((prev) => ({ n: prev.n + 1, pace: p }));

  return (
    <Block
      title={title}
      note={note}
      action={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <PlayButton onClick={() => playAll(pace)} context="שש העקומות" />
          {/* a one-line toolbar: the visible word mirrors the group's (hidden) legend */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-caption font-bold" aria-hidden="true">
              קצב
            </span>
            <SegmentedControl
              label="קצב"
              hideLabel
              options={PACES}
              value={pace}
              onChange={(p) => {
                setPace(p);
                playAll(p);
              }}
            />
          </div>
        </div>
      }
    >
      <div className={cn(s.curveRail, 'grid gap-4')}>
        <ul
          className={cn(
            s.curveList,
            // phones and tablets: one swipeable row, bleeding to the page edges. No scroll snapping
            // (it pulled a focused card back off-screen); cards grow with the text (15rem floor)
            'grid auto-cols-[max(min(85%,22rem),15rem)] grid-flow-col gap-(--gutter) overflow-x-auto overscroll-x-contain',
            '-mx-(--page-margin) px-(--page-margin) scroll-px-(--page-margin) pb-2',
            // desktop: three columns
            'lg:mx-0 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0',
          )}
          onFocus={revealFocused}
        >
          {curves.map((c) => (
            <li key={c.key} className="row-span-4 grid min-w-0 grid-rows-subgrid gap-y-0">
              <CurveCard c={c} signal={signal} pace={pace} />
            </li>
          ))}
        </ul>
        <p className={cn(s.curveHint, 'text-caption lg:hidden')} aria-hidden="true">
          <span>
            <Num>{curves.length}</Num>&nbsp;עקומות&nbsp;· גללו הצידה ←
          </span>
          <span className={s.curveProgress} />
        </p>
        <ReducedNote />
      </div>
    </Block>
  );
}
