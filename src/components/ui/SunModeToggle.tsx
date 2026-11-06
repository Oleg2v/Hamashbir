'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { bezierCss, durations, easings } from '@/design/tokens';
import { setThemeColor, SUN_STORAGE_KEY } from '@/lib/sun-mode';
import { SunIcon } from './icons';

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * מצב שמש – one tap to the outdoor theme: max contrast, no shadows, 2px lines,
 * 56px targets, larger type floors. The new theme rises from the button as a
 * circular reveal (View Transitions), instantly under reduced motion.
 */
export function SunModeToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  // Stay in sync with every other toggle (and the init script) on the page.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const sun = root.dataset.theme === 'sun';
      setOn(sun);
      setThemeColor(sun);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  const apply = (next: boolean) => {
    const root = document.documentElement;
    if (next) root.dataset.theme = 'sun';
    else delete root.dataset.theme;
    setThemeColor(next);
    try {
      localStorage.setItem(SUN_STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* private mode – the toggle still works for this visit */
    }
    setOn(next);
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !on;
    const doc = document as DocWithVT;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce) {
      apply(next);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => flushSync(() => apply(next)));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: durations.grow.ms,
          easing: bezierCss(easings['out-expo'].bezier),
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  };

  return (
    <button type="button" className={['sun-toggle', className].filter(Boolean).join(' ')} aria-pressed={on} onClick={onClick}>
      <SunIcon size={20} strokeWidth={2} />
      <span>מצב שמש</span>
    </button>
  );
}
