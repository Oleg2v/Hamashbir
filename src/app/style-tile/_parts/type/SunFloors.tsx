import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { sunTypeFloor, typeScale, type TypeStepName } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { RangeArrow } from './bits';
import { NowPx } from './NowPx';

/* A px ruler for the four floored steps. Low values at inline-start (right),
   growing toward inline-end – the same direction as the season. */
const AXIS = { min: 12, max: 26 } as const;
const pct = (v: number) => ((v - AXIS.min) / (AXIS.max - AXIS.min)) * 100;
const ticks = Array.from({ length: AXIS.max - AXIS.min + 1 }, (_, i) => AXIS.min + i);
const FLOOR = Math.min(...Object.values(sunTypeFloor).map((f) => f[0]));

const steps = typeScale.filter((s) => sunTypeFloor[s.name]);

const utility: Partial<Record<TypeStepName, string>> = {
  micro: 'text-micro',
  caption: 'text-caption',
  body: 'text-body',
  lead: 'text-lead',
};

const sample: Partial<Record<TypeStepName, ReactNode>> = {
  micro: <>מחירי דמו · כולל מע״מ</>,
  caption: <>במלאי בסניף פארן</>,
  body: <>הזינו דונמים ותאריך שתילה</>,
  lead: <>סל ההשקיה שלך מוכן</>,
};

function Range({ from, to, thick }: { from: number; to: number; thick?: boolean }) {
  const h = thick ? 'h-2' : 'h-1';
  if (from === to) {
    // a single value: a dot, centred on its tick
    return (
      <span
        className={cn('absolute top-1/2 size-3 -translate-y-1/2 rounded-full', thick ? 'bg-ink' : 'bg-line-strong')}
        style={{ insetInlineStart: `calc(${pct(from)}% - 0.375rem)` }}
      />
    );
  }
  return (
    <span
      className={cn('absolute top-1/2 -translate-y-1/2 rounded-full', h, thick ? 'bg-ink' : 'bg-line-strong')}
      style={{ insetInlineStart: `${pct(from)}%`, inlineSize: `${pct(to) - pct(from)}%` }}
    />
  );
}

function Ruler({ def, sun }: { def: readonly [number, number]; sun: readonly [number, number] }) {
  return (
    <div className="relative grid gap-1" aria-hidden="true">
      {/* px ticks; the floor is a heavier rule, so it still stands out when sun mode turns every line black */}
      <div className="pointer-events-none absolute inset-0">
        {ticks.map((v) => (
          <span
            key={v}
            className={cn('absolute inset-y-0', v === FLOOR ? 'w-0.5 bg-ink' : 'w-px bg-line')}
            style={{ insetInlineStart: v === FLOOR ? `calc(${pct(v)}% - 1px)` : `${pct(v)}%` }}
          />
        ))}
      </div>
      <div className="relative h-4">
        <Range from={def[0]} to={def[1]} />
      </div>
      <div className="relative h-4">
        <Range from={sun[0]} to={sun[1]} thick />
      </div>
    </div>
  );
}

function px(f: readonly [number, number]) {
  return f[0] === f[1] ? (
    <Num>{f[0]}px</Num>
  ) : (
    <Num>
      {f[0]}
      <RangeArrow />
      {f[1]}px
    </Num>
  );
}

export function SunFloors() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-12 lg:grid-cols-12">
      <div className="grid content-start gap-6 lg:col-span-4">
        <p className="font-display text-h3 text-balance">
          אין טקסט קטן מ־<Num mono={false}>{FLOOR}px</Num> תחת שמש של צהריים.
        </p>
        <p className="text-body text-ink-2">
          במצב שמש המסך עובר ללבן ולדיו שחור, הקווים מתעבים ל־<Num>2px</Num> והצללים נעלמים. ארבעת השלבים הקטנים
          מקבלים רצפה גבוהה יותר, ומשקל גוף הטקסט עולה מ־<Num>400</Num> ל־<Num>500</Num>&nbsp;– כדי שהאותיות יחזיקו מול
          סנוור, עם כפפות, בשמש של אוגוסט.
        </p>
        <p className="text-caption text-ink-2">
          נסו: הפעילו „מצב שמש” בכותרת העליונה, והקריאות „עכשיו” בכל העמוד יקפצו לרצפות.
        </p>
      </div>

      <div className="grid content-start gap-4 lg:col-span-8">
        {/* axis + legend */}
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-micro text-ink-2">
            <span className="inline-flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-line-strong" aria-hidden="true" />
              רגיל
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-ink" aria-hidden="true" />
              מצב שמש
            </span>
          </p>
          <div className="relative h-5 text-micro text-ink-2" aria-hidden="true">
            {ticks
              .filter((v) => v % 2 === 0 || v === FLOOR)
              .map((v) => (
                <span
                  key={v}
                  className={cn(
                    'absolute top-0 -translate-x-1/2 leading-none rtl:translate-x-1/2',
                    v === FLOOR && 'font-bold text-ink',
                  )}
                  style={{ insetInlineStart: `${pct(v)}%` }}
                >
                  <Num>{v}</Num>
                </span>
              ))}
          </div>
        </div>

        <ol className="border-b-(length:--bw) border-line" aria-label="רצפות הגודל במצב שמש">
          {steps.map((s) => {
            const floor = sunTypeFloor[s.name]!;
            const id = `sun-sample-${s.name}`;
            return (
              <li key={s.name} className="grid gap-x-6 gap-y-4 border-t-(length:--bw) border-line py-5 sm:grid-cols-[10rem_1fr]">
                <div className="grid content-start gap-1">
                  <code dir="ltr" lang="en" className="font-mono text-caption font-medium">
                    text-{s.name}
                  </code>
                  <span className="text-micro text-ink-2">{s.use}</span>
                </div>
                <div className="grid gap-3">
                  <Ruler def={[s.min, s.max]} sun={floor} />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <p className="text-caption">
                      <span className="text-ink-2">רגיל</span> {px([s.min, s.max])}
                      <span className="text-ink-2"> · שמש </span>
                      <span className="font-bold">{px(floor)}</span>
                    </p>
                    <NowPx target={id} className="text-caption font-semibold text-sprout-ink" />
                  </div>
                  <p id={id} className={utility[s.name]}>
                    {sample[s.name]}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-micro text-ink-2">
          הקו השחור על הסרגל: <Num>{FLOOR}px</Num>, הרצפה המוחלטת. שום שלב לא יורד ממנה במצב שמש.
        </p>
      </div>
    </div>
  );
}
