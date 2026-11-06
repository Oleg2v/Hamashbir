/**
 * Motion helpers for the style-tile demos. A plain module, not a client
 * boundary ("use client" would turn every import into a client reference);
 * `client-only` makes a server import fail at build time instead, because
 * useMedia is a React client hook.
 */
import 'client-only';
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

/** Checked at the moment of playing – JS animation must jump to the final state. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCE_QUERY).matches;
}

/** Cancel every animation in the list and empty it. */
export function cancelAll(list: Animation[]) {
  for (const a of list) a.cancel();
  list.length = 0;
}
