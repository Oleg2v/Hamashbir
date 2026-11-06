import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { DemoTag } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/Field';
import { Num } from '@/components/ui/Num';
import { fonts } from '@/design/tokens';
import { formatMoney, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Nums } from './bits';
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
    <header className="grid gap-x-10 gap-y-4 border-b-(length:--bw) border-line pb-6 md:grid-cols-[auto_1fr] md:items-end">
      <div className="flex items-baseline gap-4">
        {/* Hebrew numbering, with a real geresh: א׳ ב׳ ג׳ */}
        <span className="font-display text-h3 leading-none text-ink-3" aria-hidden="true">
          {index}
        </span>
        <div className="grid gap-1">
          <h4 id={id} lang="en" className="text-title font-bold leading-tight">
            {family}
          </h4>
          <p className="text-caption text-ink-2">
            <Nums>{role}</Nums>
          </p>
        </div>
      </div>
      <p className="text-micro text-ink-2 md:text-end">{credit}</p>
    </header>
  );
}

/* ───────────────────────── א׳ Suez One ───────────────────────── */

function DisplaySpecimen() {
  return (
    <article
      data-surface="soil"
      aria-labelledby="spec-display"
      className="overflow-hidden rounded-xl border-(length:--bw) border-line p-5 sm:p-10 xl:p-14"
    >
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
      {/* the real hero line of the product, at the real hero size */}
      <p className="mt-10 font-display text-display text-balance sm:mt-14">
        העונה <span className="text-sprout-ink">שלך</span> מתחילה כאן
      </p>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption text-ink-2">
        <span>כותרת הגיבור של הפורטל</span>
        <span aria-hidden="true">·</span>
        <code dir="ltr" lang="en" className="font-mono">
          text-display
        </code>
      </p>
      <div className="mt-12 border-t-(length:--bw) border-line pt-10 sm:mt-16 sm:pt-12">
        <GlyphInspector />
      </div>
    </article>
  );
}

/* ───────────────────────── ב׳ Assistant ───────────────────────── */

const weights = [
  { value: 400, he: 'רגיל', use: 'גוף טקסט ושדות', cls: 'font-normal' },
  { value: 600, he: 'חצי־מודגש', use: 'צ׳יפים ומטא', cls: 'font-semibold' },
  { value: 700, he: 'מודגש', use: 'תוויות וכפתורים', cls: 'font-bold' },
  { value: 800, he: 'מודגש במיוחד', use: 'הדגשה במשורה', cls: 'font-extrabold' },
] as const;

