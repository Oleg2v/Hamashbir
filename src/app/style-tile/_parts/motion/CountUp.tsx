'use client';

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { coefficients, demoFarm, season } from '@/data/demo-farm';
import { durations, easings } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { Block } from '../Section';
import { PlayButton } from './controls';
import { cubicBezier } from './curves';
import { prefersReducedMotion } from './hooks';
import s from './motion.module.css';

const ease = cubicBezier(...easings['out-expo'].bezier);
const DURATION = durations.season.ms;

/** The demo farm (נתוני דמו): net-house pepper in the Arava, 40 dunam. */
const YIELD = coefficients.yieldKgPerDunam; // 8,000 ק״ג לדונם
const DRIP = season.dripMeters; // 50,000 מ׳ שלוחת טפטוף

/** The final value reserves the width; the live value counts inside the same box. */
function Figure({
  value,
  liveRef,
  className,
  style,
}: {
  value: number;
  liveRef: RefObject<HTMLSpanElement | null>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Num className={cn(s.figure, className)} style={style} aria-hidden="true">
      <span className={s.figureGhost}>{formatNumber(value)}</span>
      <span ref={liveRef} className={s.figureLive}>
        {formatNumber(value)}
      </span>
    </Num>
  );
}

/**
 * The season's expected yield grows when it scrolls into view: out-expo over
 * the season duration, once. Server-rendered at its final value (no JS,
 * reduced motion and screenshots all see the truth); it only resets to zero
 * while still below the fold, so nobody watches a number fall.
 */
export function CountUp({ title, note, className }: { title: string; note?: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const yieldRef = useRef<HTMLSpanElement>(null);
  const dripRef = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  const render = useCallback((p: number) => {
    // a fresh text node each frame inside a fixed box: nothing is measured as moving
    if (yieldRef.current) yieldRef.current.textContent = formatNumber(Math.round(YIELD * p));
    if (dripRef.current) dripRef.current.textContent = formatNumber(Math.round(DRIP * p));
    fill.current?.style.setProperty('--p', p.toFixed(4));
  }, []);

  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (prefersReducedMotion()) {
      render(1);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      render(t >= 1 ? 1 : ease(t));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    render(0);
    raf.current = requestAnimationFrame(tick);
  }, [render]);

  useEffect(() => {
    const el = root.current;
    const fig = yieldRef.current?.parentElement;
    if (!el || !fig || prefersReducedMotion()) return;
    const onScreen = () => {
      const r = fig.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    if (onScreen()) return; // already visible on arrival: keep the truth, never drop to zero

    let armed = false;
    let done = false;
    const start = () => {
      done = true;
      near.disconnect();
      seen.disconnect();
      run();
    };
    // arm (reset to zero) while the readout is still below the fold; on a fast
    // jump it may already be on screen, so count straight away instead
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || armed || done) return;
        armed = true;
        if (onScreen()) start();
        else render(0);
      },
      { rootMargin: '0px 0px 60% 0px' },
    );
    // count once most of the number is in view
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done) start();
      },
      { threshold: 0.6 },
    );
    near.observe(el);
    seen.observe(fig);
    return () => {
      near.disconnect();
      seen.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [render, run]);

  return (
    <Block className={className} title={title} note={note} action={<PlayButton onClick={run} context={title} />}>
      <div ref={root} className="grid gap-8 rounded-lg border-(length:--bw) border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-caption font-bold">
            יבול צפוי · {demoFarm.crop}, {demoFarm.method}
          </p>
          <DemoTag />
        </div>

        {/* a size container: the display figure may shrink to fit it (34cqi ≈ "8,000" at 2.9em), which
            only happens at 200% text on a phone – everywhere else the type scale wins */}
        <div className="@container grid gap-5">
          {/* screen readers get the final value first, then the visible unit */}
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="sr-only">
              <Num>{formatNumber(YIELD)}</Num>
            </span>
            <Figure
              value={YIELD}
              liveRef={yieldRef}
              className="text-display font-normal"
              style={{ fontSize: 'min(var(--text-display), 34cqi)' }}
            />
            <span className="text-lead text-ink-2">ק״ג לדונם</span>
          </p>
          <span className={s.yieldBar} aria-hidden="true">
            <span ref={fill} className={s.yieldFill} />
          </span>
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="sr-only">
              <Num>{formatNumber(DRIP)}</Num>
            </span>
            <Figure value={DRIP} liveRef={dripRef} className="text-h3 text-water-ink" />
            <span className="text-body text-ink-2">
              מ׳ שלוחת טפטוף בתוכנית · <Num>{demoFarm.area}</Num>&nbsp;דונם
            </span>
          </p>
        </div>
      </div>
      <p className="max-w-[60ch] text-caption text-ink-2">
        ספרות טבלאיות ורוחב שמור מראש: התיבה של המספר לא משנה את מידותיה, ושום דבר מסביב לא זז בזמן הספירה.
      </p>
    </Block>
  );
}
