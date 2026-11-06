'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type MagneticProps = {
  children: ReactNode;
  /** Fraction of the pointer offset the element follows. */
  strength?: number;
  /** Maximum travel in px — magnetism, not chasing. */
  max?: number;
  /** Activation zone as a multiple of the element's half-size. */
  reach?: number;
};

/**
 * Magnetic CTA. Follows a fine pointer by up to `max` px with the fast UI
 * ease, springs home with the spring linear() curve when released.
 * Off for touch, coarse pointers and prefers-reduced-motion.
 */
export function Magnetic({ children, strength = 0.32, max = 10, reach = 1.6 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduce.matches) return;

    let raf = 0;
    let ox = 0;
    let oy = 0;
    let active = false;

    const set = (x: number, y: number, on: boolean) => {
      ox = x;
      oy = y;
      active = on;
      el.dataset.active = on ? 'true' : 'false';
      el.style.setProperty('--mx', `${x.toFixed(2)}px`);
      el.style.setProperty('--my', `${y.toFixed(2)}px`);
    };

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        // centre of the element at rest (remove current travel)
        const cx = r.left + r.width / 2 - ox;
        const cy = r.top + r.height / 2 - oy;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const zoneX = (r.width / 2) * reach;
        const zoneY = (r.height / 2) * reach + 24;
        if (Math.abs(dx) > zoneX || Math.abs(dy) > zoneY) {
          if (active) set(0, 0, false);
          return;
        }
        const clamp = (v: number) => Math.max(-max, Math.min(max, v));
        set(clamp(dx * strength), clamp(dy * strength), true);
      });
    };

    const release = () => active && set(0, 0, false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', release);
    window.addEventListener('scroll', release, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', release);
      window.removeEventListener('scroll', release);
    };
  }, [strength, max, reach]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}
