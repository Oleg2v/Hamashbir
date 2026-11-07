import type { CSSProperties, ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { ergonomics, layout, space } from '@/design/tokens';
import { NB } from '@/lib/typography';
import { Block, Section } from './Section';

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

/**
 * Reads down, then across (CSS columns), so the series grows in one direction.
 * A row is a wrapping line (name · px · bar): at normal size it sits on one
 * line, as a grid would. With large text every row reflows the same way, never
 * some rows one way and their neighbours another:
 * - phone: the bar has its own line; the px value and its p- label are one
 *   unbreakable pair. Each row is a size container in caption em, and once the
 *   widest row (space-40: 8 + 5 + 4 mono characters at 0.6em, the p- label in
 *   micro, at most 0.9375 of caption, plus the two gaps) no longer fits on one
 *   line, every row puts the pair on its own line, under the name.
 * - sm and up: the bar's slot is reserved at the widest bar (space-40, 10rem,
 *   with its gap and label), so every row moves its bar under the labels at the
 *   same width, at full 1:1 length; only a line still narrower than the bar
 *   caps it. Nothing runs out of its column.
 */
function SpaceScale() {
  const entries = Object.entries(space).filter(([k]) => k !== '0') as Array<[string, number]>;
  return (
    <ol className="gap-x-(--gutter) lg:columns-2" aria-label="סולם המרווחים">
      {entries.map(([k, px]) => (
        <li
          key={k}
          className="@container/row flex break-inside-avoid flex-wrap items-end gap-x-4 gap-y-2 border-b border-line py-3 text-caption max-sm:items-baseline"
        >
          <Num className="whitespace-nowrap text-caption font-medium sm:min-w-[5.5rem]">space-{k}</Num>
          <span className="flex items-baseline justify-end gap-x-3 whitespace-nowrap max-sm:flex-1 max-sm:@max-[calc(10.1em+1.75rem)]/row:basis-full max-sm:@max-[calc(10.1em+1.75rem)]/row:justify-start sm:min-w-[4rem] sm:justify-start">
            <Num className="text-caption text-ink-2">{px}px</Num>
            <Num className="text-micro text-ink-3 sm:hidden">p-{k}</Num>
          </span>
          <span className="flex min-w-0 flex-wrap items-end gap-2 max-sm:basis-full sm:flex-[1_1_calc(10.5rem+2.3em)]">
            <span
              className="block h-3 max-w-full shrink-0 bg-[color-mix(in_oklab,var(--color-sprout)_45%,transparent)]"
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
        // grid-cols-1 (a minmax(0, 1fr) column): the figure's scaled width holds the frame and its
        // caption; a caption wraps inside it instead of widening the frame off scale
        <figure
          key={f.w}
          className="grid min-w-0 grid-cols-1 gap-3"
          style={{ inlineSize: `min(100%, ${(f.w * scale) / 16}rem)` }}
        >
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
          {/* four lines for every frame, one fact per line, each short enough for the phone
              frame's quarter-scale 90px, so frames stay to scale and frames and captions align */}
          <figcaption className="grid gap-1 text-caption">
            <span className="font-bold">
              {`${f.label}${NB}· `}
              <Num>{f.w}</Num>
            </span>
            <span className="text-ink-2">
              <NumText>{`${f.columns} עמודות`}</NumText>
            </span>
            <span className="text-ink-2">
              <NumText>{`שוליים ${f.margin}`}</NumText>
            </span>
            <span className="text-ink-2">
              <NumText>{`מרווח ${f.gutter}`}</NumText>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Touch areas: the three sizes, then the real button at each of them. */
function Targets() {
  const items: Array<{ px: number; title: string; note: ReactNode }> = [
    // one LTR isolate: through <NumText> the two numbers were isolated apart and the line read „2.5.8 · 2.2 WCAG”
    { px: 24, title: 'מינימום', note: <Num lang="en">{`WCAG${NB}2.2${NB}· 2.5.8`}</Num> },
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
              <span className="text-ink-2">{typeof t.note === 'string' ? <NumText>{t.note}</NumText> : t.note}</span>
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
              'רשת של 4 פיקסלים, כמו שורות שתילה: מרווח קבוע, צמיחה צפויה. כל ריפוד, רווח וגודל אזור מגע הוא כפולה של 4. הסולם שלמטה מוצג בקנה מידה 1:1.'
            }
          </NumText>
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="סולם המרווחים" note={<NumText>{'קנה מידה 1:1 · שנתות כל 4 ו־16 פיקסלים'}</NumText>}>
          <SpaceScale />
        </Block>
        <Block title="רשת עמודות" note={<NumText>{'4 · 8 · 12 עמודות · רוחב מרבי 1440px'}</NumText>}>
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