/** what each part of the UI sample is set in – straight from components.css */
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
    <article
      aria-labelledby="spec-sans"
      className="rounded-xl border-(length:--bw) border-line bg-surface p-5 shadow-raised sm:p-10 xl:p-14"
    >
      <SpecHeader
        id="spec-sans"
        index="ב׳"
        family={fonts.sans.family}
        role={fonts.sans.role}
        credit={
          <>
            בן נתן · עברית לצד <span lang="en">Source Sans</span> · גופן משתנה <Num>200–800</Num> ·{' '}
            <span lang="en">SIL OFL</span>
          </>
        }
      />
      <ol className="mt-6" aria-label="ארבעת המשקלים של המערכת">
        {weights.map((w) => (
          <li
            key={w.value}
            className="grid gap-x-6 gap-y-2 border-b-(length:--bw) border-line py-6 sm:grid-cols-[10rem_1fr] sm:items-baseline"
          >
            <p className="grid gap-1">
              <span className="flex items-baseline gap-2">
                <Num className="text-body font-medium">{w.value}</Num>
                <span className="text-caption font-semibold">{w.he}</span>
              </span>
              <span className="text-micro text-ink-2">{w.use}</span>
            </p>
            <p className={cn('text-lead', w.cls)}>
              זרעים, השקיה, דשנים ואריזה&nbsp;– בתוכנית אחת, עם המלאי בסניף הקרוב.
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-x-(--gutter) gap-y-8 lg:grid-cols-12 lg:items-center">
        <div className="grid content-start gap-4 lg:col-span-5">
          <p className="text-caption font-bold">בממשק: תווית, ערך, רמז וכפתור</p>
          <div className="grid gap-6 rounded-lg border-(length:--bw) border-line bg-canvas p-5 sm:p-6">
            <TextField
              id="type-ui-area"
              label="שטח החלקה"
              suffix="דונם"
              numeric
              defaultValue="40"
              hint="השטח נטו, בלי דרכים ושוליים."
            />
            <div className="grid justify-items-start gap-3">
              <Button>בנו לי סל לעונה</Button>
              <p className="flex flex-wrap items-center gap-2 text-micro text-ink-2">
                המחיר כולל מע״מ <DemoTag>מחירי דמו</DemoTag>
              </p>
            </div>
          </div>
        </div>
        <div className="grid content-start gap-4 border-t-(length:--bw) border-line pt-6 lg:col-span-6 lg:col-start-7 lg:border-t-0 lg:border-s-(length:--bw) lg:ps-10 lg:pt-0">
        <p id="type-ui-spec" className="text-caption font-bold">
          המפרט מאחורי הדוגמה
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-caption" aria-labelledby="type-ui-spec">
          {uiSpec.map((s) => (
            <div key={s.part} className="contents">
              <dt className="text-ink-2">{s.part}</dt>
              <dd>
                <Num className="text-caption">{s.spec}</Num>
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

/* desktop: two rows of 12; mobile: 2 columns, short values packed densely */
const tiles: Array<{ label: string; value: ReactNode; span: string }> = [
  { label: 'שטח החלקה', value: <><Num>40</Num>&nbsp;דונם</>, span: 'lg:col-span-3' },
  { label: 'אורך שלוחות הטפטוף', value: <><Num>{formatNumber(32000)}</Num>&nbsp;מ׳</>, span: 'col-span-2 lg:col-span-3' },
  { label: 'טפטוף לחלקה', value: <Num>{formatMoney(18420)}</Num>, span: 'col-span-2 lg:col-span-4' },
  { label: 'מדד צמחייה', value: <Num>0.78</Num>, span: 'lg:col-span-2' },
  { label: 'מק״ט מסנן', value: <Num>AR044</Num>, span: 'lg:col-span-2' },
  { label: 'קוטר חיבור', value: <Num>3/4״</Num>, span: 'lg:col-span-2' },
  { label: 'סניף מגדל העמק', value: <Num>32.68°N 35.24°E</Num>, span: 'col-span-2 lg:col-span-5' },
  { label: 'איסוף מהסניף', value: <Num>06.11.2026</Num>, span: 'col-span-2 lg:col-span-3' },
];

const order = [
  { item: <>טפטוף <Num>16</Num>&nbsp;מ״מ</>, qty: 32000, unit: 'מ׳', price: 18420 },
  { item: <>מסנן דיסק <Num>3/4״</Num></>, qty: 4, unit: 'יח׳', price: 960 },
  { item: 'שתילי פלפל', qty: 12500, unit: 'יח׳', price: 4375 },
  { item: <>קרטון <Num>10</Num>&nbsp;ק״ג</>, qty: 640, unit: 'יח׳', price: 2048 },
];

const total = order.reduce((s, r) => s + r.price, 0);

/** a hairline guide on the units digit / decimal point, at the cell's start edge */
const guide = 'relative before:absolute before:inset-y-0 before:start-0 before:w-(--bw) before:bg-sprout-ink';

function MonoSpecimen() {
  return (
    <article
      aria-labelledby="spec-mono"
      className="dot-grid rounded-xl border-(length:--bw) border-line bg-sunken p-5 sm:p-10 xl:p-14"
    >
      <SpecHeader
        id="spec-mono"
        index="ג׳"
        family={fonts.mono.family}
        role={fonts.mono.role}
        credit={
          <>
            <span lang="en">Mike Abbink, Bold Monday</span> · לטינית וספרות בלבד, משקלים <Num>400</Num>/
            <Num>500</Num>/<Num>600</Num> · <span lang="en">SIL OFL</span>
          </>
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[56ch] text-caption text-ink-2">
          הספרות במונו, היחידות בעברית ומחוץ ל־<code dir="ltr" lang="en">&lt;Num&gt;</code>&nbsp;– כך כל מספר מבודד, כל
          יחידה נשארת באסיסטנט, ורווח בלתי שביר מחבר ביניהם: <Num>40</Num>&nbsp;דונם לא נפרדים בסוף שורה.
        </p>
        <span className="flex flex-wrap gap-2">
          <DemoTag />
          <DemoTag>מחירי דמו</DemoTag>
        </span>
      </div>

      <dl className="mt-5 grid grid-flow-row-dense grid-cols-2 gap-(--bw) overflow-hidden rounded-lg border-(length:--bw) border-line bg-line lg:grid-cols-12">
        {tiles.map((t) => (
          <div key={t.label} className={cn('grid min-w-0 content-between gap-8 bg-surface p-5', t.span)}>
            <dt className="text-caption text-ink-2">{t.label}</dt>
            <dd className="whitespace-nowrap text-title">{t.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-x-(--gutter) gap-y-6 lg:grid-cols-12">
      <figure className="grid content-start gap-4 rounded-lg border-(length:--bw) border-line bg-surface p-5 sm:p-6 lg:col-span-7">
        <figcaption className="grid gap-1">
          <span className="text-caption font-bold">יישור טבלאי: אחדות מתחת לאחדות, נקודה מתחת לנקודה</span>
          <span className="text-micro text-ink-2">
            הקו הירוק הוא קו היישור. ספרות ברוחב קבוע, מספרים מיושרים לקצה ההתחלה&nbsp;– סדר הגודל נקרא עוד לפני
            שקוראים.
          </span>
        </figcaption>
        <div className="min-w-0">
          <table className="w-full border-collapse text-caption sm:text-body">
            <thead>
              <tr className="text-micro text-ink-2">
                <th scope="col" className="pb-2 pe-4 text-start font-semibold">
                  פריט
                </th>
                <th scope="col" className="pb-2 ps-3 text-start font-semibold">
                  כמות
                </th>
                <th scope="col" className="pb-2 ps-3 text-start font-semibold">
                  <span className="sr-only">יחידה</span>
                </th>
                <th scope="col" className="pb-2 ps-3 text-start font-semibold">
                  מחיר
                </th>
              </tr>
            </thead>
            <tbody>
              {order.map((r, i) => (
                <tr key={i} className="border-t-(length:--bw) border-line">
                  <th scope="row" className="py-3 pe-3 text-start font-semibold sm:pe-4">
                    {r.item}
                  </th>
                  <td className={cn('w-[1%] whitespace-nowrap py-3 ps-2 text-start sm:ps-3', guide)}>
                    <Num className="font-medium">{formatNumber(r.qty)}</Num>
                  </td>
                  <td className="w-[1%] whitespace-nowrap py-3 ps-2 pe-4 text-start text-micro text-ink-2 sm:ps-3 sm:pe-6 sm:text-caption">
                    {r.unit}
                  </td>
                  <td className={cn('w-[1%] whitespace-nowrap py-3 ps-2 text-start sm:ps-3', guide)}>
                    <Num className="font-medium">{formatMoney(r.price)}</Num>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink">
                <th scope="row" colSpan={3} className="pt-3 pe-4 text-start font-bold">
                  סה״כ להזמנה
                </th>
                <td className={cn('w-[1%] whitespace-nowrap pt-3 ps-3 text-start', guide)}>
                  <Num className="font-semibold">{formatMoney(total)}</Num>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </figure>

      <figure className="grid content-start gap-5 rounded-lg border-(length:--bw) border-line bg-surface p-5 sm:p-6 lg:col-span-5">
        <figcaption className="grid gap-1">
          <span className="text-caption font-bold">למה מונו: אותם מספרים, שני גופנים</span>
          <span className="text-micro text-ink-2">
            באסיסטנט הספרות פרופורציונליות&nbsp;– במדידה <Num>1111</Num> צר בכ־<Num>9%</Num> מ־<Num>8888</Num>, ו־
            <code dir="ltr" lang="en" className="font-mono">
              tabular-nums
            </code>{' '}
            לא משנה דבר: אין לגופן ספרות טבלאיות. לכן כל מספר עובר לפלקס מונו.
          </span>
        </figcaption>
        <div className="grid gap-6 sm:grid-cols-2">
          {(
            [
              { name: 'Assistant', mono: false, ok: false },
              { name: 'IBM Plex Mono', mono: true, ok: true },
            ] as const
          ).map((f) => (
            <div key={f.name} className="grid content-start gap-3">
              <p className="flex items-center justify-between gap-2 text-micro">
                <span lang="en" className="font-semibold">
                  {f.name}
                </span>
                <span className={f.ok ? 'font-bold text-sprout-ink' : 'font-bold text-harvest-ink'}>
                  {f.ok ? 'מיושר' : 'לא מיושר'}
                </span>
              </p>
              {/* start-aligned like every number column, in a box as wide as the widest row:
                  tabular figures fill it exactly, proportional ones leave a ragged end edge */}
              <ul className="grid w-max justify-items-start gap-1 border-x-2 border-line-strong px-2 text-lead">
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

/** many 1s against many 8s: the widest gap a proportional face can show */
const proof = ['11,111.11', '88,888.88', '40,141.01'];

export function Specimens() {
  return (
    <div className="grid gap-6 lg:gap-8">
      <DisplaySpecimen />
      <SansSpecimen />
      <MonoSpecimen />
    </div>
  );
}
