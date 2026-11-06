import type { CSSProperties } from 'react';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { ergonomics, layout, space } from '@/design/tokens';
import { Block, Section } from './Section';

const NB = ' ';

/** A 1:1 ruler: minor tick every 4px, major tick every 16px — the grid itself. */
const ruler: CSSProperties = {
  backgroundImage: [
    'repeating-linear-gradient(to left, var(--ink) 0 1px, transparent 1px 0.25rem)',
    'repeating-linear-gradient(to left, var(--ink) 0 1px, transparent 1px 1rem)',
  ].join(','),
  backgroundSize: '100% 0.375rem, 100% 0.75rem',
  backgroundPosition: 'bottom, bottom',
  backgroundRepeat: 'no-repeat',
};

/** Reads down, then across (CSS columns), so the series grows in one direction. */
function SpaceScale() {
  const entries = Object.entries(space).filter(([k]) => k !== '0') as Array<[string, number]>;
  return (
    <ol className="gap-x-(--gutter) lg:columns-2" aria-label="סולם המרווחים">
      {entries.map(([k, px]) => (
        <li
          key={k}
          className="grid break-inside-avoid grid-cols-[minmax(5.5rem,auto)_minmax(4rem,auto)_1fr] items-end gap-x-4 gap-y-2 border-b border-line py-3 max-sm:grid-cols-[auto_1fr]"
        >
          <Num className="whitespace-nowrap text-caption font-medium">space-{k}</Num>
          <span className="flex items-baseline justify-end gap-3 whitespace-nowrap sm:justify-start">
            <Num className="text-caption text-ink-2">{px}px</Num>
            <Num className="text-micro text-ink-3 sm:hidden">p-{k}</Num>
          </span>
          <span className="flex items-end gap-2 max-sm:col-span-2">
            <span
              className="block h-3 shrink-0 bg-[color-mix(in_oklab,var(--color-sprout)_45%,transparent)]"
              style={{ inlineSize: `${px / 16}rem`, ...ruler }}
              aria-hidden="true"
            />
            <Num className="whitespace-nowrap text-micro text-ink-3 max-sm:hidden">p-{k}</Num>
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
        <figure key={f.w} className="grid min-w-0 gap-3" style={{ inlineSize: `min(100%, ${(f.w * scale) / 16}rem)` }}>
          <div
            className="relative w-full overflow-hidden rounded-sm border border-line-strong bg-surface"
            style={{ aspectRatio: `${f.w} / ${Math.min(f.h, 900)}` }}
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
          {/* three lines for every frame (one fact per line), so frames and captions align */}
          <figcaption className="grid gap-1 text-caption">
            <span className="font-bold whitespace-nowrap">
              {f.label} · <Num>{f.w}</Num>
            </span>
            <span className="whitespace-nowrap text-ink-2">
              <NumText>{`${f.columns} עמודות`}</NumText>
            </span>
            <span className="whitespace-nowrap text-ink-2">
              <NumText>{`שוליים ${f.margin} · מרווח ${f.gutter}`}</NumText>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Touch areas: the three sizes, then the real button at each of them. */
function Targets() {
  const items = [
    { px: 24, title: 'מינימום', note: 'WCAG 2.2 · 2.5.8' },
    { px: ergonomics.default.target, title: 'ברירת המחדל', note: 'כל כפתור, צ׳יפ ושדה' },
    { px: ergonomics.sun.target, title: 'מצב שמש', note: 'כפפות עבודה, יד רטובה, שמש של צהריים' },
  ];
  return (
    <div className="grid gap-12">
      <ul className="flex flex-wrap items-end gap-x-12 gap-y-8">
        {items.map((t) => (
          <li key={t.px} className="grid justify-items-start gap-3">
            <span
              className="relative grid place-items-center rounded-full border-2 border-dashed border-line-strong"
              style={{ inlineSize: `${t.px / 16}rem`, blockSize: `${t.px / 16}rem` }}
              aria-hidden="true"
            >
              <span className="size-2 rounded-full bg-ink" />
            </span>
            <span className="grid gap-1 text-caption">
              <span className="font-bold">
                <Num>{t.px}</Num>
                {NB}פיקסלים · {t.title}
              </span>
              <span className="text-ink-2">{t.note}</span>
            </span>
          </li>
        ))}
      </ul>
      {/* specimens, not controls: the same primary button at 44 and at 56 */}
      <div className="flex flex-wrap items-end gap-6" aria-hidden="true">
        {[ergonomics.default.target, ergonomics.sun.target].map((px) => (
          <figure
            key={px}
            className="grid justify-items-start gap-3"
            style={{ '--target': `${px / 16}rem` } as CSSProperties}
          >
            <span className="btn btn--primary">
              <span className="btn__label">איסוף מסניף</span>
              <span className="btn__bud">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5.5" />
                  <path d="M11 6l-6 6 6 6" />
                </svg>
              </span>
            </span>
            <figcaption className="text-micro text-ink-2">
              גובה&nbsp;<Num>{px}</Num>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function SpaceSection() {
  return (
    <Section
      id="space"
      surface="soil"
      intro={
        <p>
          <NumText>
            {
              'רשת של 4 פיקסלים, כמו שורות שתילה: מרווח קבוע, צמיחה צפויה. כל ריפוד, רווח וגודל מטרה הוא כפולה של 4. הסולם שלמטה מוצג בקנה מידה 1:1.'
            }
          </NumText>
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="סולם המרווחים" note={<NumText>{'קנה מידה 1:1 · שנתות כל 4 ו־16 פיקסלים'}</NumText>}>
          <SpaceScale />
        </Block>
        <Block title="רשת עמודות" note={<NumText>{'4 · 8 · 12 עמודות · רוחב מרבי 1440'}</NumText>}>
          <GridFrames />
          <p className="max-w-[62ch] text-caption text-ink-2">
            <NumText>
              {`מרווח בין מקטעים: ${layout.section.mobile} פיקסלים בנייד, ${layout.section.tablet} בטאבלט, ${layout.section.desktop} בדסקטופ. השוליים והמרווחים הם משתני CSS, לא מספרי קסם.`}
            </NumText>
          </p>
        </Block>
        <Block title="אזורי מגע" note="לאגודל, לכפפה ולשמש של צהריים">
          <Targets />
        </Block>
      </div>
    </Section>
  );
}
