import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * The style tile travels from the Golan to the Arava: every section is
 * stamped with a real Hamashbir branch and its coordinates, north to south.
 */
export const route = {
  palette: { num: '01', branch: 'אבני איתן', coords: '32.82°N 35.76°E' },
  type: { num: '02', branch: 'קריית שמונה', coords: '33.21°N 35.57°E' },
  space: { num: '03', branch: 'מגדל העמק', coords: '32.68°N 35.24°E' },
  shape: { num: '04', branch: 'בנימינה', coords: '32.52°N 34.95°E' },
  motion: { num: '05', branch: 'תל מונד', coords: '32.26°N 34.92°E' },
  components: { num: '06', branch: 'עין תמר', coords: '30.95°N 35.38°E' },
  stance: { num: '07', branch: 'פארן', coords: '30.36°N 35.15°E' },
} as const;

export type RouteKey = keyof typeof route;

export const sectionTitles: Record<RouteKey, string> = {
  palette: 'צבע',
  type: 'טיפוגרפיה',
  space: 'מרווח ורשת',
  shape: 'צורה ועומק',
  motion: 'תנועה',
  components: 'רכיבים',
  stance: 'עמדה',
};

type SectionProps = {
  id: RouteKey;
  title?: string;
  intro: ReactNode;
  surface?: 'paper' | 'soil';
  className?: string;
  children: ReactNode;
};

/**
 * Section shell: survey line with number + branch stamp, display title at
 * inline-start, intro paragraph across the inline-end half.
 */
export function Section({ id, title, intro, surface = 'paper', className, children }: SectionProps) {
  const r = route[id];
  const heading = title ?? sectionTitles[id];
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-surface={surface}
      className={cn('py-(--section-y)', className)}
    >
      <div className="wrap">
        <header className="grid grid-cols-1 gap-x-(--gutter) gap-y-6 lg:grid-cols-12">
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4 lg:col-span-12">
            <Num className="text-caption font-medium text-ink">{r.num}</Num>
            <span className="text-micro text-ink-2">
              {r.branch} · <Num>{r.coords}</Num>
            </span>
          </div>
          <h2 id={`${id}-title`} className="text-h2 lg:col-span-5">
            {heading}
          </h2>
          <div className="text-lead text-ink-2 lg:col-span-6 lg:col-start-7 lg:pt-3">{intro}</div>
        </header>
        <div className="mt-12 lg:mt-20">{children}</div>
      </div>
    </section>
  );
}

/** Small labelled sub-block inside a section. */
export function Block({
  title,
  note,
  className,
  children,
}: {
  title: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('grid min-w-0 gap-6 [&>*]:min-w-0', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-sans text-title font-bold">{title}</h3>
        {note ? <p className="text-caption text-ink-2">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}
