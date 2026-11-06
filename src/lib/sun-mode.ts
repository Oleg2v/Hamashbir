/**
 * Sun mode + page-ready bootstrapping. A plain module (not "use client") so the
 * server layout can inline the head script as a real string.
 */
export const SUN_STORAGE_KEY = 'hm:sun';

import { palette, surfaces } from '@/design/tokens';

export const THEME_COLOR = { default: palette.soil.hex, sun: surfaces.sun.canvas } as const;

/**
 * Inline <head> script:
 *  1. applies sun mode before first paint (saved choice, else prefers-contrast: more);
 *  2. marks <html data-ready> after load + an idle slot, so intro animations
 *     (e.g. the season parcels) never compete with hydration on slow phones.
 */
export const headScript = `(function(){var d=document.documentElement;try{var v=localStorage.getItem('${SUN_STORAGE_KEY}');if(v==='1'||(v===null&&window.matchMedia('(prefers-contrast: more)').matches)){d.dataset.theme='sun'}}catch(e){}function ready(){d.dataset.ready='1'}function idle(){(window.requestIdleCallback||function(f){setTimeout(f,120)})(ready,{timeout:1500})}if(document.readyState==='complete'){idle()}else{window.addEventListener('load',idle)}})();`;

export function setThemeColor(sun: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', sun ? THEME_COLOR.sun : THEME_COLOR.default);
}

/**
 * Keeps the reader's place across a restyle that changes the height of
 * everything above them (sun mode raises type floors and target sizes, so
 * the sections above the viewport grow by screens on a phone). Call before
 * the change: it picks a small element just under the fixed header and notes
 * where it sits. `restore()` puts it back; `follow()` keeps putting it back
 * until the layout has been quiet for a moment, because fonts, observers and
 * React effects keep resizing the page after the switch. Its clock starts at
 * the first frame after the change (a big restyle can take longer than any
 * fixed window on a slow phone). Any input from the user ends it.
 */
export function holdPlace() {
  const root = document.documentElement;
  const headerH = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 0;
  let anchor: Element | null = null;
  probe: for (const dy of [16, 64, 160, 320]) {
    for (const fx of [0.5, 0.25, 0.75]) {
      const el = document.elementFromPoint(innerWidth * fx, Math.min(innerHeight - 1, headerH + dy));
      if (!el || el === root || el === document.body || el.closest('header, .toast-viewport, .demo-badge')) continue;
      const h = el.getBoundingClientRect().height;
      if (h > 0 && h < innerHeight * 0.75) {
        anchor = el;
        break probe;
      }
    }
  }
  const top = anchor?.getBoundingClientRect().top ?? 0;

  /** puts the anchor back; true when it had to scroll */
  const restore = () => {
    if (!anchor?.isConnected) return false;
    const delta = anchor.getBoundingClientRect().top - top;
    if (Math.abs(delta) < 1) return false;
    window.scrollBy(0, delta);
    return true;
  };

  const follow = ({ quietMs = 600, maxMs = 4000 } = {}) => {
    if (!anchor) return;
    const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    let raf = 0;
    let first = -1;
    let lastFix = -1;
    const off = () => inputs.forEach((t) => window.removeEventListener(t, stop, true));
    const stop = () => {
      cancelAnimationFrame(raf);
      off();
    };
    inputs.forEach((t) => window.addEventListener(t, stop, { capture: true, passive: true }));
    const tick = (now: number) => {
      if (first < 0) first = lastFix = now;
      if (restore()) lastFix = now;
      if (now - lastFix < quietMs && now - first < maxMs) raf = requestAnimationFrame(tick);
      else off();
    };
    raf = requestAnimationFrame(tick);
  };

  return { restore, follow };
}
