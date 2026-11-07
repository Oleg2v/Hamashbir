import type { ReactNode } from 'react';
import { seasonOpeningMs } from '@/components/illustrations/SeasonParcels';
import { Num } from '@/components/ui/Num';
import { durations, magnet, spring, stagger } from '@/design/tokens';
import { NB } from '@/lib/typography';
import { ReducedNote } from './motion/controls';
import { CountUp } from './motion/CountUp';
import { DurationLab } from './motion/DurationLab';
import { EasingLab } from './motion/EasingLab';
import { GlyphInformation, GlyphNoBounce, GlyphPrecise, GlyphScroll } from './motion/Glyphs';
import { MagneticDemo } from './motion/MagneticDemo';
import { MotionPreference } from './motion/MotionPreference';
import { StaggerField } from './motion/StaggerField';
import { Token } from './motion/Token';
import { Block, Section } from './Section';

/* ───────────────────────── 1 · principles ───────────────────────── */

const principles = [
  {
    Glyph: GlyphPrecise,
    title: 'אורגני, אבל מדויק',
    body: 'עקומות של צמיחה, לא של מכונה. כל משך, השהיה ועקומה באים מקובץ הטוקנים; ערך שנכתב ביד הוא באג.',
  },
  {
    Glyph: GlyphInformation,
    title: 'תנועה היא מידע',
    body: 'מים זורמים ונתונים צומחים; כל השאר עומד במקום. אם משהו זז – יש לזה סיבה שאפשר לומר במילים.',
  },
  {
    Glyph: GlyphNoBounce,
    title: 'נתונים לא קופצים',
    body: 'מספר לא עובר את הערך שלו בדרך: בלי קפיץ, בלי הבהוב ובלי ספירה מאפס בכל רענון. הקפיץ שמור לכפתור אחד.',
  },
  {
    Glyph: GlyphScroll,
    title: 'גלילה היא זמן',
    body: 'לא חטיפה של השליטה: הגלילה מקדמת את העונה בקצב של היד – בלי האטה מלאכותית ובלי עצירות כפויות.',
  },
] as const;

