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
            <div className="col-span-2 flex items-baseline gap-3 sm:col-span-4 lg:col-span-3">
              <span className="font-display text-h3 leading-none">{c.he}</span>
              <span className="text-caption font-semibold" lang="en" dir="ltr">
                {c.en}
              </span>
            </div>
            <dl className="contents">
              <div className="col-span-2 grid gap-0.5 sm:col-span-2 lg:col-span-3">
                <dt className="sr-only">ערכי צבע</dt>
                <dd>
                  <Num className="text-body font-semibold">{c.hex}</Num>
                </dd>
                <dd className="whitespace-nowrap">
                  <Num className="text-micro">rgb {rgbString(c.hex)}</Num>
                </dd>
                <dd className="whitespace-nowrap">
                  <Num className="text-micro">{oklchString(c.hex)}</Num>
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-2 lg:col-span-4">
                <dt className="sr-only">תפקיד</dt>
                <dd className="text-caption font-semibold">{c.role}</dd>
              </div>
              <div className="col-span-2 flex items-baseline justify-between gap-4 sm:col-span-2 lg:col-span-2 lg:grid lg:justify-items-end lg:gap-1">
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

/** A label pinned to a value on the ramp: centred, except at the two ends. */
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

function Ndvi() {
  return (
    <div className="grid gap-12">
      <figure className="grid gap-2">
        <div className="relative h-12 text-micro" aria-hidden="true">
          {ndvi.stops.map((s) => (
            <Pin key={s.at} at={s.at}>
              <span className="font-semibold">{s.label}</span>
              <span className="mx-auto h-3 w-px bg-ink-2" />
            </Pin>
          ))}
        </div>
        <div className="h-8 rounded-full" style={{ backgroundImage: 'var(--ndvi-inline)' }} aria-hidden="true" />
        <div className="relative h-8 text-micro text-ink-2" aria-hidden="true">
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
              <Num>{t.toFixed(1)}</Num>
            </Pin>
          ))}
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
            <span className="text-caption font-bold">
              שימוש: מפת חום שבועית · חלקה{NB}
              <Num>3</Num> · תפוח אדמה, שדה פתוח, אביב
            </span>
            <DemoTag />
          </figcaption>
          {/* 5 then 7 per row: every cell holds its label and value, sun-mode type floors included */}
          <ol className="grid grid-cols-5 gap-1 sm:grid-cols-7" aria-label="NDVI לפי שבוע, נתוני דמו">
            {weekly.map((v, i) => {
              const bg = sampleRamp(ndvi.stops, v);
              const fg = bestText(bg);
              return (
                <li
                  key={i}
                  className="grid aspect-[4/5] content-between rounded-xs p-2"
                  style={{ backgroundColor: bg, color: fg.color }}
                >
                  <span className="text-micro font-semibold leading-none">
                    <span aria-hidden="true" className="max-sm:hidden">
                      שב׳{NB}
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
