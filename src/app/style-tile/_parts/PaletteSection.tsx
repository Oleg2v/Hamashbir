import { Fragment, type CSSProperties } from 'react';
import { StageIcon } from '@/components/illustrations/StageIcons';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { Verdict } from '@/components/ui/Verdict';
import { contrast, grade, oklchString, rgbString, sampleRamp, type Grade } from '@/design/color';
import {
  ndvi,
  palette,
  proportions,
  stages,
  surfaces,
  type PaletteKey,
  type SemanticKey,
  type SurfaceKey,
} from '@/design/tokens';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';
import { Block, Section } from './Section';

const INK = palette.soil.hex;
const PAPER = palette.paper.hex;

/**
 * Best text colour for a swatch: soil or paper, falling back to pure black or
 * white when neither reaches 4.5:1 (Harvest Red is the one that needs it).
 */
function bestText(hex: string) {
  const pick = (cands: string[]) =>
    cands.map((c) => ({ color: c, ratio: contrast(hex, c) })).sort((a, b) => b.ratio - a.ratio)[0];
  const brand = pick([INK, PAPER]);
  return brand.ratio >= 4.5 ? brand : pick([surfaces.sun.ink, surfaces.sun.canvas]);
}

const gradeLabel: Record<Grade, string> = {
  AAA: 'AAA',
  AA: 'AA',
  AA18: 'גדול בלבד',
  fail: 'נכשל',
};

function Ratio({ value, className }: { value: number; className?: string }) {
  return <Num className={className}>{value.toFixed(2)}:1</Num>;
}

/* ───────────────────────── Soil core: the eight colours ───────────────────────── */

