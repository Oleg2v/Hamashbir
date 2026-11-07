import type { CSSProperties, ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { demoFarm } from '@/data/demo-farm';
import {
  ergonomics,
  fluidClamp,
  posterType,
  sunTypeFloor,
  surfaces,
  typeScale,
  type TypeStepName,
} from '@/design/tokens';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Code, formatPx, Range, signed } from './bits';
import { NowPx } from './NowPx';
import { ViewportGauge } from './ViewportGauge';

/* The system, derived from the tokens instead of restated: step 0 is the base,
   the top step fixes each end's ratio (16 × r⁶ = 61, 18 × r⁶ = 144). */
const base = typeScale.find((s) => s.step === 0)!;
const top = typeScale[typeScale.length - 1];
const titleStep = typeScale.find((s) => s.name === 'title')!;
const ratioMin = Number(((top.min / base.min) ** (1 / top.step)).toFixed(3)); // 1.25
const ratioMax = Number(((top.max / base.max) ** (1 / top.step)).toFixed(3)); // 1.414
const floored = typeScale.filter((s) => s.step < 0);
/** Nothing smaller than this in sun mode (the lowest floor). */
const SUN_FLOOR = Math.min(...Object.values(sunTypeFloor).map((f) => f[0]));
/** Every step keeps max ÷ min at or under this, so 200% zoom still enlarges text. */
const MAX_RATIO = 2.5;

/** Static class names, so Tailwind sees every utility. Suez One from title up. */
const utility: Record<TypeStepName, string> = {
  micro: 'text-micro',
  caption: 'text-caption',
  body: 'text-body max-w-[60ch]',
  lead: 'text-lead',
  title: 'text-title font-display',
  h3: 'text-h3 font-display',
  h2: 'text-h2 font-display',
  h1: 'text-h1 font-display',
  display: 'text-display font-display',
};

/** Real product strings, one per role. */
const sample: Record<TypeStepName, ReactNode> = {
  micro: (
    <>
      מחירי דמו&nbsp;· כולל מע״מ&nbsp;· עודכן ב־<Num>{formatDate(new Date(2026, 10, 6))}</Num>
    </>
  ),
  caption: (
    <>
      במלאי בסניף {demoFarm.branch.name}&nbsp;· <Num>{demoFarm.branch.km}</Num>&nbsp;ק״מ ממך
    </>
  ),
  body: <>הזינו את הגידול, הדונמים ותאריך השתילה&nbsp;– ונבנה לך סל לכל שלב בעונה.</>,
  lead: <>זרעים, השקיה, דשנים ואריזה&nbsp;– בתוכנית אחת.</>,
  // the second sentence's subject stays with its verb: never „…מוצרים. הם” / „מנהלים עונות.”
  title: <>חקלאים לא קונים מוצרים. הם&nbsp;מנהלים עונות.</>,
  h3: <>מה צריך לשבוע הבא</>,
  // a department name is a proper noun, verbatim from the client's site; this one
  // has no השקיה/השקייה spelling to clash with the running text two rows up
  h2: <>זרעים ושתילים</>,
  h1: <>תוכנית העונה</>,
  display: <>העונה מוכנה.</>,
};

