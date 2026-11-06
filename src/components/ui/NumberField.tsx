'use client';

import { useId, useState, type ReactNode } from 'react';
import { MinusIcon, PlusIcon } from './icons';
import { NumText } from './NumText';

type NumberFieldProps = {
  label: ReactNode;
  /** Hebrew unit, e.g. "דונם". Announced with the value. */
  unit: string;
  hint?: ReactNode;
  id?: string;
  name?: string;
  /** Controlled value (pair with onValueChange) … */
  value?: number;
  /** … or uncontrolled starting value. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Error copy; {min} and {max} are replaced. Serializable, so server pages can pass it. */
  rangeMessage?: string;
};

const fmt = (n: number) => n.toLocaleString('he-IL');

/**
 * Glove-friendly stepper: − value + with full-size targets on both sides.
 * A native number input underneath (spinbutton semantics, ArrowUp/ArrowDown;
 * PageUp/PageDown jump ×10), mono LTR digits, unit announced with the value.
 * The step buttons never disable themselves while focused (focus would fall
 * to <body>): at a bound they become aria-disabled and do nothing. Errors
 * wait for the user to leave the field, so clearing it to retype is quiet.
 */
export function NumberField({
  label,
  unit,
  hint,
  id: idProp,
  name,
  value: controlled,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled = false,
  rangeMessage = 'הזינו ערך בין {min} ל־{max}',
}: NumberFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [own, setOwn] = useState(String(defaultValue));
  const [touched, setTouched] = useState(false);
  const raw = controlled !== undefined ? String(controlled) : own;
  const value = Number(raw);
  const empty = raw.trim() === '';
  const outOfRange = !empty && (Number.isNaN(value) || value < min || value > max);
  const invalid = outOfRange || (touched && empty);

  const commit = (next: string) => {
    if (controlled === undefined) setOwn(next);
    const n = Number(next);
    if (next.trim() !== '' && !Number.isNaN(n)) onValueChange?.(n);
  };

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const nudge = (delta: number) => {
    const base = Number.isNaN(value) || empty ? min : value;
    // round to the step's precision so 0.1 + 0.2 never shows 0.30000000004
    const precision = (String(step).split('.')[1] ?? '').length;
    commit(clamp(Number((base + delta).toFixed(precision))).toString());
  };

  const atMin = !Number.isNaN(value) && !empty && value <= min;
  const atMax = !Number.isNaN(value) && !empty && value >= max;
  const stepWords = step === 1 ? `${unit} אחד` : `${fmt(step)} ${unit}`;

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = invalid ? `${id}-error` : undefined;
  const unitId = `${id}-unit`;

  return (
    <div className="field" data-invalid={invalid ? '' : undefined} data-disabled={disabled ? '' : undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control stepper">
        <button
          type="button"
          className="stepper__btn"
          aria-label={`הפחתה: ${stepWords}`}
          aria-controls={id}
          aria-disabled={disabled || atMin || undefined}
          onClick={() => !disabled && !atMin && nudge(-step)}
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
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => {
            if (e.key === 'PageUp' || e.key === 'PageDown') {
              e.preventDefault();
              nudge((e.key === 'PageUp' ? 1 : -1) * step * 10);
            }
          }}
          aria-invalid={invalid || undefined}
          aria-describedby={[unitId, hintId, errId].filter(Boolean).join(' ')}
        />
        <span className="field__affix" id={unitId}>
          {unit}
        </span>
        <button
          type="button"
          className="stepper__btn"
          aria-label={`הוספה: ${stepWords}`}
          aria-controls={id}
          aria-disabled={disabled || atMax || undefined}
          onClick={() => !disabled && !atMax && nudge(step)}
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
          <span>
            <NumText>{rangeMessage.replace('{min}', fmt(min)).replace('{max}', fmt(max))}</NumText>
          </span>
        </p>
      ) : null}
    </div>
  );
}
