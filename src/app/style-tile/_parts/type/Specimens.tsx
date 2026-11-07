import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { DemoTag } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/Field';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { Verdict } from '@/components/ui/Verdict';
import { demoFarm, lineTotal, planLines, prices, season } from '@/data/demo-farm';
import { fonts } from '@/design/tokens';
import { formatDate, formatMoney, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Code, Range, RoleText } from './bits';
import { GlyphInspector } from './GlyphInspector';

/* ───────────────────────── shared header ───────────────────────── */

function SpecHeader({
  id,
  index,
  family,
  role,
  credit,
}: {
  id: string;
  index: string;
  family: string;
  role: string;
  credit: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-b-(length:--bw) border-line pb-5">
      <div className="flex items-baseline gap-4">
        {/* Hebrew numbering, with a real geresh: א׳ ב׳ ג׳ */}
        <span className="font-display text-title leading-none text-ink-3" aria-hidden="true">
          {index}
        </span>
        <div className="grid gap-1">
          <h4 id={id} lang="en" className="font-sans text-lead font-extrabold">
            {family}
          </h4>
          <p className="text-caption text-ink-2">
            <RoleText>{role}</RoleText>
          </p>
        </div>
      </div>
      <p className="text-micro text-ink-2">{credit}</p>
    </header>
  );
}

const card = 'rounded-xl border-(length:--bw) border-line p-4 sm:p-6 xl:p-8';

/* ───────────────────────── א׳ Suez One ───────────────────────── */

function DisplaySpecimen() {
  return (
    <article data-surface="soil" aria-labelledby="spec-display" className={cn(card, 'overflow-hidden')}>
      <SpecHeader
        id="spec-display"
        index="א׳"
        family={fonts.display.family}
        role={fonts.display.role}
        credit={
          <>
            מיכל סהר · משקל אחד, <Num>400</Num> · עברית ולטינית · <span lang="en">SIL OFL</span>
          </>
        }
      />
      <div className="mt-8">
        <GlyphInspector
          lead={
            <>
              {/* the product's own opening line (the brief, verbatim), at the top step of the scale;
                  the page's one poster headline sits outside the scale (see the scale's footnote row) */}
              {/* 30cqi keeps the longest word („מתחילה”, 3.2em) inside the column; it only binds at 200% text
                  on a phone – everywhere else the display step wins */}
              <p
                className="font-display text-display text-balance"
                style={{ fontSize: 'min(var(--text-display), 30cqi)' }}
              >
                העונה <span className="text-sprout-ink">שלך</span> מתחילה כאן
              </p>
              <p className="mt-4 text-caption text-ink-2">
                שורת הפתיחה מהבריף, מילה במילה, בשלב העליון של הסולם&nbsp;· <Code>text-display</Code>
              </p>
            </>
          }
        />
      </div>
    </article>
  );
}

/* ───────────────────────── ב׳ Assistant ───────────────────────── */

const weights = [
  { value: 400, he: 'רגיל', use: 'גוף טקסט ושדות', cls: 'font-normal' },
  { value: 600, he: 'חצי־מודגש', use: 'צ׳יפים ומטא', cls: 'font-semibold' },
  { value: 700, he: 'מודגש', use: 'תוויות וכפתורים', cls: 'font-bold' },
  { value: 800, he: 'מודגש במיוחד', use: 'כותרות כרטיס, הדגשה במשורה', cls: 'font-extrabold' },
] as const;

/** what each part of the UI sample is set in – straight from components.css */
const uiSpec: Array<{ part: string; spec: string }> = [
  { part: 'תווית', spec: 'text-caption · 700' },
  { part: 'ערך', spec: 'text-body · Plex Mono 500' },
  { part: 'יחידה', spec: 'text-caption · 600' },
  { part: 'רמז', spec: 'text-caption · 400' },
  { part: 'כפתור', spec: 'text-body · 700' },
  { part: 'הערה', spec: 'text-micro · 400' },
];