/** range · sun floor · leading · ratio · tracking – one compact line of facts */
function Spec({
  min,
  max,
  sun,
  leading,
  tracking,
}: {
  min: number;
  max: number;
  sun?: readonly [number, number];
  leading: number;
  tracking: string;
}) {
  return (
    <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-micro text-ink-2">
      <div className="flex items-baseline gap-1">
        <dt className="sr-only">טווח</dt>
        <dd>
          <Range from={min} to={max} unit="px" className="font-semibold text-ink" />
        </dd>
      </div>
      {sun ? (
        <div className="flex items-baseline gap-1">
          <dt>בשמש</dt>
          <dd>
            <Range from={sun[0]} to={sun[1]} unit="px" className="font-semibold text-ink" />
          </dd>
        </div>
      ) : null}
      <div className="flex items-baseline gap-1">
        <dt>גובה שורה</dt>
        <dd>
          <Num>{leading}</Num>
        </dd>
      </div>
      <div className="flex items-baseline gap-1">
        {/* max ÷ min: how much the step grows between the two ends */}
        <dt>גדל</dt>
        <dd>
          פי&nbsp;<Num>{(max / min).toFixed(2)}</Num>
        </dd>
      </div>
      {tracking !== '0' ? (
        <div className="flex items-baseline gap-1">
          <dt>הידוק</dt>
          <dd>
            <Num>{tracking.replace('-', '−')}</Num>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * The step's role and its clamp(): one line on desktop, two from tablet width.
 * On a phone the 48-character formula would wrap in every row, so it stays for
 * wider screens; the live „עכשיו” readout tells the same story there.
 */
function UseLine({ use, clamp }: { use: string; clamp: string }) {
  return (
    <p className="text-micro text-ink-3">
      {use}
      <span className="hidden lg:inline">&nbsp;· </span>
      <span className="hidden sm:block lg:inline">
        <Num>{clamp}</Num>
      </span>
    </p>
  );
}

// minmax(0, 1fr) below lg: one long value never widens the row (or the page) at 200% text
const row =
  'grid grid-cols-[minmax(0,1fr)] gap-x-(--gutter) gap-y-2 border-t-(length:--bw) py-4 lg:grid-cols-12 lg:items-baseline lg:gap-y-1 lg:py-3';

function StepRow({ s }: { s: (typeof typeScale)[number] }) {
  const id = `type-sample-${s.name}`;
  return (
    <li className={cn(row, 'border-line')}>
      <div className="grid content-start gap-1 lg:col-span-4">
        <p className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="flex items-baseline gap-3">
            <span className="inline-block min-w-[3ch] text-caption text-ink-3">
              <Num>{signed(s.step)}</Num>
            </span>
            <Code className="text-body font-medium">text-{s.name}</Code>
          </span>
          <NowPx target={id} className="text-caption font-semibold text-sprout-ink" />
        </p>
        <Spec min={s.min} max={s.max} sun={sunTypeFloor[s.name]} leading={s.leading} tracking={s.tracking} />
      </div>
      <div className="grid min-w-0 gap-1 lg:col-span-8">
        <UseLine use={s.use} clamp={fluidClamp(s.min, s.max)} />
        <p id={id} className={cn(utility[s.name], 'text-pretty')}>
          {sample[s.name]}
        </p>
      </div>
    </li>
  );
}

/** The footnote under the ladder: the one size that is deliberately not a step. */
function PosterRow() {
  const id = 'type-sample-poster';
  return (
    <div className={cn(row, 'border-dashed border-line-strong')}>
      <div className="grid content-start gap-1 lg:col-span-4">
        <p className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="flex items-baseline gap-3">
            <span className="inline-block min-w-[3ch] text-caption text-ink-3" aria-hidden="true">
              *
            </span>
            <Code className="text-body font-medium">text-{posterType.name}</Code>
          </span>
          <NowPx target={id} className="text-caption font-semibold text-sprout-ink" />
        </p>
        <Spec min={posterType.min} max={posterType.max} leading={posterType.leading} tracking={posterType.tracking} />
      </div>
      <div className="grid min-w-0 gap-1 lg:col-span-8">
        <UseLine use="מחוץ לסולם" clamp={fluidClamp(posterType.min, posterType.max)} />
        <p className="max-w-[68ch] text-caption text-ink-2">
          {/* a probe for the live reading: the poster size itself, invisible */}
          <span id={id} className="text-poster sr-only" aria-hidden="true">
            ע
          </span>
          הכותרת היחידה של מסך הפתיחה, פעם אחת בעמוד. היא לא שלב עשירי&nbsp;– תשעת השלבים נשארים סגורים, והכרזה עומדת
          לבד, כמו הכותרת בראש העמוד הזה.
        </p>
      </div>
    </div>
  );
}

/**
 * Sun mode, previewed rather than described: the strip repaints itself with the
 * sun surface's own tokens (white, black ink, 2px lines, the sun type floors,
 * body weight 500), whatever theme the page around it is in.
 */
const sun = surfaces.sun;
const sunPreview = {
  '--canvas': sun.canvas,
  '--surface': sun.surface,
  '--ink': sun.ink,
  '--ink-2': sun.ink2,
  '--ink-3': sun.ink3,
  '--line': sun.line,
  '--line-strong': sun.lineStrong,
  '--sprout-ink': sun.sproutInk,
  '--focus': sun.focus,
  '--bw': `${ergonomics.sun.borderWidth}px`,
  '--text-caption': fluidClamp(...sunTypeFloor.caption!),
  '--text-body': fluidClamp(...sunTypeFloor.body!),
  fontWeight: 500,
} as CSSProperties;

function SunStrip() {
  return (
    <div
      style={sunPreview}
      className="grid grid-cols-[minmax(0,1fr)] gap-x-(--gutter) gap-y-2 rounded-lg border-(length:--bw) border-ink bg-canvas p-4 text-ink sm:p-6 lg:grid-cols-12 lg:items-center"
    >
      <h4 className="font-display text-title font-normal lg:col-span-6">
        אין טקסט קטן מ־<Num mono={false}>{SUN_FLOOR}px</Num>&nbsp;תחת שמש של צהריים.
      </h4>
      <p className="text-caption text-ink-2 lg:col-span-6">
        כך נראה מצב שמש: לבן, דיו שחור, קווים של <Num>{ergonomics.sun.borderWidth}px</Num>&nbsp;
        {'וגוף טקסט במשקל '}
        <Num>500</Num>. הפעילו אותו בסרגל העליון, וערכי „עכשיו” בסולם יעלו לרצפות „בשמש”.
      </p>
    </div>
  );
}

export function Scale() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-(--gutter) gap-y-8 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-5">
          <h4 className="font-display text-title font-normal">סולם אחד ושני קצוות.</h4>
          <p className="text-body text-ink-2">ביניהם כל שלב גדל בקו ישר, כך שאין קפיצות בין נייד לדסקטופ.</p>
          <ul className="grid border-b-(length:--bw) border-line text-caption text-ink-2">
            <li className="border-t-(length:--bw) border-line py-2">
              <Code className="text-ink">clamp()</Code> אחד לכל שלב, ב־<Code className="text-ink">rem + vw</Code>, והיחס
              בין הקצוות לכל היותר <Num>{MAX_RATIO}</Num>&nbsp;– כך שזום <Num>200%</Num>&nbsp;
              {'עדיין מגדיל טקסט '}
              <Num lang="en">(WCAG 1.4.4)</Num>.
            </li>
            <li className="border-t-(length:--bw) border-line py-2">
              גובה השורה יורד ככל שהאות גדלה: <Num>{base.leading}</Num>&nbsp;בגוף טקסט, <Num>{titleStep.leading}</Num>
              &nbsp;בשלב <Code>title</Code>, <Num>{top.leading}</Num>&nbsp;בתצוגה.
            </li>
            <li className="border-t-(length:--bw) border-line py-2">
              {'שני השלבים הקטנים מוגבהים לרצפת קריאוּת: '}
              {floored.map((s, i) => (
                <span key={s.name}>
                  {i > 0 ? ' ו־' : null}
                  <Num>{s.min}px</Num>
                </span>
              ))}
              {' במקום '}
              {floored.map((s, i) => (
                <span key={s.name}>
                  {i > 0 ? ' ו־' : null}
                  <Num>{formatPx(base.min * ratioMin ** s.step)}px</Num>
                </span>
              ))}
              .
            </li>
          </ul>
        </div>
        <figure className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 self-start rounded-lg border-(length:--bw) border-line bg-surface p-4 sm:p-6 lg:col-span-7">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="text-caption font-bold">הסולם נושם עם החלון</span>
            <span className="text-micro text-ink-2">שנו את רוחב החלון&nbsp;– הסמן וערכי „עכשיו” זזים איתו</span>
          </figcaption>
          <ViewportGauge
            minLabel={
              <>
                <Num>
                  {base.min}px × {ratioMin}
                </Num>
                <span>טרצה גדולה</span>
              </>
            }
            maxLabel={
              <>
                <Num>
                  {base.max}px × {ratioMax}
                </Num>
                <span>קוורטה מוגדלת</span>
              </>
            }
          />
        </figure>
      </div>

      <div className="grid gap-3">
        <p className="text-caption text-ink-2">
          מהקטן לגדול, כמו צמח: <Num>{typeScale.length}</Num>&nbsp;שלבים, כל אחד עם טקסט אמיתי מהמוצר בגודל האמיתי שלו.
          הערך „בשמש” הוא הרצפה של השלב במצב שמש.
        </p>
        <div>
          <ol aria-label="תשעת שלבי הסולם, מהקטן לגדול">
            {typeScale.map((s) => (
              <StepRow key={s.name} s={s} />
            ))}
          </ol>
          <PosterRow />
        </div>
      </div>

      {/* sun mode is folded into the ladder ("בשמש"); this strip only shows what it looks like */}
      <SunStrip />
    </div>
  );
}
