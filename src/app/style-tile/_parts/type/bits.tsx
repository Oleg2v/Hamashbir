import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * Small typographic helpers for the type section.
 * Right/wrong markers come from @/components/ui/Verdict; running text with
 * digits goes through @/components/ui/NumText.
 */

/**
 * Token role strings ("ממשק וגוף טקסט · 400 / 600 / 700 / 800"): a slash list
 * of weights is one LTR number run, so it reads 400 → 800 like the range
 * beside it; a trailing "+" stays inside its number ("25px+").
 */
const ROLE_NUMERIC = /(\d+(?:\s*\/\s*\d+)+|\d[\d.,]*(?:px)?\+?)/;

export function RoleText({ children }: { children: string }) {
  return <>{children.split(ROLE_NUMERIC).map((p, i) => (i % 2 ? <Num key={i}>{p}</Num> : p))}</>;
}

/** "13–14px": a range is one LTR run with an en dash – never an arrow. */
export function pxRange([from, to]: readonly [number, number]) {
  return from === to ? `${from}px` : `${from}–${to}px`;
}

/**
 * Proofreader's highlight on the glyph a rule is about. It is a plain inline
 * span (no isolation), so it never changes how the bidi algorithm sees the text.
 */
export function Mark({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-xs box-decoration-clone',
        ok
          ? 'bg-[color-mix(in_oklab,var(--color-sprout)_55%,transparent)]'
          : 'bg-[color-mix(in_oklab,var(--color-harvest)_26%,transparent)]',
      )}
    >
      {children}
    </span>
  );
}

/** U+05F4 as a mono, LTR code point label. */
export function CodePoint({ ch, className }: { ch: string; className?: string }) {
  const cp = ch.codePointAt(0) ?? 0;
  return (
    <Num className={className} lang="en">
      U+{cp.toString(16).toUpperCase().padStart(4, '0')}
    </Num>
  );
}

/** 18 → "18", 63.333 → "63.3" */
export function formatPx(px: number) {
  const v = Math.round(px * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Signed step index with a true minus sign: −2, −1, 0, +1 … */
export function signed(n: number) {
  if (n === 0) return '0';
  return n < 0 ? `−${Math.abs(n)}` : `+${n}`;
}

/** A CSS token printed as code: LTR, isolated, mono, English for screen readers. */
export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code dir="ltr" lang="en" className={cn('font-mono', className)}>
      {children}
    </code>
  );
}
