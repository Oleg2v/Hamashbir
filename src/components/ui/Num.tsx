import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type NumProps = ComponentPropsWithoutRef<'bdi'> & {
  /** IBM Plex Mono + tabular figures (default). Set false for inline prose numbers. */
  mono?: boolean;
};

/**
 * Every number in the product goes through <Num>: a <bdi> isolate so digits,
 * separators and units never reorder inside RTL text (WCAG 1.3.2), set in
 * IBM Plex Mono with tabular figures so columns of quantities line up.
 */
export function Num({ className, mono = true, dir = 'ltr', ...props }: NumProps) {
  return <bdi dir={dir} className={cn(mono && 'num', className)} {...props} />;
}
