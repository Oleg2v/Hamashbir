import { Num } from '@/components/ui/Num';
import { ergonomics, layout, space } from '@/design/tokens';
import { Block, Section } from './Section';

/** A 1:1 ruler: minor tick every 4px, major tick every 16px – the grid itself. */
const ruler = {
  backgroundImage: [
    'repeating-linear-gradient(to left, var(--ink) 0 1px, transparent 1px 0.25rem)',
    'repeating-linear-gradient(to left, var(--ink) 0 1px, transparent 1px 1rem)',
  ].join(','),
  backgroundSize: '100% 0.375rem, 100% 0.75rem',
  backgroundPosition: 'bottom, bottom',
  backgroundRepeat: 'no-repeat',
} as const;

function SpaceScale() {
  const entries = Object.entries(space).filter(([k]) => k !== '0') as Array<[string, number]>;
  return (
    <ol className="grid gap-x-(--gutter) gap-y-2 lg:grid-cols-2" aria-label="סולם המרווחים">
      {entries.map(([k, px]) => (
        <li
          key={k}
          className="grid grid-cols-[4.5rem_4rem_1fr] items-end gap-4 border-b border-line py-2 sm:grid-cols-[5.5rem_4.5rem_1fr]"
        >
          <Num className="text-caption font-medium">space-{k}</Num>
          <Num className="text-caption text-ink-2">{px}px</Num>
          <span className="flex items-end gap-2">
            <span
              className="block h-3 shrink-0 bg-[color-mix(in_oklab,var(--color-sprout)_45%,transparent)]"
              style={{ inlineSize: `${px / 16}rem`, ...ruler }}
              aria-hidden="true"
            />
            <Num className="text-micro text-ink-3">p-{k}</Num>
          </span>
        </li>
      ))}
    </ol>
  );
}

const frames = [
  { w: 360, h: 640, ...layout.grid[0] },
  { w: 768, h: 1024, ...layout.grid[1] },
  { w: 1440, h: 900, ...layout.grid[3] },
];

function GridFrames() {
  const scale = 0.25;
  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-8">
      {frames.map((f) => (
        <figure key={f.w} className="grid gap-3">
          <div
            className="relative overflow-hidden rounded-sm border border-line-strong bg-surface"
            style={{ inlineSize: `${(f.w * scale) / 16}rem`, blockSize: `${(Math.min(f.h, 900) * scale) / 16}rem` }}
            aria-hidden="true"
          >
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: `repeat(${f.columns}, 1fr)`,
                columnGap: `${(f.gutter / f.w) * 100}%`,
                paddingInline: `${(f.margin / f.w) * 100}%`,
              }}
            >
              {Array.from({ length: f.columns }, (_, i) => (
                <span key={i} className="bg-[color-mix(in_oklab,var(--color-sprout)_32%,transparent)]" />
              ))}
            </div>
          </div>
          <figcaption className="grid gap-0.5 text-caption">
            <span className="font-bold">
              {f.label} · <Num>{f.w}</Num>
            </span>
            <span className="text-ink-2">
              <Num>{f.columns}</Num> עמודות · שוליים <Num>{f.margin}</Num> · מרווח <Num>{f.gutter}</Num>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Targets() {
  const items = [
    { px: 24, title: 'מינימום', note: 'WCAG 2.2 · 2.5.8' },
    { px: ergonomics.default.target, title: 'ברירת המחדל', note: 'כל כפתור, צ׳יפ ושדה' },
    { px: ergonomics.sun.target, title: 'מצב שמש', note: 'כפפות עבודה, יד רטובה' },
  ];
  return (
    <ul className="flex flex-wrap items-end gap-x-12 gap-y-8">
      {items.map((t) => (
        <li key={t.px} className="grid justify-items-start gap-3">
          <span
            className="relative grid place-items-center rounded-full border-2 border-dashed border-line-strong"
            style={{ inlineSize: `${t.px / 16}rem`, blockSize: `${t.px / 16}rem` }}
            aria-hidden="true"
          >
            <span className="size-1.5 rounded-full bg-ink" />
          </span>
          <span className="grid gap-0.5 text-caption">
            <span className="font-bold">
              <Num>{t.px}</Num> פיקסלים · {t.title}
            </span>
            <span className="text-ink-2">{t.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SpaceSection() {
  return (
    <Section
      id="space"
      intro={
        <p>
          רשת של 4 פיקסלים, כמו שורות שתילה: מרווח קבוע, צמיחה צפויה. כל מידה בממשק היא כפולה של 4 – ריפוד, רווח,
          גובה שורה, גודל מטרה. הסולם שלמטה מוצג בקנה מידה 1:1.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="סולם המרווחים" note="קנה מידה 1:1 · שנתות כל 4 ו־16 פיקסלים">
          <SpaceScale />
        </Block>
        <Block title="רשת עמודות" note="4 · 8 · 12 עמודות · רוחב מרבי 1440">
          <GridFrames />
          <p className="max-w-[62ch] text-caption text-ink-2">
            מרווח בין מקטעים: <Num>{layout.section.mobile}</Num> בנייד, <Num>{layout.section.tablet}</Num> בטאבלט,{' '}
            <Num>{layout.section.desktop}</Num> בדסקטופ. השוליים והמרווחים הם משתני CSS, לא מספרי קסם.
          </p>
        </Block>
        <Block title="מטרות מגע" note="נגישים לאגודל, לכפפה ולשמש של צהריים">
          <Targets />
        </Block>
      </div>
    </Section>
  );
}
