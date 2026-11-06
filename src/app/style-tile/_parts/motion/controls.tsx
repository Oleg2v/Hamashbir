'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckIcon, PlayIcon } from '@/components/ui/icons';

/** The block's one play control. The visible word stays in the accessible name (WCAG 2.5.3). */
export function PlayButton({ onClick, context }: { onClick: () => void; context: string }) {
  return (
    <Button variant="secondary" onClick={onClick} aria-label={`הפעלה: ${context}`}>
      <PlayIcon size={18} strokeWidth={2} />
      הפעלה
    </Button>
  );
}

/** Under reduced motion the demos already show their final state – say so. */
export function ReducedNote() {
  return (
    <span className="hidden text-caption text-ink-2 motion-reduce:inline">
      תנועה מופחתת פעילה: מוצג המצב הסופי, בלי תנועה.
    </span>
  );
}

/** One option of a single-choice toggle group (filter-chip look, aria-pressed). */
export function ToggleChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="chip chip--filter" aria-pressed={pressed} onClick={onClick}>
      <CheckIcon className="chip__check" size={16} strokeWidth={2.25} />
      {children}
    </button>
  );
}
