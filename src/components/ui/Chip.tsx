import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ShieldIcon } from './icons';
import { Num } from './Num';

export type ChipTone = 'neutral' | 'in' | 'low' | 'out' | 'water' | 'field' | 'sprout' | 'wheat' | 'harvest';

type ChipProps = ComponentPropsWithoutRef<'span'> & {
  tone?: ChipTone;
  dot?: boolean;
  icon?: ReactNode;
};

/**
 * Status chip — never interactive. Hue tones (sprout/water/field/harvest/wheat)
 * mean a stage or department; stock tones (in/low/out) are shapes in ink
 * (● ◐ ○), so a dot never carries two meanings.
 */
/** Status chip – never interactive. Colour is always backed by words. */
export function Chip({ tone = 'neutral', dot = true, icon, className, children, ...rest }: ChipProps) {
  return (
    <span className={cn('chip', className)} data-tone={tone} {...rest}>
      {icon ?? (dot ? <span className="chip__dot" aria-hidden="true" /> : null)}
      {children}
    </span>
  );
}

/** Dashed = placeholder. Every demo number in the product carries one. */
export function DemoTag({ children = 'נתוני דמו', className }: { children?: ReactNode; className?: string }) {
  return <span className={cn('chip chip--demo', className)}>{children}</span>;
}

/** The crop-protection gate. */
export function AgroChip({ children = 'דורש אישור אגרונום' }: { children?: ReactNode }) {
  return (
    <span className="chip chip--agro">
      <ShieldIcon size={16} strokeWidth={2} />
      {children}
    </span>
  );
}

const stockCopy = {
  in: 'במלאי בסניף',
  low: 'מלאי נמוך בסניף',
  out: 'אזל בסניף',
} as const;

/**
 * The stock chip – the branch network made visible.
 * "במלאי בסניף עין תמר · 3 ק״מ ממך"
 */
export function StockChip({
  status,
  branch,
  km,
  className,
}: {
  status: keyof typeof stockCopy;
  branch: string;
  km?: number;
  className?: string;
}) {
  return (
    <Chip tone={status} className={className}>
      <span>
        {/* one text node: a lone space between two expressions is dropped from the accessibility tree */}
        {`${stockCopy[status]} ${branch}`}
        {km != null ? (
          <>
            {' · '}
            <Num>{km.toLocaleString('he-IL')}</Num>
            {'\u00a0'}ק״מ ממך
          </>
        ) : null}
      </span>
    </Chip>
  );
}
