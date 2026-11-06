'use client';

import { useState, type ReactNode } from 'react';
import { CheckIcon, PlusIcon } from './icons';

/**
 * Independent toggle for filters (aria-pressed). 36px visual / 44px hit area.
 * The leading slot always holds an icon (+ → ✓), so pressing never shifts
 * the chips that follow. Controlled (`pressed`) or uncontrolled (`defaultPressed`).
 */
export function FilterChip({
  children,
  pressed: controlled,
  defaultPressed = false,
  onPressedChange,
}: {
  children: ReactNode;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}) {
  const [own, setOwn] = useState(defaultPressed);
  const pressed = controlled ?? own;
  return (
    <button
      type="button"
      className="chip chip--filter"
      aria-pressed={pressed}
      onClick={() => {
        if (controlled === undefined) setOwn(!pressed);
        onPressedChange?.(!pressed);
      }}
    >
      <PlusIcon className="chip__plus" size={16} strokeWidth={2} />
      <CheckIcon className="chip__check" size={16} strokeWidth={2.25} />
      {children}
    </button>
  );
}
