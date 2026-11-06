'use client';

import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { Num } from '@/components/ui/Num';
import { SunModeToggle } from '@/components/ui/SunModeToggle';
import { cn } from '@/lib/cn';
import { route, sectionTitles, type RouteKey } from './Section';

const keys = Object.keys(route) as RouteKey[];

/**
 * Fixed header. Transparent soil while it floats over the hero, paper with a
 * hairline once content passes under it. Scroll-spy marks the current section.
 */
export function TileHeader() {
  const [overHero, setOverHero] = useState(true);
  const [active, setActive] = useState<RouteKey | null>(null);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const ioHero = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting), {
      rootMargin: '-72px 0px 0px 0px',
    });
    if (hero) ioHero.observe(hero);

    const ioSpy = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as RouteKey);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    keys.forEach((k) => {
      const el = document.getElementById(k);
      if (el) ioSpy.observe(el);
    });
    return () => {
      ioHero.disconnect();
      ioSpy.disconnect();
    };
  }, []);

  return (
    <header
      data-surface={overHero ? 'soil' : 'paper'}
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-header) transition-[background-color,border-color] duration-(--dur-base) ease-out-quint',
        overHero ? 'border-b border-transparent bg-transparent' : 'border-b border-line bg-canvas/90 backdrop-blur-md',
      )}
    >
      <div className="wrap flex min-h-18 items-center justify-between gap-6">
        <a href="#hero" className="no-underline" aria-label="המשביר לחקלאי · העונה שלך – לראש העמוד">
          <Wordmark />
        </a>
        <nav aria-label="סעיפי הסטייל טייל" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {keys.map((k) => (
              <li key={k}>
                <a
                  href={`#${k}`}
                  aria-current={active === k ? 'true' : undefined}
                  className={cn(
                    'group inline-flex min-h-(--target) items-center gap-2 rounded-full px-3 text-caption font-semibold text-ink no-underline transition-colors duration-(--dur-fast) hover:bg-tint-hover',
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
      {/* the page is a season too: an NDVI line that grows with scroll (CSS scroll-timeline) */}
      <span className="season-progress" aria-hidden="true" />
    </header>
  );
}
