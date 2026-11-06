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
