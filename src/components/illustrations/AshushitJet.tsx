'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { bezierCss, durations, easings, staggerDelay } from '@/design/tokens';

/**
 * Plays the sprinkler – once, never on a loop (WCAG 2.2.2): when the drawing
 * first comes into view, and again whenever its card (or the figure itself)
 * is hovered or takes focus. One play lasts three season beats (3.6s, under
 * the 5s threshold): the stream runs at one dash period per `slow` beat, the
 * drops dim in turn down the arc so they read as falling, and the flow eases
 * out to rest where it stopped. Reduced motion: nothing moves – the drawing
 * already shows the jet.
 *
 * A client island around a server-rendered drawing: it only finds the paths
 * marked data-jet inside its children, so the geometry never ships as JS.
 */

/** Dash period of the stream (7 on, 5 off – Ashushit.module.css › .jet). */
const PERIOD = 12;

export function AshushitJet({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stream = Array.from(root.querySelectorAll<SVGPathElement>('[data-jet="stream"]'));
    const beads = Array.from(root.querySelectorAll<SVGPathElement>('[data-jet="drop"], [data-jet="splash"]'));
    if (!stream.length || typeof stream[0].animate !== 'function') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let running: Animation[] = [];
    let offset = 0;

    const stop = () => {
      running.forEach((a) => a.cancel());
      running = [];
    };

    const play = () => {
      if (reduce.matches || running.length) return;
      const run = durations.season.ms * 2;
      const settle = durations.season.ms;
      const total = run + settle;
      const speed = PERIOD / durations.slow.ms; // units per ms
      const ease = easings['out-quint'].bezier;
      // the settle covers exactly the distance that keeps the speed continuous
      // where the run hands over to the ease-out (its initial slope is y1/x1)
      const coast = (speed * settle * ease[0]) / ease[1];
      const from = offset;
      const to = from - speed * run - coast;
      offset = to;

      const flow = stream.map((el) =>
        el.animate(
          [
            { strokeDashoffset: from, easing: 'linear' },
            { strokeDashoffset: from - speed * run, offset: run / total, easing: bezierCss(ease) },
            { strokeDashoffset: to },
          ],
          { duration: total, fill: 'forwards' },
        ),
      );
      // the drops dim in turn, wave after wave, for as long as the stream runs
      const beat = durations.grow.ms;
      const rounds = Math.round((run - staggerDelay(beads.length - 1, beads.length)) / beat);
      const chase = beads.map((el, i) =>
        el.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], {
          duration: beat,
          delay: staggerDelay(i, beads.length),
          iterations: Math.max(1, rounds),
          easing: bezierCss(easings['in-out-quart'].bezier),
        }),
      );
      running = [...flow, ...chase];
      // keep the stream where it came to rest, then let go of the animations
      flow[0].finished
        .then(() => {
          flow.forEach((a) => {
            a.commitStyles();
            a.cancel();
          });
          running = [];
        })
        .catch(() => {});
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(root);

    // its card when it sits in one (the whole card is the hover/focus target), else the figure
    const host = root.closest<HTMLElement>('.card') ?? root.closest<HTMLElement>('figure') ?? root;
    host.addEventListener('pointerenter', play);
    host.addEventListener('focusin', play);
    const onReduce = () => reduce.matches && stop();
    reduce.addEventListener('change', onReduce);

    return () => {
      io.disconnect();
      host.removeEventListener('pointerenter', play);
      host.removeEventListener('focusin', play);
      reduce.removeEventListener('change', onReduce);
      stop();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
