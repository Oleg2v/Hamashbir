'use client';

import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { Num } from '@/components/ui/Num';
import { SunModeToggle } from '@/components/ui/SunModeToggle';
import { cn } from '@/lib/cn';
import { route, sectionTitles, type RouteKey } from './Section';

const keys = Object.keys(route) as RouteKey[];

/**
 * Fixed header. Transparent soil while it floats over the opening, paper with
 * a hairline once content passes under it (an instant flip — every part
 * changes together). Scroll-spy marks the current section; below xl the same
 * 01–08 navigation is a chip rail under the bar, tucked away while scrolling
 * down and back on scroll up.
 */
export function TileHeader() {
  const [overHero, setOverHero] = useState(true);
  const [active, setActive] = useState<RouteKey | null>(null);
  const [railHidden, setRailHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Scroll padding follows the header's full height – bar plus rail, the rail
  // counted even while tucked away (a reverse focus walk brings it back) – so
  // anchors and focused controls never land under it, in sun mode or at 200%
  // text too. globals.css reads --header-h.
  useEffect(() => {
    const header = headerRef.current;
    const bar = barRef.current;
    if (!header || !bar) return;
    const root = document.documentElement;
    const measure = () => {
      const border = parseFloat(getComputedStyle(header).borderBlockEndWidth) || 0;
      const rail = railRef.current?.offsetHeight ?? 0; // 0 at xl, where the rail is display: none
      root.style.setProperty('--header-h', `${Math.ceil(bar.offsetHeight + rail + border)}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    if (railRef.current) ro.observe(railRef.current);
    // the sun-mode border width changes no box size: listen to the theme too
    const mo = new MutationObserver(measure);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    measure();
    return () => {
      ro.disconnect();
      mo.disconnect();
      root.style.removeProperty('--header-h');
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const ioHero = new IntersectionObserver(
      ([e]) => {
        setOverHero(e.isIntersecting);
        if (e.isIntersecting && e.intersectionRatio > 0.35) setActive(null);
      },
      { rootMargin: '-72px 0px 0px 0px', threshold: [0, 0.35, 1] },
    );
    if (hero) ioHero.observe(hero);

    const ioSpy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as RouteKey);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    keys.forEach((k) => {
      const el = document.getElementById(k);
      if (el) ioSpy.observe(el);
    });

    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 8) {
          setRailHidden(y > last && y > 320);
          last = y;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ioHero.disconnect();
      ioSpy.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // keep the current chip visible inside the rail
  useEffect(() => {
    if (!active) return;
    const chip = railRef.current?.querySelector<HTMLElement>(`[data-key="${active}"]`);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <header
      ref={headerRef}
      data-surface={overHero ? 'soil' : 'paper'}
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-header)',
        overHero ? 'border-b border-transparent bg-transparent' : 'border-b border-line bg-canvas/95 backdrop-blur-md',
      )}
    >
      <div ref={barRef} className="wrap flex min-h-16 items-center justify-between gap-3 sm:gap-6 lg:min-h-18">
        <a href="#hero" className="inline-flex min-h-(--target) shrink-0 items-center no-underline">
          <Wordmark />
          <span className="sr-only"> – לראש העמוד</span>
        </a>
        <nav aria-label="סעיפי לוח הסגנון" className="hidden min-w-0 flex-1 justify-center xl:flex">
          <ul className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {keys.map((k) => (
              <li key={k} className="shrink-0">
                <a
                  href={`#${k}`}
                  aria-current={active === k ? 'true' : undefined}
                  className={cn(
                    'inline-flex min-h-(--target) items-center gap-2 rounded-full px-3 text-caption font-semibold text-ink no-underline hover:bg-tint-hover',
                    active === k && 'bg-tint-hover',
                  )}
                >
                  <Num className="text-micro text-ink-2">{route[k].num}</Num>
                  {sectionTitles[k]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <SunModeToggle />
      </div>
      <nav
        aria-label="סעיפי לוח הסגנון"
        className={cn(
          'grid transition-[grid-template-rows] duration-(--dur-base) ease-out-quint xl:hidden',
          railHidden ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div ref={railRef} className="wrap section-rail" inert={railHidden || undefined}>
            {keys.map((k) => (
              <a key={k} data-key={k} href={`#${k}`} aria-current={active === k ? 'true' : undefined}>
                <Num className="text-micro text-ink-2">{route[k].num}</Num>
                {sectionTitles[k]}
              </a>
            ))}
          </div>
        </div>
      </nav>
      {/* the page is a season too: an NDVI line that grows with scroll (CSS scroll-timeline) */}
      <span className="season-progress" aria-hidden="true" />
    </header>
  );
}
