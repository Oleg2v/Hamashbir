import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { AlertIcon } from './icons';

type FieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'prefix'> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Unit shown at inline-end, e.g. "דונם". Announced via aria-describedby. */
  suffix?: ReactNode;
  prefix?: ReactNode;
  /** Mono, tabular, LTR value — quantities, dunams, prices. */
  numeric?: boolean;
  force?: 'hover' | 'focus';
};

/**
 * Text field. Label above (never placeholder-as-label), hint and error below,
 * both wired through aria-describedby. Errors pair colour with an icon and
 * words, and never shift layout (inset ring instead of a thicker border).
 */
export function TextField({
  id,
  label,
  hint,
  error,
  suffix,
  prefix,
  numeric,
  force,
  disabled,
  className,
  ...input
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const sufId = suffix ? `${id}-suffix` : undefined;
  const describedBy = [sufId, hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={['field', className].filter(Boolean).join(' ')}
      data-invalid={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control" data-force={force}>
        {prefix ? (
          <span className="field__affix field__affix--lead" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          className="field__input"
          data-numeric={numeric ? '' : undefined}
          inputMode={numeric ? 'decimal' : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          {...input}
        />
        {suffix ? (
          <span className="field__affix" id={sufId}>
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errId}>
          <AlertIcon size={18} strokeWidth={2} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
