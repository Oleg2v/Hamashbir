'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { magnet } from '@/design/tokens';

type MagneticProps = {
  children: ReactNode;
  /** Fraction of the pointer offset the element follows. */
  strength?: number;
  /** Maximum travel in px – magnetism, not chasing. */
  max?: number;
  /** Activation zone as a multiple of the element's half-size. */
  reach?: number;
};

/**
 * Magnetic CTA. Follows a fine pointer by up to `max` px with the fast UI
 * ease, springs home with the spring linear() curve when released.
 * Off for touch, coarse pointers and prefers-reduced-motion.
 */
export function Magnetic({
  children,
  strength = magnet.strength,
  max = magnet.max,
  reach = magnet.reach,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // re-evaluate when the user plugs in a mouse or toggles reduced motion
  const [env, setEnv] = useState(0);

  useEffect(() => {
    const queries = [
      window.matchMedia('(hover: hover) and (pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const bump = () => setEnv((n) => n + 1);
    queries.forEach((q) => q.addEventListener('change', bump));
    return () => queries.forEach((q) => q.removeEventListener('change', bump));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduce.matches) {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
      return;
    }

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
        // centre and half-size at rest (remove the current travel)
        const cx = r.left + r.width / 2 - ox;
        const cy = r.top + r.height / 2 - oy;
        const hx = r.width / 2;
        const hy = r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        // normalised distance: 1 on the element's edge, `reach` at the zone edge
        const nd = Math.max(Math.abs(dx) / hx, Math.abs(dy) / hy);
        if (nd > reach) {
          if (active) set(0, 0, false);
          return;
        }
        // Smooth falloff: zero pull at the zone edge, full pull from the edge of
        // the element inwards — so entering the zone never makes the CTA jump.
        const t = Math.min(1, Math.max(0, (reach - nd) / (reach - 1)));
        const ease = t * t * (3 - 2 * t);
        const clamp = (v: number) => Math.max(-max, Math.min(max, v));
        set(clamp(dx * strength) * ease, clamp(dy * strength) * ease, true);
      });
    };

    const release = () => active && set(0, 0, false);
    // pointer left the window from inside the zone
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) release();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
    document.documentElement.addEventListener('pointerleave', release);
    window.addEventListener('blur', release);
    window.addEventListener('scroll', release, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.documentElement.removeEventListener('pointerleave', release);
      window.removeEventListener('blur', release);
      window.removeEventListener('scroll', release);
    };
  }, [strength, max, reach, env]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}
