'use client';

import { useState, type ReactNode } from 'react';
import { CheckIcon } from './icons';

/** Toggle chip for filters. aria-pressed, 36px visual / 44px hit area. */
export function FilterChip({
  children,
  defaultPressed = false,
  onPressedChange,
}: {
  children: ReactNode;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}) {
  const [pressed, setPressed] = useState(defaultPressed);
  return (
    <button
      type="button"
      className="chip chip--filter"
      aria-pressed={pressed}
      onClick={() => {
        setPressed((p) => !p);
        onPressedChange?.(!pressed);
      }}
    >
      <CheckIcon className="chip__check" size={16} strokeWidth={2.25} />
      {children}
    </button>
  );
}