function SansSpecimen() {
  return (
    <article aria-labelledby="spec-sans" className={cn(card, 'bg-surface shadow-raised')}>
      <SpecHeader
        id="spec-sans"
        index="ב׳"
        family={fonts.sans.family}
        role={fonts.sans.role}
        credit={
          <>
            בן נתן · עברית לצד <span lang="en">Source Sans</span> · גופן משתנה <Range from={200} to={800} />
            {' · '}
            <span lang="en">SIL OFL</span>
          </>
        }
      />
      <div className="mt-6 grid gap-x-(--gutter) gap-y-8 lg:grid-cols-2 xl:grid-cols-12">
        <ol className="grid content-start lg:col-span-2 xl:col-span-6" aria-label="ארבעת המשקלים של המערכת">
          {weights.map((w, i) => (
            <li
              key={w.value}
              className={cn('grid gap-1 py-3', i > 0 && 'border-t-(length:--bw) border-line', i === 0 && 'pt-0')}
            >
              <p className="flex flex-wrap items-baseline gap-x-3 text-micro text-ink-2">
                <span className="text-caption font-medium text-ink">
                  <Num>{w.value}</Num>
                </span>
                <span className="font-semibold text-ink">{w.he}</span>
                <span>{w.use}</span>
              </p>
              <p className={cn('text-lead', w.cls)}>זרעים, השקיה, דשנים ואריזה&nbsp;– בתוכנית אחת.</p>
            </li>
          ))}
        </ol>

        <div className="grid min-w-0 content-start gap-3 xl:col-span-3">
          <h5 className="text-caption font-bold">בממשק: תווית, ערך, רמז וכפתור</h5>
          <div className="grid min-w-0 gap-5 rounded-lg border-(length:--bw) border-line bg-canvas p-4 sm:p-5">
            {/* size: the field's intrinsic width stays small, so it never pushes a phone layout sideways */}
            <TextField
              id="type-ui-area"
              label="שטח החלקה"
              suffix="דונם"
              numeric
              size={4}
              defaultValue={String(demoFarm.area)}
              hint="השטח נטו, בלי דרכים ושוליים."
            />
            <div className="grid justify-items-start gap-3">
              <Button>בנו תוכנית עונה</Button>
              <p className="text-micro text-ink-2">בלי התחייבות&nbsp;– אפשר לשנות כל שורה בתוכנית.</p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-3 border-t-(length:--bw) border-line pt-5 lg:border-t-0 lg:pt-0 xl:col-span-3 xl:border-s-(length:--bw) xl:ps-6">
          <h5 id="type-ui-spec" className="text-caption font-bold">
            המפרט מאחורי הדוגמה
          </h5>
          <dl
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-caption"
            aria-labelledby="type-ui-spec"
          >
            {uiSpec.map((s) => (
              <div key={s.part} className="contents">
                <dt className="text-ink-2">{s.part}</dt>
                <dd className="min-w-0">
                  <Code className="text-micro">{s.spec}</Code>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────── ג׳ IBM Plex Mono ───────────────────────── */

const dripCost = season.dripMeters * prices.dripMeter;

/* desktop: two rows of 12 (lg, and only while the article holds 54rem – so at 200% text the strip
   falls back to 2 columns instead of scrolling); mobile: 2 columns, short values packed densely */
const tiles: Array<{ label: string; value: ReactNode; span: string }> = [
  {
    label: 'שטח החלקה',
    value: (
      <>
        <Num>{demoFarm.area}</Num>&nbsp;דונם
      </>
    ),
    span: 'lg:@min-[54rem]:col-span-3',
  },
  {
    // the quantity, in the trade's own words (the product itself is „שלוחת טפטוף 16 מ״מ”)
    label: 'אורך שלוחות הטפטוף',
    value: (
      <>
        <Num>{formatNumber(season.dripMeters)}</Num>&nbsp;מ׳
      </>
    ),
    span: 'col-span-2 lg:@min-[54rem]:col-span-3',
  },
  { label: 'עלות הטפטוף', value: <Num>{formatMoney(dripCost)}</Num>, span: 'col-span-2 lg:@min-[54rem]:col-span-4' },
  { label: 'מדד צמחייה · מתחת לרשת', value: <Num>0.78</Num>, span: 'lg:@min-[54rem]:col-span-2' },
  { label: 'ממטיר העשושית', value: <Num>AR044</Num>, span: 'lg:@min-[54rem]:col-span-2' },
  // ״ is a strong RTL character: the LRM after it keeps "× 2" on its LTR side; no-break spaces keep
  // the product whole (values wrap only at a real space, like the coordinates below)
  { label: 'מסנן דיסקים', value: <Num>{'2״\u200E\u00a0×\u00a02'}</Num>, span: 'lg:@min-[54rem]:col-span-2' },
  // the section's own route stamp (03): the Jezreel Valley branch shares the Migdal HaEmek site
  { label: 'סניף עמק יזרעאל', value: <Num>32.67°N 35.24°E</Num>, span: 'col-span-2 lg:@min-[54rem]:col-span-5' },
  // the demo farm's branch and the hero's promise: ordered in the morning, picked up today
  {
    label: `איסוף היום ב${demoFarm.branch.name}`,
    value: <Num>{formatDate(new Date(2026, 10, 6))}</Num>,
    span: 'col-span-2 lg:@min-[54rem]:col-span-3',
  },
];

/* the demo farm's priced lines: seedlings, drip, export cartons (crop protection has no price) */
const order = planLines.filter((l) => lineTotal(l) != null);
const orderTotal = order.reduce((s, l) => s + (lineTotal(l) ?? 0), 0);

/** a hairline guide on the units digit / decimal point, at the cell's start edge */
const guide = 'relative before:absolute before:inset-y-0 before:start-0 before:w-(--bw) before:bg-sprout-ink';
/* columns that need room appear when the figure (a size container) is wide enough */
const unitCol = 'hidden @sm:table-cell';
const unitPriceCol = 'hidden @lg:table-cell';

function OrderTable() {
  return (
    <table className="w-full border-collapse text-micro @sm:text-caption @lg:text-body">
      <thead>
        <tr className="text-micro text-ink-2">
          <th scope="col" className="pb-2 pe-3 text-start font-semibold">
            פריט
          </th>
          <th scope="col" className="pb-2 ps-2 text-start font-semibold">
            כמות
          </th>
          <th scope="col" className={cn('pb-2 ps-2 text-start font-semibold', unitCol)}>
            <span className="sr-only">יחידה</span>
          </th>
          <th scope="col" className={cn('pb-2 ps-2 text-start font-semibold', unitPriceCol)}>
            ליח׳
          </th>
          <th scope="col" className="pb-2 ps-2 text-start font-semibold">
            סכום
          </th>
        </tr>
      </thead>
      <tbody>
        {order.map((l) => (
          <tr key={l.id} className="border-t-(length:--bw) border-line">
            <th scope="row" className="py-2 pe-3 text-start font-semibold">
              <NumText>{l.product}</NumText>
            </th>
            <td className={cn('w-[1%] whitespace-nowrap py-2 ps-2 text-start', guide)}>
              <span className="font-medium">
                <Num>{formatNumber(l.qty!)}</Num>
              </span>
              {/* narrow figure: the unit stays on its number's line (no-break space), never under it */}
              <span className="text-micro text-ink-2 @sm:hidden">
                {'\u00a0'}
                {l.unit}
              </span>
            </td>
            <td className={cn('w-[1%] whitespace-nowrap py-2 ps-2 pe-3 text-start text-ink-2', unitCol)}>{l.unit}</td>
            <td className={cn('w-[1%] whitespace-nowrap py-2 ps-2 pe-3 text-start text-ink-2', guide, unitPriceCol)}>
              <Num>{formatMoney(l.unitPrice!)}</Num>
            </td>
            <td className={cn('w-[1%] whitespace-nowrap py-2 ps-2 text-start', guide)}>
              <span className="font-medium">
                <Num>{formatMoney(lineTotal(l)!)}</Num>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-[length:calc(var(--bw)*2)] border-ink">
          <th scope="row" className="pt-3 pe-3 text-start font-bold">
            סה״כ להזמנה
          </th>
          <td className="pt-3" />
          <td className={cn('pt-3', unitCol)} />
          <td className={cn('pt-3', unitPriceCol)} />
          <td className={cn('w-[1%] whitespace-nowrap pt-3 ps-2 text-start', guide)}>
            <span className="font-semibold">
              <Num>{formatMoney(orderTotal)}</Num>
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

/** many 1s against many 8s: the widest gap a proportional face can show */
const proof = ['11,111.11', '88,888.88', '40,141.01'];

function MonoSpecimen() {
  return (
    <article aria-labelledby="spec-mono" className={cn(card, '@container dot-grid bg-sunken')}>
      <SpecHeader
        id="spec-mono"
        index="ג׳"
        family={fonts.mono.family}
        role={fonts.mono.role}
        credit={
          <>
            <span lang="en">Mike Abbink, Bold Monday</span> · לטינית וספרות בלבד, משקלים <Num>400/500/600</Num>
            {' · '}
            <span lang="en">SIL OFL</span>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[68ch] text-caption text-ink-2">
          ספרות במונו ויחידות בעברית, מחוץ ל־<Code>&lt;Num&gt;</Code>
          {', ורווח בלתי שביר ביניהן: '}
          <Num>{demoFarm.area}</Num>&nbsp;דונם לא נפרדים בסוף שורה.
        </p>
        <span className="flex flex-wrap gap-2">
          <DemoTag />
          <DemoTag>מחירי דמו</DemoTag>
        </span>
      </div>

      {/* tracks never shrink below their value: at 200% text the tiles keep every figure whole and
          the strip scrolls sideways inside its frame instead of clipping (WCAG 1.4.4) */}
      <dl className="mt-4 grid grid-flow-row-dense grid-cols-[repeat(2,minmax(min-content,1fr))] gap-(--bw) overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-lg border-(length:--bw) border-line bg-line lg:@min-[54rem]:grid-cols-[repeat(12,minmax(min-content,1fr))]">
        {tiles.map((t) => (
          <div key={t.label} className={cn('grid min-w-0 content-between gap-3 bg-surface p-3 sm:p-4', t.span)}>
            <dt className="text-caption text-ink-2">{t.label}</dt>
            <dd className="text-title">{t.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-x-(--gutter) gap-y-6 lg:grid-cols-12">
        <figure className="@container grid min-w-0 content-start gap-4 rounded-lg border-(length:--bw) border-line bg-surface p-4 sm:p-5 lg:col-span-7">
          <figcaption className="grid gap-1">
            <span className="text-caption font-bold">יישור טבלאי: אחדות מתחת לאחדות, נקודה מתחת לנקודה</span>
            <span className="text-micro text-ink-2">
              הקו הירוק הוא קו היישור: ספרות ברוחב קבוע, מיושרות לקצה ההתחלה&nbsp;– סדר הגודל נקרא עוד לפני שקוראים.
            </span>
          </figcaption>
          <div className="min-w-0 overflow-x-auto">
            <OrderTable />
          </div>
        </figure>

        <figure className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 rounded-lg border-(length:--bw) border-line bg-surface p-4 sm:p-5 lg:col-span-5">
          <figcaption className="grid gap-1">
            <span className="text-caption font-bold">למה מונו: אותם מספרים, שני גופנים</span>
            <span className="text-micro text-ink-2">
              באסיסטנט הספרות פרופורציונליות&nbsp;– במדידה <Num>1111</Num>&nbsp;צר בכ־<Num>8%</Num>&nbsp;מ־
              <Num>8888</Num>,
              {/* the token moves to the next line whole; it breaks at its hyphen only when wider than a line */}
              ו־<Code className="inline-block">tabular-nums</Code> לא משנה דבר: אין לגופן ספרות טבלאיות. לכן כל מספר
              עובר לפלקס מונו.
            </span>
          </figcaption>
          {/* side by side while both lists fit at their own width, stacked otherwise (sun mode, 200% text) */}
          <div className="flex flex-wrap gap-4">
            {(
              [
                { name: 'Assistant', mono: false, ok: false },
                { name: 'IBM Plex Mono', mono: true, ok: true },
              ] as const
            ).map((f) => (
              <div key={f.name} className="grid min-w-0 grow basis-[max-content] content-start gap-3 overflow-x-auto">
                <p className="grid justify-items-start gap-2 text-micro">
                  <span lang="en" className="font-semibold">
                    {f.name}
                  </span>
                  <Verdict ok={f.ok} label={f.ok ? 'מיושר' : 'לא מיושר'} />
                </p>
                {/* start-aligned like every number column, in a box as wide as the widest row:
                    tabular figures fill it exactly, proportional ones leave a ragged end edge */}
                <ul className="grid w-max justify-items-start gap-1 border-x-[length:calc(var(--bw)*2)] border-line-strong px-2 text-lead">
                  {proof.map((n) => (
                    <li key={n}>
                      <Num mono={f.mono}>{n}</Num>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </article>
  );
}

export function Specimens() {
  return (
    // minmax(0, 1fr): one specimen's long content never widens the others (or the page)
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <DisplaySpecimen />
      <SansSpecimen />
      <MonoSpecimen />
    </div>
  );
}
