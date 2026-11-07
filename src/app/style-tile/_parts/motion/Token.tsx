import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * A code identifier in running Hebrew text: a <code> element, isolated and
 * mono through <Num>. An inline-block, so it moves to the next line whole
 * instead of splitting at its hyphens; only a token wider than the whole line
 * (200% text on a phone) wraps inside, rather than running off the page.
 * Token names are code, not spoken English, so they carry no lang attribute.
 *
 * `after` is the punctuation that follows the token („in-quint,” or
 * „ease-out-quint ·” with its no-break space). Chrome keeps a line break
 * opportunity on both sides of an inline-block, even beside a no-break space
 * or a word joiner, so the mark goes inside the box: after the isolate, on the
 * token's RTL side, in the running text's font. It never opens a line.
 */
export function Token({ children, className, after }: { children: ReactNode; className?: string; after?: string }) {
  return (
    <code className={cn('inline-block', className)}>
      <Num>{children}</Num>
      {after ? <span className="font-sans">{after}</span> : null}
    </code>
  );
}
