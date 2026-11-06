import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ArrowForwardIcon } from './icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';
type Size = 'md' | 'lg';
type ForcedState = 'hover' | 'focus' | 'active';

type Common = {
  variant?: Variant;
  size?: Size;
  /** Icon inside the bud (primary only). Defaults to the forward arrow. */
  icon?: ReactNode;
  loading?: boolean;
  /** Documentation only: render a live state statically (style tile). */
  force?: ForcedState;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & Omit<ComponentPropsWithoutRef<'button'>, keyof Common>;
type AsLink = Common & Omit<ComponentPropsWithoutRef<typeof Link>, keyof Common> & { href: string };

/**
 * The primary button is a seed: a bud sits at inline-end (left, in Hebrew);
 * on hover/focus it sprouts and fills the pill (clip-path circle, 400ms,
 * ease-out-quint). Secondary is outlined, ghost is inline, icon is round.
 * Every size meets the 44px target; sun mode lifts all buttons to 56px.
 */
export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', size = 'md', icon, loading = false, force, className, children, ...rest } = props;
  const isPrimary = variant === 'primary';
  const cls = cn('btn', `btn--${variant}`, className);

  const inner = (
    <>
      {isPrimary ? <span className="btn__fill" aria-hidden="true" /> : null}
      <span className="btn__label">{children}</span>
      {isPrimary ? (
        <span className="btn__bud" aria-hidden="true">
          {icon ?? <ArrowForwardIcon size={size === 'lg' ? 20 : 18} strokeWidth={2} />}
        </span>
      ) : null}
      {loading ? (
        <span className="btn__loader" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : null}
    </>
  );

  if ('href' in rest && typeof rest.href === 'string') {
    const linkProps = rest as Omit<AsLink, keyof Common>;
    return (
      <Link className={cls} data-size={size} data-force={force} aria-busy={loading || undefined} {...linkProps}>
        {inner}
      </Link>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = rest as Omit<AsButton, keyof Common>;
  return (
    <button
      type={type}
      className={cls}
      data-size={size}
      data-force={force}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      disabled={disabled}
      {...buttonProps}
    >
      {inner}
    </button>
  );
}
