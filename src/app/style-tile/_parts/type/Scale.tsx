import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { fluidClamp, sunTypeFloor, typeScale, typeViewport, type TypeStepName } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { AtMost, BothWays, RangeArrow, formatPx, signed } from './bits';
import { NowPx } from './NowPx';
import { ViewportGauge } from './ViewportGauge';

/* The system, derived from the tokens instead of restated: step 0 is the base,
   the top step fixes each end's ratio (16 × r⁶ = 61, 18 × r⁶ = 144). */
const base = typeScale.find((s) => s.step === 0)!;
const top = typeScale[typeScale.length - 1];
const ratioMin = Number(((top.min / base.min) ** (1 / top.step)).toFixed(3)); // 1.25
const ratioMax = Number(((top.max / base.max) ** (1 / top.step)).toFixed(3)); // 1.414
const floored = typeScale.filter((s) => s.step < 0);

/** Static class names, so Tailwind sees every utility. */
const utility: Record<TypeStepName, string> = {
  micro: 'text-micro',
  caption: 'text-caption',
  body: 'text-body',
  lead: 'text-lead',
  title: 'text-title font-bold',
  h3: 'text-h3 font-display',
  h2: 'text-h2 font-display',
  h1: 'text-h1 font-display',
  display: 'text-display font-display',
};

/** Real product strings, one per role. */
const sample: Record<TypeStepName, ReactNode> = {
  micro: (
    <>
      מחירי דמו&nbsp;· כולל מע״מ&nbsp;· עודכן ב־<Num>06.11.2026</Num>
    </>
  ),
  caption: (
    <>
      במלאי בסניף עין תמר&nbsp;· <Num>3</Num>&nbsp;ק״מ ממך
    </>
  ),
  body: (
    <>
      הזינו את הגידול, הדונמים ותאריך השתילה&nbsp;– ונבנה לכם סל לכל שלב בעונה, עם כמויות, מחיר ומלאי בסניף הקרוב
      אליכם.
    </>
  ),
  lead: <>זרעים, השקיה, דשנים ואריזה&nbsp;– בתוכנית אחת.</>,
  title: (
    <>
      צינור טפטוף <Num mono={false}>16</Num>&nbsp;מ״מ
    </>
  ),
  h3: <>מה צריך לשבוע הבא</>,
  h2: <>השקיה וטפטוף</>,
  h1: <>תוכנית העונה</>,
  display: <>העונה מוכנה.</>,
};

