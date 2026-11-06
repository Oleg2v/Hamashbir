'use client';

import { useCallback, useEffect, useRef } from 'react';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { durations, easings } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { PlayButton } from './controls';
import { Token } from './Token';
import { cubicBezier } from './curves';
import { prefersReducedMotion } from './hooks';
import s from './motion.module.css';

const ease = cubicBezier(...easings['out-expo'].bezier);
const DURATION = durations.season.ms;

const YIELD = 4200; // ק״ג לדונם – demo
const DRIP = 32000; // מ׳ – demo
const AREA = 40; // דונם – demo

/** Final value reserves the width; the live value counts inside it, on the units digit. */
function Figure({
  value,
  liveRef,
  className,
}: {
  value: number;
  liveRef: React.RefObject<HTMLSpanElement | null>;
  className?: string;
}) {
  return (
    <Num className={cn(s.figure, className)} aria-hidden="true">
      <span className={s.figureGhost}>{formatNumber(value)}</span>
      <span ref={liveRef}>{formatNumber(value)}</span>
    </Num>
  );
}

/**
 * A yield that grows when it scrolls into view: out-expo over the season
 * duration, once. Server-rendered at its final value (no JS, reduced motion
 * and screenshots all see the truth); it only resets to zero while still
 * below the fold, so nobody watches a number fall.
 */
export function CountUp() {
  const root = useRef<HTMLDivElement>(null);
  const yieldRef = useRef<HTMLSpanElement>(null);
  const dripRef = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  const render = useCallback((p: number) => {
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
    <div ref={root} className="grid gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption font-bold">יבול צפוי · תפוח אדמה, גידול אביב</p>
        <DemoTag />
      </div>

      <div className="grid gap-5">
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <Figure value={YIELD} liveRef={yieldRef} className="text-display font-normal" />
          <span className="text-lead text-ink-2">ק״ג לדונם</span>
          <span className="sr-only">
            <Num>{formatNumber(YIELD)}</Num> ק״ג לדונם
          </span>
        </p>
        <span className={s.yieldBar} aria-hidden="true">
          <span ref={fill} className={s.yieldFill} />
        </span>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Figure value={DRIP} liveRef={dripRef} className="text-h3 text-water-ink" />
          <span className="text-body text-ink-2">
            מ׳ טפטוף בתוכנית · <Num>{AREA}</Num> דונם
          </span>
          <span className="sr-only">
            <Num>{formatNumber(DRIP)}</Num> מטר טפטוף בתוכנית
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
        <PlayButton onClick={run} context="ספירה מחדש" />
        <p className="max-w-[44ch] text-caption text-ink-2">
          <Token>out-expo</Token> במשך <Num>{DURATION}ms</Num>, פעם אחת, כשהמספר נכנס לתצוגה. ספרות טבלאיות ורוחב שמור
          מראש – שום דבר מסביב לא זז בזמן הספירה.
        </p>
      </div>
    </div>
  );
}
