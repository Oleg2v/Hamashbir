'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';
import { PlayIcon } from '@/components/ui/icons';
import { Num } from '@/components/ui/Num';
import { durations, easings, spring, type EasingKey } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { PlayButton, ReducedNote, ToggleChip } from './controls';
import { PLOT_H, PLOT_W, coord, curves, px, py, springInfo, type CurveSpec } from './curves';
import { cancelAll, dirSign, prefersReducedMotion } from './hooks';
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

/** Spoken shape of each curve – the plot's accessible description. */
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

function Readout({ c, id }: { c: CurveSpec; id: string }) {
  return (
    <p id={id} className="text-caption">
      {c.mark.kind === 'p90' ? (
        <>
          <Num className="font-medium">90%</Num> מהדרך ב־<Num className="font-medium">{pct(c.mark.at.x)}%</Num> מהזמן
        </>
      ) : (
        <>
          שיא <Num className="font-medium">+{overshoot}%</Num> מעל היעד, ב־<Num className="font-medium">{pct(c.mark.at.x)}%</Num>{' '}
          מהזמן
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
          <line x1={px(0)} y1={py(0)} x2={coord(px(c.handles[0].x))} y2={coord(py(c.handles[0].y))} className={s.handle} />
          <line x1={px(1)} y1={py(1)} x2={coord(px(c.handles[1].x))} y2={coord(py(c.handles[1].y))} className={s.handle} />
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
      {c.stops?.map((p, i) => <circle key={i} cx={coord(px(p.x))} cy={coord(py(p.y))} r="0.9" className={s.stop} />)}
      <circle cx={coord(px(m.x))} cy={coord(py(m.y))} r="2.5" className={s.markRing} />
    </svg>
  );
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
      if (!force && now - last.current < 240) return; // hover + focus + click are one gesture
      last.current = now;
      cancelAll(anims.current);
      const from = `translateX(${-dirSign(el) * 100}%)`;
      const x = tx.current.animate([{ transform: from }, { transform: 'none' }], { duration: ms, easing: 'linear' });
      const y = ty.current.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], {
        duration: ms,
        easing: c.css,
      });
      const d = rail.current.animate([{ transform: from }, { transform: 'none' }], { duration: ms, easing: c.css });
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
        <div className="grid min-w-0 gap-1">
          <Num className="text-caption font-medium text-ink-2">{c.token}</Num>
          <h4 id={`${id}-title`} className="text-lead">
            {c.he}
          </h4>
        </div>
        <Button
          variant="icon"
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
            <span className={`${s.axisLabel} text-micro`} data-pos="y1" aria-hidden="true">
              <Num>1</Num>
            </span>
            <span className={`${s.axisLabel} text-micro`} data-pos="origin" aria-hidden="true">
              <Num>0</Num>
            </span>
            <span className={`${s.axisLabel} text-micro`} data-pos="x1" aria-hidden="true">
              <Num>1</Num>
            </span>
            <span className={`${s.axisLabel} text-micro`} data-pos="time" aria-hidden="true">
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

      <dl className="grid grid-cols-[3.5rem_minmax(0,1fr)] content-start items-baseline gap-x-4 gap-y-2 px-5 pb-6 pt-4 text-caption">
        {/* code rows stack: the value gets the card's full width and never breaks mid-expression */}
        <div className="col-span-2 grid gap-1">
          <dt className="text-micro text-ink-3">CSS</dt>
          <dd className="min-w-0">
            {isSpring ? (
              <>
                <code>
                  <Num className="block truncate text-micro" title={c.css}>
                    {c.css}
                  </Num>
                </code>
                <details className={s.fullValue}>
                  <summary>
                    הערך המלא · <Num>{springInfo.stops}</Num> נקודות
                  </summary>
                  <pre dir="ltr" className="text-micro">
                    <Num>{c.css}</Num>
                  </pre>
                </details>
              </>
            ) : (
              <code>
                <Num className="inline-flex max-w-full break-words text-start text-micro">{c.css}</Num>
              </code>
            )}
          </dd>
        </div>
        <div className="col-span-2 mb-2 grid gap-1">
          <dt className="text-micro text-ink-3">GSAP</dt>
          <dd className="min-w-0">
            {c.gsap ? (
              <code>
                <Num className="inline-flex max-w-full break-words text-start text-micro">{c.gsap}</Num>
              </code>
            ) : (
              <>
                <Num className="text-micro">CustomEase</Num> מאותן <Num>{springInfo.stops}</Num> נקודות
              </>
            )}
          </dd>
        </div>
        <div className="contents">
          <dt className="text-ink-3">משך</dt>
          <dd>
            <Num className="font-medium">{real.ms}ms</Num> <Num className="text-micro text-ink-3">{real.token}</Num>
          </dd>
        </div>
        <div className="contents">
          <dt className="text-ink-3">שימוש</dt>
          <dd className="text-ink-2">
            {c.use}
            {isSpring ? <span className="mt-1 block font-semibold text-harvest-ink">לעולם לא על נתונים.</span> : null}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/**
 * Six easing cards. One play control runs them all at once; each card also
 * plays on hover, keyboard focus or its own button. "Uniform" pace runs every
 * curve over 1200ms so the shapes compare; "real" uses each one's own token.
 */
export function EasingLab() {
  const [pace, setPace] = useState<Pace>('uniform');
  const [signal, setSignal] = useState<Signal>({ n: 0, pace: 'uniform' });
  const playAll = (p: Pace) => setSignal((prev) => ({ n: prev.n + 1, pace: p }));
  const choose = (p: Pace) => {
    setPace(p);
    playAll(p);
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <PlayButton onClick={() => playAll(pace)} context="שש העקומות" />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="motion-pace-label">
          <span id="motion-pace-label" className="me-1 text-caption font-semibold">
            קצב
          </span>
          <ToggleChip pressed={pace === 'uniform'} onClick={() => choose('uniform')}>
            אחיד · <Num>{UNIFORM_MS}ms</Num>
          </ToggleChip>
          <ToggleChip pressed={pace === 'real'} onClick={() => choose('real')}>
            אמיתי · לפי הטוקן
          </ToggleChip>
        </div>
        <p className="max-w-[48ch] text-caption text-ink-2">
          רחפו מעל כרטיס או הגיעו אליו במקלדת כדי להפעיל עקומה אחת. <ReducedNote />
        </p>
      </div>
      <ul className="grid gap-(--gutter) sm:grid-cols-2 lg:grid-cols-3">
        {curves.map((c) => (
          <li key={c.key} className="row-span-4 grid min-w-0 grid-rows-subgrid gap-y-0">
            <CurveCard c={c} signal={signal} pace={pace} />
          </li>
        ))}
      </ul>
    </div>
  );
}
