import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * A code identifier in running Hebrew text: a <code> element, isolated and
 * mono through <Num>, never split at its hyphens. Token names are code, not
 * spoken English, so they carry no lang attribute.
 */
export function Token({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code className={cn('whitespace-nowrap', className)}>
      <Num>{children}</Num>
    </code>
  );
}