function SoilCore() {
  const order = proportions.map((p) => p.key);
  return (
    <ol className="overflow-hidden rounded-lg border border-line" aria-label="שמונת צבעי המותג לפי היקף שימוש">
      {order.map((key) => {
        const c = palette[key];
        const text = bestText(c.hex);
        const share = proportions.find((p) => p.key === key)?.share ?? 0;
        return (
          <li
            key={key}
            className="grid grid-cols-2 items-end gap-x-6 gap-y-3 px-5 py-5 sm:grid-cols-4 lg:min-h-28 lg:grid-cols-12 lg:items-center lg:px-8"
            style={{ backgroundColor: c.hex, color: text.color }}
          >
            <div className="col-span-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:col-span-4 lg:col-span-3">
              <span className="font-display text-h3 leading-none">{c.he}</span>
              <span className="text-caption font-semibold" lang="en" dir="ltr">
                {c.en}
              </span>
            </div>
            <dl className="contents">
              {/* the value lines wrap between their numbers (200% text). From lg they may first run on
                  into the gutter, as the longest oklch() does in sun mode at 1024px, so a line wraps
                  only where it would reach the next column */}
              <div className="col-span-2 grid gap-0.5 sm:col-span-2 lg:col-span-3 lg:-me-6">
                <dt className="sr-only">ערכי צבע</dt>
                <dd>
                  <Num className="text-body font-semibold">{c.hex}</Num>
                </dd>
                <dd>
                  <Num className="text-micro">rgb {rgbString(c.hex)}</Num>
                </dd>
                <dd>
                  <Num className="text-micro">{oklchString(c.hex)}</Num>
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-2 lg:col-span-4">
                <dt className="sr-only">תפקיד</dt>
                <dd className="text-caption font-semibold">
                  <NumText>{c.role}</NumText>
                </dd>
              </div>
              <div className="col-span-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:col-span-2 lg:col-span-2 lg:grid lg:justify-items-end lg:gap-1">
                <dt className="sr-only">היקף שימוש וניגודיות</dt>
                <dd>
                  <Num className="text-caption font-semibold">{share}%</Num>&nbsp;
                  <span className="text-micro">מהמסך</span>
                </dd>
                <dd className="text-micro">
                  טקסט <Ratio value={text.ratio} className="font-semibold" />
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}

/* ───────────────────────── Proportions ───────────────────────── */

function Proportions() {
  return (
    <figure className="grid gap-4">
      <div className="flex h-12 overflow-hidden rounded-full border border-line" aria-hidden="true">
        {proportions.map((p) => (
          <span key={p.key} style={{ flexBasis: `${p.share}%`, backgroundColor: palette[p.key].hex }} />
        ))}
      </div>
      <figcaption>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-caption">
          {proportions.map((p) => (
            <li key={p.key} className="inline-flex items-center gap-2">
              <span
                className="size-3 rounded-full border border-line-strong"
                style={{ backgroundColor: palette[p.key].hex }}
                aria-hidden="true"
              />
              {palette[p.key].he} <Num className="text-ink-2">{p.share}%</Num>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-[60ch] text-caption text-ink-2">
          <NumText>{'נבט הוא צבע הדגשה, לא מילוי: מעל כ־5% מהמסך הוא מפסיק לומר „כאן פועלים”.'}</NumText>
        </p>
      </figcaption>
    </figure>
  );
}

/* ───────────────────────── NDVI ───────────────────────── */

/** Open-field potato, spring: emergence → canopy → senescence before lifting (נתוני דמו). */
const weekly = [0.12, 0.15, 0.22, 0.33, 0.45, 0.56, 0.64, 0.71, 0.77, 0.82, 0.84, 0.8, 0.7, 0.52];

const coverage = [
  { label: 'שלוחת טפטוף 16 מ״מ', v: 0.86 },
  { label: 'קרטון ייצוא לפלפל, 5 ק״ג', v: 0.48 },
  { label: 'מסנן דיסקים 2״', v: 0.17 },
];

/** A tick pinned to a value on the ramp: centred, except at the two ends, which sit flush with its edges. */
function Pin({ at, edge, children }: { at: number; edge?: 'start' | 'end'; children: React.ReactNode }) {
  return (
    <span
      className="absolute top-0 grid gap-1 whitespace-nowrap"
      style={{
        insetInlineStart: edge === 'end' ? undefined : `${at * 100}%`,
        insetInlineEnd: edge === 'end' ? 0 : undefined,
        justifyItems: edge === 'start' ? 'start' : edge === 'end' ? 'end' : 'center',
        // centre on the value; --dir-sign keeps it right in RTL and LTR
        translate: edge ? undefined : 'calc(-50% * var(--dir-sign)) 0',
      }}
    >
      {children}
    </span>
  );
}

const vars = (o: Record<string, string>) => o as CSSProperties;
const pct = (x: number) => `${Math.round(x * 1e5) / 1e3}%`;

/** A stretch of the ramp, as fractions of its length from inline-start. */
type Span = { from: number; to: number };
type Edge = 'start' | 'end' | null;

/**
 * The room a stop label has on its row: halfway to the next label on that row, or up to the
 * ramp's edge. On two rows the lower row also keeps clear of the upper row's marks, which run
 * down past it.
 */
function room(i: number, rows: 1 | 2): Span {
  const at = (j: number) => (j >= 0 && j < ndvi.stops.length ? ndvi.stops[j].at : undefined);
  const here = ndvi.stops[i].at;
  const prev = at(i - rows);
  const next = at(i + rows);
  let from = prev === undefined ? 0 : (prev + here) / 2;
  let to = next === undefined ? 1 : (here + next) / 2;
  if (rows === 2 && i % 2 === 1) {
    from = Math.max(from, at(i - 1) ?? 0);
    to = Math.min(to, at(i + 1) ?? 1);
  }
  return { from, to };
}

/**
 * A label's box in its room (stops sit inside the ramp): the widest stretch centred on the stop,
 * so the label centres on it. A label whose room reaches a ramp edge may run past that box toward
 * its other side, flush against the edge – the first label flush start, the last flush end –
 * instead of crossing it; past its room's width a label wraps.
 */
function place(at: number, { from, to }: Span) {
  const half = Math.min(at - from, to - at);
  const edge: Edge = at - from <= to - at ? (from === 0 ? 'start' : null) : to === 1 ? 'end' : null;
  return {
    start: pct(at - half),
    end: pct(1 - at - half),
    max: edge ? pct((to - from) / (2 * half)) : '100%',
    edge,
  };
}

const textAlign = { start: 'text-start', end: 'text-end', none: 'text-center' } as const;
const textAlignTwoRows = {
  start: '@max-[12em]:text-start',
  end: '@max-[12em]:text-end',
  none: '@max-[12em]:text-center',
} as const;

/**
 * The stop labels over their marks, in one row while the ramp is at least 12em of label text
 * across; narrower (200% text on a phone) every other label drops to a second row, which doubles
 * each label's room. A mark always stands on its stop, wherever its label sits.
 */
function StopLabels() {
  return (
    <div className="grid min-h-12 grid-cols-1 content-start gap-y-1">
      {ndvi.stops.map((s, i) => {
        const one = place(s.at, room(i, 1));
        const two = place(s.at, room(i, 2));
        const lower = i % 2 === 1;
        return (
          <Fragment key={s.at}>
            <span
              className={cn(
                'col-start-1 row-start-1 flex self-end ms-(--ms) me-(--me) @max-[12em]:ms-(--ms-2) @max-[12em]:me-(--me-2)',
                lower && '@max-[12em]:row-start-2',
                one.edge === 'end' && 'flex-row-reverse',
                two.edge === 'end' ? '@max-[12em]:flex-row-reverse' : one.edge === 'end' && '@max-[12em]:flex-row',
              )}
              style={vars({ '--ms': one.start, '--me': one.end, '--ms-2': two.start, '--me-2': two.end })}
            >
              {/* auto margins centre it; wider than its box, it sits flush at the box's start (end) */}
              <span
                className={cn(
                  'mx-auto max-inline-(--max) shrink-0 font-semibold @max-[12em]:max-inline-(--max-2)',
                  textAlign[one.edge ?? 'none'],
                  textAlignTwoRows[two.edge ?? 'none'],
                )}
                style={vars({ '--max': one.max, '--max-2': two.max })}
              >
                {s.label}
              </span>
            </span>
            <span
              className={cn(
                'col-start-1 row-start-2 min-h-3 w-px justify-self-start bg-ink-2',
                lower ? '@max-[12em]:row-start-3' : '@max-[12em]:row-end-4',
              )}
              style={{ marginInlineStart: `calc(${pct(s.at)} - 0.5px)` }}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

function Ndvi() {
  return (
    <div className="grid gap-12">
      <figure className="grid gap-2">
        {/* a size container in label text: the stop labels and figures lay out by how much fits across */}
        <div className="@container grid gap-2 text-micro" aria-hidden="true">
          <StopLabels />
          <div className="h-8 rounded-full" style={{ backgroundImage: 'var(--ndvi-inline)' }} />
          <div className="relative h-8 text-ink-2">
            {ndvi.ticks.map((t, i) => (
              <Pin key={t} at={t} edge={i === 0 ? 'start' : i === ndvi.ticks.length - 1 ? 'end' : undefined}>
                <span
                  className={
                    i === 0
                      ? 'ms-0 h-2 w-px bg-line-strong'
                      : i === ndvi.ticks.length - 1
                        ? 'ms-auto h-2 w-px bg-line-strong'
                        : 'mx-auto h-2 w-px bg-line-strong'
                  }
                />
                {/* a figure gives way before it touches a neighbour – under 16em across the two beside
                    the end figures, under 11em the middle pair too; every mark stays */}
                <Num
                  className={
                    i === 1 || i === ndvi.ticks.length - 2
                      ? '@max-[16em]:invisible'
                      : i > 0 && i < ndvi.ticks.length - 1
                        ? '@max-[11em]:invisible'
                        : undefined
                  }
                >
                  {t.toFixed(1)}
                </Num>
              </Pin>
            ))}
          </div>
        </div>
        <figcaption className="mt-2 max-w-[64ch] text-caption text-ink-2">
          <NumText>
            {
              'מדד צמחייה מנורמל (NDVI): אדמה חשופה סביב 0.1, צמיחה פעילה סביב 0.6, חופה מלאה סביב 0.85 – ערך 1.0 לא מתקבל בשדה. בעברית הרמפה צומחת מימין לשמאל, כמו הקריאה וכמו העונה; האינטרפולציה ב־OKLCH, כדי שהגוונים באמצע יישארו מאירים ולא בוציים.'
            }
          </NumText>
        </figcaption>
        <p className="sr-only">רמפת NDVI: אדמה חשופה בערך 0.1, צמחייה דלילה 0.35, צמיחה פעילה 0.6, חופה מלאה 0.85.</p>
      </figure>

      <div className="grid gap-x-(--gutter) gap-y-12 lg:grid-cols-12">
        <figure className="grid content-start gap-3 lg:col-span-7">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-caption font-bold">{`שימוש: מפת חום שבועית${NB}· משק אחר: תפוח אדמה, שדה פתוח, אביב`}</span>
            <DemoTag />
          </figcaption>
          {/* 5 then 7 per row (sun-mode type floors included), but never a tile narrower than its
              value – four mono figures, 2.4em – and its padding: at 200% text a row takes fewer,
              wider tiles. (The 0.1px keeps exactly 5 or 7 from rounding down to one fewer.) */}
          <ol
            className="grid gap-1 text-micro [--cols:5] [--pad:calc(var(--spacing)*2)] sm:[--cols:7]"
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(max((100% - (var(--cols) - 1) * var(--spacing)) / var(--cols) - 0.1px, 2.4em + 2 * var(--pad)), 1fr))',
            }}
            aria-label="NDVI לפי שבוע, נתוני דמו"
          >
            {weekly.map((v, i) => {
              const bg = sampleRamp(ndvi.stops, v);
              const fg = bestText(bg);
              return (
                <li
                  key={i}
                  className="grid aspect-[4/5] content-between rounded-xs p-(--pad)"
                  style={{ backgroundColor: bg, color: fg.color }}
                >
                  <span className="text-micro font-semibold leading-none">
                    {/* a plain space: where a tile is too narrow (200% text), the number drops under שב׳ */}
                    <span aria-hidden="true" className="max-sm:hidden">
                      {'שב׳ '}
                    </span>
                    <span className="sr-only">שבוע{NB}</span>
                    <Num>{i + 1}</Num>
                  </span>
                  <Num className="text-micro leading-none">{v.toFixed(2)}</Num>
                </li>
              );
            })}
          </ol>
        </figure>
        <figure className="grid content-start gap-4 lg:col-span-5">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-caption font-bold">שימוש: כיסוי מלאי מול ביקוש מתוכנן</span>
            <DemoTag />
          </figcaption>
          {coverage.map((row) => (
            <div key={row.label} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4 text-caption">
                <span className="font-semibold">
                  <NumText>{row.label}</NumText>
                </span>
                <Num className="text-ink-2">{Math.round(row.v * 100)}%</Num>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{ inlineSize: `${row.v * 100}%`, backgroundColor: sampleRamp(ndvi.stops, row.v) }}
                />
              </div>
            </div>
          ))}
        </figure>
      </div>
    </div>
  );
}

/* ───────────────────────── Season spine ───────────────────────── */

function SeasonSpine() {
  return (
    <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-5 sm:gap-4" aria-label="חמשת שלבי העונה">
      {/* the spine: horizontal from sm up, vertical through the circle centres on phones */}
      <span className="absolute inset-x-[10%] top-8 hidden h-px bg-line-strong sm:block" aria-hidden="true" />
      <span className="absolute inset-y-8 start-8 w-px bg-line-strong sm:hidden" aria-hidden="true" />
      {stages.map((s, i) => {
        const hex = palette[s.color].hex;
        const fg = bestText(hex);
        return (
          <li key={s.id} className="relative flex items-center gap-4 sm:grid sm:justify-items-center sm:text-center">
            <span
              className="relative grid size-16 shrink-0 place-items-center rounded-full ring-4 ring-canvas"
              style={{ backgroundColor: hex, color: fg.color }}
              aria-hidden="true"
            >
              <StageIcon stage={s.id} size={28} />
            </span>
            <span className="grid gap-1">
              <span className="text-micro text-ink-2">
                שלב&nbsp;<Num>{String(i + 1).padStart(2, '0')}</Num>
              </span>
              <span className="font-display text-title leading-tight">{s.he}</span>
              <span className="text-caption text-ink-2">{s.dept}</span>
              <Num className="text-micro text-ink-3">{s.color}</Num>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ───────────────────────── Contrast matrix ───────────────────────── */

const inkRows: Array<{ key: SemanticKey; he: string }> = [
  { key: 'ink', he: 'דיו' },
  { key: 'ink2', he: `דיו${NB}2` },
  { key: 'ink3', he: `דיו${NB}3` },
  { key: 'link', he: 'קישור' },
  { key: 'sproutInk', he: 'דיו־נבט' },
  { key: 'waterInk', he: 'דיו־מים' },
  { key: 'harvestInk', he: 'דיו־קטיף' },
  { key: 'wheatInk', he: 'דיו־חיטה' },
];

const bgCols: Array<{ key: SemanticKey; he: string }> = [
  { key: 'canvas', he: 'רקע' },
  { key: 'surface', he: 'משטח' },
  { key: 'sunken', he: 'שקוע' },
];

const surfaceNames: Record<SurfaceKey, string> = { paper: 'נייר', soil: 'אדמה', sun: 'מצב שמש' };

function Matrix({ surface }: { surface: SurfaceKey }) {
  const set = surfaces[surface] as Record<SemanticKey, string>;
  const minRatio = Math.min(...inkRows.flatMap((r) => bgCols.map((c) => contrast(set[r.key], set[c.key]))));
  // auto layout inside a scroller: at 200% text the columns keep their content and the
  // table scrolls sideways within its panel instead of overprinting (WCAG 1.4.4)
  return (
    <div className="table-wrap">
      <table className="w-full border-separate border-spacing-0 text-caption">
        <caption className="pb-3 text-start">
          <span className="font-display text-title">{surfaceNames[surface]}</span>{' '}
          <span className="text-micro text-ink-2">
            · מינימום <Ratio value={minRatio} />
          </span>
        </caption>
        <thead>
          <tr>
            <th scope="col" className="pb-2 text-start font-semibold text-ink-2">
              <span className="sr-only">צבע טקסט</span>
            </th>
            {bgCols.map((c) => (
              <th key={c.key} scope="col" className="pb-2 text-start text-micro font-semibold text-ink-2">
                {c.he}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inkRows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="py-1 pe-2 text-start text-micro font-semibold text-ink-2">
                <NumText>{r.he}</NumText>
              </th>
              {bgCols.map((c) => {
                const ratio = contrast(set[r.key], set[c.key]);
                const g = grade(ratio);
                return (
                  <td key={c.key} className="p-0.5">
                    <span
                      className="flex min-h-11 items-center justify-between gap-1 rounded-sm px-1.5"
                      style={{
                        backgroundColor: set[c.key],
                        color: set[r.key],
                        boxShadow: surface === 'sun' ? `inset 0 0 0 1px ${surfaces.sun.ink}` : undefined,
                      }}
                    >
                      <span className="hidden font-bold sm:inline">אב</span>
                      <span className="text-end text-micro leading-tight">
                        <Ratio value={ratio} />
                        <span className="block font-semibold">{gradeLabel[g]}</span>
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawColourRule() {
  const cases: Array<{ fg: PaletteKey | 'soilInk'; bg: PaletteKey; ok: boolean; note: string }> = [
    { fg: 'sprout', bg: 'paper', ok: false, note: 'נבט כטקסט על נייר' },
    { fg: 'soilInk', bg: 'sprout', ok: true, note: 'נבט כמילוי, טקסט אדמה' },
    { fg: 'water', bg: 'paper', ok: false, note: 'מים כטקסט על נייר' },
    { fg: 'water', bg: 'soil', ok: true, note: 'מים כטקסט על אדמה' },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cases.map((c) => {
        const fg = c.fg === 'soilInk' ? INK : palette[c.fg].hex;
        const bg = palette[c.bg].hex;
        const ratio = contrast(fg, bg);
        return (
          <li key={c.note} className="grid gap-2">
            {/* rendered as SVG so the deliberately failing pairs are not live text */}
            <svg
              viewBox="0 0 240 96"
              className="block h-24 w-full rounded-md border border-line"
              style={{ backgroundColor: bg }}
              aria-hidden="true"
              focusable="false"
            >
              <text x="120" y="62" textAnchor="middle" fill={fg} style={{ font: '400 40px var(--font-suez), serif' }}>
                מלאי
              </text>
            </svg>
            <span className="flex flex-wrap items-baseline justify-between gap-2 text-caption">
              <span className="font-semibold">{c.note}</span>
              <span className="inline-flex items-center gap-2">
                <Verdict ok={c.ok} />
                <Ratio value={ratio} className="text-micro text-ink-2" />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PaletteSection() {
  return (
    <Section
      id="palette"
      intro={
        <p>
          שמונה צבעים מהשדה עצמו. אדמה ורגב נותנים עומק, נייר נותן קריאוּת, שדה ונבט מסמנים פעולה, מים שמורים להשקיה
          בלבד, קטיף וחיטה לפרי ולאריזה. כל צבע הוא משמעות – לא קישוט.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block
          title="גלעין קרקע"
          note={
            <>
              שמונת הצבעים לפי היקף השימוש · <bdi lang="en">HEX</bdi> · <bdi lang="en">OKLCH</bdi> · ניגודיות טקסט
            </>
          }
        >
          <SoilCore />
        </Block>

        <Block title="פרופורציות" note="כמה מהמסך מותר לכל צבע לתפוס">
          <Proportions />
        </Block>

        <Block title="NDVI – שפת הנתונים" note="רמפה אחת לכל נתון: מלאי, התקדמות, ביקוש">
          <Ndvi />
        </Block>

        <Block
          title="עמוד השדרה של העונה"
          note="חמישה שלבים, צבע אחד לכל שלב, בכל מסך. שם השלב לפי הגידול: זריעה לזרע, שתילה לשתיל."
        >
          <SeasonSpine />
        </Block>

        <Block title="מטריצת ניגודיות" note={<NumText>{'כל זוג טקסט לפחות 4.5:1 על המשטח שלו · WCAG 2.0 AA'}</NumText>}>
          {/* three across only from xl (85rem in sun mode, whose type floors are larger): below that a
              matrix needs the full measure for its ratios */}
          <div className="grid gap-x-(--gutter) gap-y-12 xl:grid-cols-3 sun:xl:grid-cols-1 sun:min-[85rem]:grid-cols-3">
            <div className="min-w-0 rounded-lg border border-line p-4" data-surface="paper">
              <Matrix surface="paper" />
            </div>
            <div className="min-w-0 rounded-lg p-4" data-surface="soil">
              <Matrix surface="soil" />
            </div>
            <div className="min-w-0 rounded-lg border-2 border-black bg-white p-4 text-black">
              <Matrix surface="sun" />
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-4 max-w-[62ch] text-caption text-ink-2">
              צבעי הבסיס הבהירים הם מילוי וסימון, לא טקסט על נייר. לכל אחד יש גוון „דיו” שעובר AA על המשטח שלו.
            </p>
            <RawColourRule />
          </div>
        </Block>
      </div>
    </Section>
  );
}
