import { cn } from '@/lib/cn';

/**
 * Concept mark: a seed split into two cotyledons above the soil line.
 * (Stage 1's preloader morphs a seed into exactly this shape.)
 * Not the client's registered logo — a pitch-concept lockup.
 */
export function SproutMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M16 27.5V15.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M15.6 16.4C15.6 10.6 11.9 6.9 4.75 6.9c0 5.8 3.8 9.5 10.85 9.5z" fill="var(--color-sprout)" />
      <path d="M16.4 14.6c0-5.8 3.7-9.5 10.85-9.5 0 5.8-3.8 9.5-10.85 9.5z" fill="var(--color-sprout)" />
      <path d="M8 27.5h16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3 text-ink', className)}>
      <SproutMark size={compact ? 28 : 34} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lead leading-none">המשביר</span>
        {compact ? null : <span className="mt-1 text-micro font-bold leading-none text-ink-2">לחקלאי · העונה שלך</span>}
      </span>
    </span>
  );
}
