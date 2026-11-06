'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A sideways scroller that keyboard users can reach (WCAG 2.1.1): while its
 * content overflows, it is a focusable, labelled region, so Tab stops on it
 * and the arrow keys scroll it. When everything fits (a wider screen, a grid
 * layout) it is a plain div with no extra tab stop. Server-rendered as the
 * plain div; the check runs after hydration and on every resize.
 */
export function ScrollRegion({
  label,
  className,
  children,
}: {
  /** Hebrew name of the region, e.g. „צילומי אוויר” */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    check();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}>
      {children}
    </div>
  );
}
