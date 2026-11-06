import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';

/**
 * Small typographic helpers for the type section.
 * Right/wrong markers come from @/components/ui/Verdict; running text with
 * digits goes through @/components/ui/NumText.
 */

/**
 * Token role strings ("ממשק וגוף טקסט · 400 / 600 / 700 / 800"): a slash list
 * of weights is one LTR number run, so it reads 400 → 800 like the range
 * beside it; a trailing "+" stays inside its number ("25px+"); a Latin token
 * name ("title") is set as code, like every other token on the page.
 */
const ROLE_PARTS = /(\d+(?:\s*\/\s*\d+)+|\d[\d.,]*(?:px)?\+?|\b[a-z][a-z-]*\b)/;

export function RoleText({ children }: { children: string }) {
  return (
    <>
      {children.split(ROLE_PARTS).map((p, i) => {
        if (i % 2 === 0) return p;
        if (/^[a-z]/.test(p)) return <Code key={i}>{p}</Code>;
        // a list is one token: it moves to the next line whole (inline-block); only when it is
        // wider than the line (200% text) does it wrap, and then after a slash, never before one
        return (
          <Num key={i} className="inline-block">
            {p.replace(/\s+\/\s*/g, `${NB}/ `)}
          </Num>
        );
      })}
    </>
  );
}

/**
 * "13–14px": one LTR run with an en dash – never an arrow. Screen readers
 * hear „13 עד 14px” instead of a dash they would skip or read as minus.
 */
export function Range({
  from,
  to,
  unit = '',
  className,
}: {
  from: number;
  to: number;
  unit?: string;
  className?: string;
}) {
  if (from === to) {
    return (
      <Num className={className}>
        {from}
        {unit}
      </Num>
    );
  }
  return (
    <Num className={cn('whitespace-nowrap', className)}>
      {from}
      <span aria-hidden="true">–</span>
      <span className="sr-only"> עד </span>
      {to}
      {unit}
    </Num>
  );
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
