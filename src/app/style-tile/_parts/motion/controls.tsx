'use client';

import { Button } from '@/components/ui/Button';
import { PlayIcon } from '@/components/ui/icons';

/**
 * A block's one play control, rendered in the Block `action` slot. The
 * visible word stays at the start of the accessible name (WCAG 2.5.3).
 */
export function PlayButton({ onClick, context }: { onClick: () => void; context: string }) {
  return (
    <Button variant="secondary" onClick={onClick} aria-label={`הפעלה: ${context}`}>
      <PlayIcon size={18} strokeWidth={2} />
      הפעלה
    </Button>
  );
}

/** Under reduced motion the demos already show their final state – say so. */
export function ReducedNote() {
  return (
    <span className="hidden text-caption text-ink-2 motion-reduce:inline">
      תנועה מופחתת פעילה: מוצג המצב הסופי, בלי תנועה.
    </span>
  );
}
