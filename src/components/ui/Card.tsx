import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type Div = ComponentPropsWithoutRef<'div'>;

/**
 * Card shell. `interactive` lifts on hover; a `.card__link` inside stretches
 * over the whole card (one tab stop) while nested buttons stay reachable.
 */
export function Card({
  interactive,
  force,
  className,
  ...rest
}: ComponentPropsWithoutRef<'article'> & { interactive?: boolean; force?: 'hover' }) {
  return (
    <article
      className={cn('card', className)}
      data-interactive={interactive ? '' : undefined}
      data-force={force}
      {...rest}
    />
  );
}

export const CardMedia = ({ className, ...rest }: Div) => <div className={cn('card__media', className)} {...rest} />;
export const CardBody = ({ className, ...rest }: Div) => <div className={cn('card__body', className)} {...rest} />;
export const CardFooter = ({ className, ...rest }: Div) => <div className={cn('card__footer', className)} {...rest} />;
