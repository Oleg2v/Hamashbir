'use client';

import { useEffect, useState } from 'react';
import { Num } from '@/components/ui/Num';
import { formatPx } from './bits';

/**
 * "עכשיו: 18px" – the computed font-size of the element with id `target`,
 * read with getComputedStyle. Re-reads when the element resizes (viewport,
 * fonts) and when <html> changes (sun mode swaps the type floors).
 * The server renders a fixed-width placeholder, so nothing shifts on hydration.
 */
export function NowPx({ target, className }: { target: string; className?: string }) {
  const [px, setPx] = useState<number | null>(null);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    let raf = 0;
    const read = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPx(parseFloat(getComputedStyle(el).fontSize)));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    window.addEventListener('resize', read);
    document.fonts?.ready.then(read).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', read);
    };
  }, [target]);

  return (
    <span className={className}>
      עכשיו:{' '}
      {/* a fixed box (sized in mono ch) holds the digits against the label, so
          rows of readouts line up. The box is positioned, never the <Num>. */}
      <span className="num inline-block min-w-[6ch] text-start">
        <Num data-live={px == null ? undefined : ''}>{px == null ? '‒‒' : formatPx(px)}px</Num>
      </span>
    </span>
  );
}
