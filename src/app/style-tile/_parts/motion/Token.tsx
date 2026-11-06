import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/** A code identifier in running Hebrew text: isolated, mono, never split at its hyphens. */
export function Token({ children, className }: { children: ReactNode; className?: string }) {
  return <Num className={cn('whitespace-nowrap', className)}>{children}</Num>;
}
