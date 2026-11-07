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
  /** Error copy for a value off the step grid (40.5 with step 1); {step} is replaced. */
  stepMessage?: string;
};

const fmt = (n: number) => n.toLocaleString('he-IL');

/**
 * Glove-friendly stepper: − value + with full-size targets on both sides.
 * A native number input underneath (spinbutton semantics, ArrowUp/ArrowDown;
 * PageUp/PageDown jump ×10), mono LTR digits, unit announced with the value.
 * The step buttons never disable themselves while focused (focus would fall
 * to <body>): at a bound they become aria-disabled and do nothing. − and +
 * move along the step grid like ArrowUp/ArrowDown do (40.5 → 41, not 41.5).
 * An out-of-range value is flagged at once; an empty or off-grid one only once
 * the user leaves the field, and returning to it is quiet again, so clearing
 * it to retype never sets off the alert. Exponent notation (1e3) is refused.
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
  stepMessage = step === 1 ? 'הזינו מספר שלם' : 'הזינו ערך בקפיצות של {step}',
}: NumberFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [own, setOwn] = useState(String(defaultValue));
  const [touched, setTouched] = useState(false);
  const raw = controlled !== undefined ? String(controlled) : own;
  const value = Number(raw);
  const empty = raw.trim() === '';
  const outOfRange = !empty && (Number.isNaN(value) || value < min || value > max);
  // position on the step grid, counted from min
  const gridPos = (v: number) => (v - min) / step;
  const onGrid = (v: number) => Math.abs(gridPos(v) - Math.round(gridPos(v))) < 1e-9;
  const offStep = !empty && !outOfRange && !onGrid(value);
  const error = outOfRange || (touched && empty) ? 'range' : touched && offStep ? 'step' : null;
  const invalid = error != null;

  const commit = (next: string) => {
    if (/[eE+]/.test(next)) return; // no exponent notation in a quantity
    if (controlled === undefined) setOwn(next);
    const n = Number(next);
    if (next.trim() !== '' && !Number.isNaN(n)) onValueChange?.(n);
  };

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  // round to the step's precision so 0.1 + 0.2 never shows 0.30000000004
  const precision = (String(step).split('.')[1] ?? '').length;
  /** k steps along the grid; from an off-grid value the first step lands on the grid */
  const nudge = (dir: 1 | -1, k = 1) => {
    // from an empty field the first step lands on min, as ArrowUp/ArrowDown do
    if (Number.isNaN(value) || empty) return commit(String(min));
    const base = value;
    const n = gridPos(base);
    const idx = onGrid(base) ? Math.round(n) + dir * k : dir > 0 ? Math.ceil(n) + k - 1 : Math.floor(n) - k + 1;
    commit(clamp(Number((min + idx * step).toFixed(precision))).toString());
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
      {/* the field counts as touched only when focus leaves the whole stepper, so moving
          between the value and its − / + never sets off the error */}
      <div
        className="field__control stepper"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setTouched(true);
        }}
      >
        <button
          type="button"
          className="stepper__btn"
          aria-label={`הפחתה: ${stepWords}`}
          // a mouse press keeps focus where it is (no blur, no flash of the error)
          onMouseDown={(e) => e.preventDefault()}
          aria-controls={id}
          aria-disabled={disabled || atMin || undefined}
          onClick={() => !disabled && !atMin && nudge(-1)}
        >
          <MinusIcon size={20} strokeWidth={2} />
        </button>
        <input
          id={id}
          name={name}
          type="number"
          className="field__input"
          data-numeric=""
          inputMode={Number.isInteger(step) && Number.isInteger(min) ? 'numeric' : 'decimal'}
          min={min}
          max={max}
          step={step}
          value={raw}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          onFocus={() => setTouched(false)}
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault();
            if (e.key === 'PageUp' || e.key === 'PageDown') {
              e.preventDefault();
              nudge(e.key === 'PageUp' ? 1 : -1, 10);
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
          onMouseDown={(e) => e.preventDefault()}
          aria-controls={id}
          aria-disabled={disabled || atMax || undefined}
          onClick={() => !disabled && !atMax && nudge(1)}
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
            <NumText>
              {error === 'step'
                ? stepMessage.replace('{step}', fmt(step))
                : rangeMessage.replace('{min}', fmt(min)).replace('{max}', fmt(max))}
            </NumText>
          </span>
        </p>
      ) : null}
    </div>
  );
}