function StepRow({ s }: { s: (typeof typeScale)[number] }) {
  const id = `type-sample-${s.name}`;
  const floor = sunTypeFloor[s.name];
  const ratio = s.max / s.min;
  return (
    <li className="grid gap-x-(--gutter) gap-y-5 border-t-(length:--bw) border-line py-7 lg:grid-cols-12 lg:items-baseline lg:py-9">
      <div className="grid content-start gap-2 lg:col-span-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="flex items-baseline gap-3">
            <Num className="min-w-[3ch] text-caption text-ink-3">{signed(s.step)}</Num>
            <code dir="ltr" lang="en" className="font-mono text-body font-medium">
              text-{s.name}
            </code>
          </span>
          <NowPx target={id} className="text-caption font-semibold text-sprout-ink" />
        </div>
        {/* pairs flow and wrap; labels the eye can infer stay for screen readers */}
        <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-caption">
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">טווח</dt>
            <dd>
              <Num className="font-semibold">
                {s.min}
                <RangeArrow />
                {s.max}px
              </Num>
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">יחס מקסימום למינימום</dt>
            <dd className="text-ink-2">
              פי <Num>{ratio.toFixed(2)}</Num>
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-ink-2">גובה שורה</dt>
            <dd>
              <Num>{s.leading}</Num>
            </dd>
          </div>
          {s.tracking !== '0' ? (
            <div className="flex items-baseline gap-2">
              <dt className="text-ink-2">הידוק</dt>
              <dd>
                <Num>{s.tracking.replace('-', '−')}</Num>
              </dd>
            </div>
          ) : null}
          {floor ? (
            <div className="flex items-baseline gap-2">
              <dt className="text-ink-2">בשמש</dt>
              <dd>
                <Num>
                  {floor[0] === floor[1] ? (
                    `${floor[0]}px`
                  ) : (
                    <>
                      {floor[0]}
                      <RangeArrow />
                      {floor[1]}px
                    </>
                  )}
                </Num>
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="text-caption text-ink-2">{s.use}</p>
        <Num className="block text-micro text-ink-3 [overflow-wrap:anywhere]">{fluidClamp(s.min, s.max)}</Num>
      </div>
      <div className="min-w-0 lg:col-span-8">
        <p id={id} className={cn(utility[s.name], s.name === 'body' && 'max-w-[50ch]', 'text-pretty')}>
          {sample[s.name]}
        </p>
      </div>
    </li>
  );
}

export function Scale() {
  return (
    <div className="grid gap-12 lg:gap-16">
      <div className="grid gap-x-(--gutter) gap-y-10 lg:grid-cols-12">
        <div className="grid content-start gap-6 lg:col-span-5">
          <p className="text-lead text-balance">
            סולם אחד ושני קצוות. ביניהם כל שלב גדל בקו ישר, כך שאין קפיצות בין נייד לדסקטופ.
          </p>
          <ul className="grid border-b-(length:--bw) border-line text-body text-ink-2">
            <li className="border-t-(length:--bw) border-line py-3 font-semibold text-ink">
              {/* each phrase is unbreakable, so the statement wraps only between them */}
              <span className="whitespace-nowrap">
                <Num>
                  {base.min}px × {ratioMin}
                </Num>{' '}
                ב־<Num>{typeViewport.min}px</Num>
              </span>
              <BothWays />
              <span className="whitespace-nowrap">
                <Num>
                  {base.max}px × {ratioMax}
                </Num>{' '}
                ב־<Num>{typeViewport.max}px</Num>
              </span>
            </li>
            <li className="border-t-(length:--bw) border-line py-3">
              <code dir="ltr" lang="en" className="font-mono text-ink">
                clamp()
              </code>{' '}
              אחד לכל שלב, ב־
              <code dir="ltr" lang="en" className="font-mono text-ink">
                rem + vw
              </code>
             &nbsp;– כך שזום הדפדפן ממשיך לעבוד.
            </li>
            <li className="border-t-(length:--bw) border-line py-3">
              יחס מקסימום/מינימום <AtMost />
              <Num>2.5</Num> בכל שלב&nbsp;– זום <Num>200%</Num> עדיין מגדיל טקסט{' '}
              <span className="whitespace-nowrap">
                (<span lang="en">WCAG</span> <Num>1.4.4</Num>).
              </span>
            </li>
            <li className="border-t-(length:--bw) border-line py-3">
              גובה השורה יורד ככל שהאות גדלה: <Num>{base.leading}</Num> בגוף טקסט,{' '}
              <Num>{typeScale.find((s) => s.name === 'title')!.leading}</Num> בכותרת כרטיס, <Num>{top.leading}</Num>{' '}
              בתצוגה.
            </li>
            <li className="border-t-(length:--bw) border-line py-3">
              שני השלבים הקטנים מוגבהים לרצפת קריאוּת:{' '}
              {floored.map((s, i) => (
                <span key={s.name}>
                  {i > 0 ? ' ו־' : null}
                  <Num>{s.min}px</Num>
                </span>
              ))}{' '}
              במקום{' '}
              {floored.map((s, i) => (
                <span key={s.name}>
                  {i > 0 ? ' ו־' : null}
                  <Num>{formatPx(base.min * ratioMin ** s.step)}</Num>
                </span>
              ))}
              .
            </li>
          </ul>
        </div>
        <figure className="grid content-start gap-6 self-start rounded-lg border-(length:--bw) border-line bg-surface p-5 sm:p-8 lg:col-span-7">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="text-caption font-bold">הסולם נושם עם החלון</span>
            <span className="text-micro text-ink-2">שנו את רוחב החלון&nbsp;– הסמן והקריאות „עכשיו” זזים איתו</span>
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

      <div className="grid gap-4">
        <p className="text-caption text-ink-2">
          מהקטן לגדול, כמו צמח: <Num>{typeScale.length}</Num> שלבים, כל אחד עם דוגמה חיה בגודל האמיתי שלו.
        </p>
        <ol className="border-b-(length:--bw) border-line" aria-label="תשעת שלבי הסולם, מהקטן לגדול">
          {typeScale.map((s) => (
            <StepRow key={s.name} s={s} />
          ))}
        </ol>
      </div>
    </div>
  );
}
