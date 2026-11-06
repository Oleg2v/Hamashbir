'use client';

import { useId, useState, type ReactNode } from 'react';
import { MinusIcon, PlusIcon } from './icons';

type NumberFieldProps = {
  label: ReactNode;
  unit: string;
  hint?: ReactNode;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  /** Message builder for out-of-range values. */
  rangeMessage?: (min: number, max: number) => string;
};

/**
 * Glove-friendly stepper: − value + with full-size targets on both sides.
 * Native number input underneath (spinbutton semantics, ArrowUp/ArrowDown,
 * PageUp/PageDown via step), mono LTR digits, unit announced with the value.
 */
export function NumberField({
  label,
  unit,
  hint,
  defaultValue = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  name,
  rangeMessage = (lo, hi) => `הזינו ערך בין ${lo.toLocaleString('he-IL')} ל־${hi.toLocaleString('he-IL')}`,
}: NumberFieldProps) {
  const id = useId();
  const [raw, setRaw] = useState(String(defaultValue));
  const value = Number(raw);
  const invalid = raw.trim() === '' || Number.isNaN(value) || value < min || value > max;
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const nudge = (dir: 1 | -1) => setRaw(String(clamp((Number.isNaN(value) ? min : value) + dir * step)));

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = invalid ? `${id}-error` : undefined;
  const unitId = `${id}-unit`;

  return (
    <div className="field" data-invalid={invalid ? '' : undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control stepper">
        <button
          type="button"
          className="stepper__btn"
          aria-label={`הפחתה של ${step} ${unit}`}
          aria-controls={id}
          onClick={() => nudge(-1)}
          disabled={!Number.isNaN(value) && value <= min}
        >
          <MinusIcon size={20} strokeWidth={2} />
        </button>
        <input
          id={id}
          name={name}
          type="number"
          className="field__input"
          data-numeric=""
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={[unitId, hintId, errId].filter(Boolean).join(' ')}
        />
        <span className="field__affix" id={unitId}>
          {unit}
        </span>
        <button
          type="button"
          className="stepper__btn"
          aria-label={`הוספה של ${step} ${unit}`}
          aria-controls={id}
          onClick={() => nudge(1)}
          disabled={!Number.isNaN(value) && value >= max}
        >
          <PlusIcon size={20} strokeWidth={2} />
        </button>
      </div>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {invalid ? (
        <p className="field__error" id={errId} role="alert">
          <span>{rangeMessage(min, max)}</span>
        </p>
      ) : null}
    </div>
  );
}
