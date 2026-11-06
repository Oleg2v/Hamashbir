'use client';

import { useSyncExternalStore } from 'react';

export const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_QUERY = '(hover: hover) and (pointer: fine)';

/** Live media-query state; `null` during SSR and hydration (unknown yet). */
export function useMedia(query: string): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => null,
  );
}

/** Checked at the moment of playing – JS animation must jump to the final state. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCE_QUERY).matches;
}

/** −1 in RTL, 1 in LTR: multiply x-travel so "forward" heads toward inline-end. */
export function dirSign(el: Element) {
  return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
}

/** Cancel every animation in the list and empty it. */
export function cancelAll(list: Animation[]) {
  for (const a of list) a.cancel();
  list.length = 0;
}
