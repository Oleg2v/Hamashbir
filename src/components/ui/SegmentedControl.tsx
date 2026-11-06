'use client';

import { useId, type ReactNode } from 'react';

export type Segment<V extends string> = { value: V; label: ReactNode };

/**
 * Single choice among a few options — native radios styled as chips.
 * Arrow keys move the choice (browser behaviour), one tab stop for the group,
 * and the selection is announced as a radio, not as a toggle button.
 */
export function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
  name,
  hideLabel = false,
}: {
  label: ReactNode;
  options: ReadonlyArray<Segment<V>>;
  value: V;
  onChange: (value: V) => void;
  name?: string;
  hideLabel?: boolean;
}) {
  const auto = useId();
  const group = name ?? `seg-${auto}`;
  return (
    <fieldset className="segmented">
      <legend className={hideLabel ? 'sr-only' : 'segmented__legend'}>{label}</legend>
      <div className="segmented__options">
        {options.map((o) => (
          <label key={o.value} className="segmented__option">
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className="chip chip--filter segmented__chip">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
