import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';

/**
 * The style tile travels north to south, from the Upper Galilee and the Golan
 * to the Arava: every section is stamped with a real Hamashbir branch and its
 * coordinates (latitude strictly decreasing down the page).
 */
export const route = {
  palette: { num: '01', branch: 'קריית שמונה', coords: '33.21°N 35.57°E' },
  imagery: { num: '02', branch: 'אבני איתן', coords: '32.82°N 35.77°E' },
  type: { num: '03', branch: 'מרלו״ג מגדל העמק', coords: '32.67°N 35.24°E' },
  space: { num: '04', branch: 'בנימינה', coords: '32.52°N 34.95°E' },
  shape: { num: '05', branch: 'בית שאן', coords: '32.50°N 35.50°E' },
  motion: { num: '06', branch: 'השרון (תל מונד)', coords: '32.25°N 34.92°E' },
  components: { num: '07', branch: 'עין תמר', coords: '30.94°N 35.37°E' },
  stance: { num: '08', branch: 'פארן', coords: '30.36°N 35.15°E' },
} as const;

export type RouteKey = keyof typeof route;

export const sectionTitles: Record<RouteKey, string> = {
  palette: 'צבע',
  imagery: 'תמונה',
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

/**
 * Sub-block inside a section. Heading hierarchy (docs/design-system.md):
 * h2 section = Suez text-h2 · h3 block = Suez text-h3 · h4 statement = Suez
 * text-title · h4 card title = Assistant 800 text-lead. The note sits directly
 * under its own title (never pushed to the far edge, where it would read as
 * the neighbour's subtitle). `action` holds block-level controls.
 */
export function Block({
  title,
  note,
  action,
  className,
  children,
}: {
  title: string;
  note?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('grid min-w-0 gap-8 [&>*]:min-w-0', className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="grid max-w-[46rem] gap-2">
          <h3 className="text-h3">{title}</h3>
          {note ? <p className="text-caption text-ink-2">{note}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