function Principles() {
  return (
    // one track per column, never wider than the list: at 200% text on a phone the glyph (7.5rem wide)
    // gives way, shrinking to the room beside its number instead of pushing the page sideways
    <ol className="grid grid-cols-[minmax(0,1fr)] gap-x-(--gutter) gap-y-14 sm:grid-cols-2 lg:gap-y-20">
      {principles.map(({ Glyph, title, body }, i) => (
        <li
          key={title}
          className="grid grid-cols-[minmax(0,1fr)] content-start gap-4 border-t-(length:--bw) border-line pt-5"
        >
          <div className="flex items-start justify-between gap-4 [&>svg]:min-w-0">
            {/* the list already numbers its items for assistive technology */}
            <Num aria-hidden="true" className="text-caption font-medium text-sprout-ink">
              {String(i + 1).padStart(2, '0')}
            </Num>
            <Glyph />
          </div>
          <h4 className="font-display text-title font-normal">{title}</h4>
          <p className="max-w-[46ch] text-body text-ink-2">{body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ───────────────────────── 6 · magnetic spec ───────────────────────── */

/** An LTR code value placed at inline-start; wrapped lines read left to right. */
function CodeLtr({ children }: { children: ReactNode }) {
  return (
    <code dir="ltr" className="inline-block max-w-full break-words text-micro">
      <Num>{children}</Num>
    </code>
  );
}

function MagnetSpec() {
  const rows: Array<{ k: string; v: ReactNode }> = [
    { k: 'מתי', v: <CodeLtr>(hover: hover) and (pointer: fine)</CodeLtr> },
    {
      k: 'אזור',
      v: (
        <>
          פי <Num>{magnet.reach}</Num>&nbsp;ממידות הכפתור, סביב מרכזו
        </>
      ),
    },
    {
      k: 'תזוזה',
      v: (
        <>
          <Num>{Math.round(magnet.strength * 100)}%</Num>&nbsp;מהמרחק ממרכז הכפתור, עד <Num>{magnet.max}px</Num>
          &nbsp;בכל ציר. מחוץ לכפתור המשיכה דועכת בעקומה רכה עד אפס בקצה האזור, כך שאין קפיצה בכניסה.
        </>
      ),
    },
    {
      k: 'מעקב',
      v: (
        <>
          <Token after={`${NB}·${NB}`}>ease-out-quint</Token>
          <Num>{durations.fast.ms}ms</Num>
        </>
      ),
    },
    {
      k: 'חזרה',
      v: (
        <>
          קפיץ, <Token after={`${NB}·${NB}`}>ease-spring</Token>
          <Num>{spring.durationMs}ms</Num>, ביציאה מהאזור או מהחלון ובגלילה
        </>
      ),
    },
    { k: 'כבוי', v: 'מגע, מצביע לא מדויק ותנועה מופחתת – הכפתור פשוט נשאר במקומו' },
  ];
  return (
    // the label column stops growing with the text on a phone (at 320px, 22.5vw is exactly 4.5rem), so at
    // 200% text a token and its mark („ease-spring ·”) keep room beside it
    <dl className="grid grid-cols-[min(4.5rem,22.5vw)_minmax(0,1fr)] gap-x-4 gap-y-3 text-caption">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="text-ink-3">{r.k}</dt>
          <dd className="min-w-0 text-ink-2">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ───────────────────────── 7 · reduced-motion policy ───────────────────────── */

const policy: Array<{ what: string; full: ReactNode; reduced: string }> = [
  {
    what: 'השדה במסך הפתיחה',
    full: (
      <>
        קווי החלקות מצטיירים, השתילים צומחים שורה אחר שורה והקרטונים נערמים&nbsp;· <Num>{seasonOpeningMs}ms</Num>
      </>
    ),
    reduced: 'העונה המוגמרת, מיד – בלי שרטוט ובלי השהיות',
  },
  {
    what: 'ספירת מספרים',
    full: (
      <>
        מאפס אל הערך כשהמספר נכנס לתצוגה&nbsp;· <Token after={`${NB}·${NB}`}>out-expo</Token>
        <Num>{durations.season.ms}ms</Num>
      </>
    ),
    reduced: 'הערך הסופי, מהרגע הראשון',
  },
  {
    what: 'חשיפת מצב שמש',
    full: (
      <>
        מעגל שמתרחב מהכפתור&nbsp;· <Token after={`${NB}·${NB}`}>out-expo</Token>
        <Num>{durations.grow.ms}ms</Num>
      </>
    ),
    reduced: 'החלפה מיידית של ערכת הנושא',
  },
  {
    what: 'הודעות',
    full: (
      <>
        עולות ב־<Num>{durations.slow.ms}ms</Num>, נסגרות ב־<Num>{durations.fast.ms}ms</Num>&nbsp;
        <Token after=",">in-quint</Token>
        {' ופס הזמן מתקצר'}
      </>
    ),
    reduced: 'מופיעות ונעלמות במקום; פס הזמן מוסתר והטיימר ממשיך',
  },
  {
    what: 'כפתור מגנטי',
    full: (
      <>
        נמשך אחרי המצביע עד <Num>{magnet.max}px</Num>&nbsp;וחוזר בקפיץ
      </>
    ),
    reduced: 'כבוי – הכפתור נשאר במקומו',
  },
  {
    what: 'מעברי עמוד',
    full: (
      <>
        תנועת מצלמה&nbsp;· <Token after={`${NB}·${NB}`}>in-out-quart</Token>
        <Num>{durations.grow.ms}ms</Num>
      </>
    ),
    reduced: 'חיתוך ישיר, בלי תזוזה',
  },
];

/** Stacks into cards at the same width as every other `.table--stack` (56rem). */
function ReducedPolicy() {
  return (
    <div className="table-wrap rounded-lg border-(length:--bw) border-line bg-surface">
      <table className="table table--stack" role="table">
        <caption className="sr-only">מה משתנה בכל רכיב כשהמכשיר מבקש תנועה מופחתת</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              רכיב
            </th>
            <th scope="col" role="columnheader">
              תנועה מלאה
            </th>
            <th scope="col" role="columnheader">
              תנועה מופחתת
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {policy.map((p) => (
            <tr role="row" key={p.what}>
              <th
                scope="row"
                role="rowheader"
                className="text-body text-ink max-[56rem]:border-0 max-[56rem]:p-0 max-[56rem]:whitespace-normal"
              >
                {p.what}
              </th>
              <td
                role="cell"
                data-label="תנועה מלאה"
                className="text-ink-2 max-[56rem]:grid max-[56rem]:justify-start max-[56rem]:gap-1"
              >
                <span>{p.full}</span>
              </td>
              <td
                role="cell"
                data-label="תנועה מופחתת"
                className="font-semibold max-[56rem]:grid max-[56rem]:justify-start max-[56rem]:gap-1"
              >
                <span>{p.reduced}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── section ───────────────────────── */

/**
 * 06 · תנועה – the motion system as an instrument panel for growth. Every
 * duration, curve and delay below is read from src/design/tokens.ts and
 * played with WAAPI, so the demo runs the exact values that ship. Each lab
 * renders its own Block so its play control sits in the Block `action` slot.
 */
export function MotionSection() {
  return (
    <Section
      id="motion"
      surface="soil"
      intro={
        <p>
          תנועה אורגנית, אבל מדויקת: בממשק הזה דברים צומחים&nbsp;– לא קופצים ולא מקפצים. שישה משכים ועוד קצב לקפיץ, שש
          עקומות וכלל השהיה אחד, כולם מקובץ הטוקנים, ואותו ערך עובד ב־CSS, ב־WAAPI וב־GSAP. כל לוח כאן אינטראקטיבי: לחצו
          „הפעלה” או רחפו מעל עקומה.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-24">
        <Block title="עקרונות" note="ארבעה כללים שכל מסך נמדד מולם">
          <Principles />
        </Block>

        <DurationLab
          title="משכים"
          note={
            <>
              <Token after={`${NB}·`}>durations</Token>
              {' שישה ערכים על ציר זמן אחד. לקפיץ יש קצב משלו, '}
              <Num>{spring.durationMs}ms</Num>
              {', והוא מוצג עם העקומות. כל פס מתמלא בזמן אמת, בדיוק במשך שלו; שנתה קטנה כל '}
              <Num>{stagger.stepMs}ms</Num>&nbsp;– צעד ההשהיה בין שורות. <ReducedNote />
            </>
          }
        />

        <EasingLab
          title="עקומות"
          note={
            <>
              <Token after={`${NB}·`}>easings</Token>
              {' הזמן זורם מימין לשמאל, כמו הקריאה. כל כרטיס מתנגן גם לבד: בריחוף, במעבר במקלדת או בכפתור שלו.'}
            </>
          }
        />

        <div className="grid gap-x-(--gutter) gap-y-20 lg:grid-cols-12">
          <StaggerField
            className="content-start lg:col-span-6"
            title="צמיחה שורה אחר שורה"
            note={
              <>
                <Token after={`${NB}·${NB}`}>staggerDelay()</Token>
                <Num>{stagger.stepMs}ms</Num>&nbsp;לשורה
              </>
            }
          />
          <CountUp
            className="content-start lg:col-span-6"
            title="ספירה"
            note={
              <>
                <Token after={`${NB}·${NB}`}>out-expo</Token>
                <Num>{durations.season.ms}ms</Num>&nbsp;· פעם אחת, כשהמספר נכנס לתצוגה
              </>
            }
          />
        </div>

        <div className="grid gap-x-(--gutter) gap-y-20 xl:grid-cols-12">
          <Block className="content-start xl:col-span-5" title="כפתור מגנטי" note="פעולה ראשית אחת בכל מסך">
            <MagneticDemo />
            <MagnetSpec />
          </Block>
          <Block
            className="content-start xl:col-span-7"
            title="תנועה מופחתת"
            note={
              <>
                <Token after={`${NB}·`}>prefers-reduced-motion: reduce</Token>
                {' לא פחות מידע, רק פחות תזוזה'}
              </>
            }
            action={<MotionPreference />}
          >
            <ReducedPolicy />
            <p className="max-w-[60ch] text-caption text-ink-2">
              איך: ב־CSS כל <Token>--dur-*</Token> קורס ל־<Num>1ms</Num>
              {', וכל אנימציית JS בודקת את '}
              <Token>matchMedia</Token> וקופצת למצב הסופי. מה שנשאר תמיד הוא המצב הסופי&nbsp;– אף פעם לא תוכן חסר.
            </p>
          </Block>
        </div>
      </div>
    </Section>
  );
}
