import type { ReactNode } from 'react';
import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * Small typographic helpers for the type section.
 * Copy that comes from tokens.ts ("שלב 3 ומעלה", "400 / 600") still has to put
 * every number through <Num>; `Nums` does that for a plain string.
 */
export function Nums({ children, mono = true }: { children: string; mono?: boolean }) {
  const parts = children.split(/(\d+(?:[.,/]\d+)*)/);
  return <>{parts.map((p, i) => (i % 2 ? <Num key={i} mono={mono}>{p}</Num> : p))}</>;
}

/**
 * → drawn, not typed: no loaded subset (Plex Mono, Assistant, Suez One) has
 * U+2192, and a system fallback glyph would break the mono rhythm.
 * Sits inside an LTR <Num> run ("61 → 144px"), so it points right.
 */
export function RangeArrow({ className }: { className?: string }) {
  return (
    <>
      <svg
        viewBox="0 0 20 10"
        className={cn('mx-[0.3em] inline-block h-[0.5em] w-[1em] align-[0.12em]', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1 5h17M14 1.5 18 5l-4 3.5" />
      </svg>
      <span className="sr-only"> עד </span>
    </>
  );
}

/** ← → : the two ends of a range, between two Hebrew phrases. */
export function BothWays({ className }: { className?: string }) {
  return (
    <>
      <svg
        viewBox="0 0 34 10"
        className={cn('mx-[0.35em] inline-block h-[0.55em] w-[1.9em] align-[0.1em]', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1 5h11M4.5 1.5 1 5l3.5 3.5M22 5h11M29.5 1.5 33 5l-3.5 3.5" />
      </svg>
      <span className="sr-only"> ועד </span>
    </>
  );
}

/** ≤ – same reason as the arrow: no loaded face carries U+2264. */
export function AtMost({ className }: { className?: string }) {
  return (
    <>
      <svg
        viewBox="0 0 10 12"
        className={cn('mx-[0.15em] inline-block h-[0.7em] w-[0.6em] align-[-0.04em]', className)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M9 1 1 4.5 9 8M1 11h8" />
      </svg>
      <span className="sr-only">לכל היותר </span>
    </>
  );
}

/** "נכון" / "שגוי" – always an icon and a word, never colour alone. */
export function Verdict({ ok, className }: { ok: boolean; className?: string }) {
  const Icon = ok ? CheckIcon : CloseIcon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-caption font-bold leading-none',
        ok ? 'text-sprout-ink' : 'text-harvest-ink',
        className,
      )}
    >
      <span className="grid size-6 place-items-center rounded-full border-2 border-current" aria-hidden="true">
        <Icon size={14} strokeWidth={3} />
      </span>
      {ok ? 'נכון' : 'שגוי'}
    </span>
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
