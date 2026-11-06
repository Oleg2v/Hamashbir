import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * A code identifier in running Hebrew text: a <code> element, isolated and
 * mono through <Num>. An inline-block, so it moves to the next line whole
 * instead of splitting at its hyphens; only a token wider than the whole line
 * (200% text on a phone) wraps inside, rather than running off the page.
 * Token names are code, not spoken English, so they carry no lang attribute.
 */
export function Token({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code className={cn('inline-block', className)}>
      <Num>{children}</Num>
    </code>
  );
}
