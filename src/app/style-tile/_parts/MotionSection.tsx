import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { durations, spring, stagger } from '@/design/tokens';
import { CountUp } from './motion/CountUp';
import { DurationLab } from './motion/DurationLab';
import { EasingLab } from './motion/EasingLab';
import { GlyphInformation, GlyphNoBounce, GlyphPrecise, GlyphScroll } from './motion/Glyphs';
import { MagneticDemo } from './motion/MagneticDemo';
import { MotionPreference } from './motion/MotionPreference';
import { MAGNET } from './motion/spec';
import { StaggerField } from './motion/StaggerField';
import { Token } from './motion/Token';
import { Block, Section } from './Section';

/* ───────────────────────── 1 · principles ───────────────────────── */

const principles = [
  {
    Glyph: GlyphPrecise,
    title: 'אורגני, אבל מדויק',
    body: 'עקומות של צמיחה, לא של מכונה – וכל משך, השהיה ועקומה הם טוקן. שום ערך לא נכתב ביד.',
  },
  {
    Glyph: GlyphInformation,
    title: 'תנועה היא מידע',
    body: 'מים זורמים, נתונים צומחים, וכל השאר עומד במקום. אם משהו זז – יש לזה סיבה שאפשר לומר במילים.',
  },
  {
    Glyph: GlyphNoBounce,
    title: 'לעולם לא קפיצה על נתונים',
    body: 'מספר לא עובר את הערך שלו בדרך: בלי קפיץ, בלי הבהוב ובלי ספירה מאפס בכל רענון. הקפיץ שמור לכפתור אחד.',
  },
  {
    Glyph: GlyphScroll,
    title: 'גלילה היא זמן',
    body: 'לא חטיפה של השליטה: הגלילה מקדמת את העונה בקצב של היד – בלי האטה מלאכותית ובלי עצירות כפויות.',
  },
] as const;

function Principles() {
  return (
    <ol className="grid gap-x-(--gutter) gap-y-14 sm:grid-cols-2 lg:gap-y-20">
      {principles.map(({ Glyph, title, body }, i) => (
        <li key={title} className="grid content-start gap-4 border-t border-line pt-5">
          <div className="flex items-start justify-between gap-4">
            <Num className="text-caption font-medium text-sprout-ink">{String(i + 1).padStart(2, '0')}</Num>
            <Glyph />
          </div>
          <p className="font-display text-h3">{title}</p>
          <p className="max-w-[46ch] text-body text-ink-2">{body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ───────────────────────── 6 · magnetic spec ───────────────────────── */

function MagnetSpec() {
  const rows: Array<{ k: string; v: ReactNode }> = [
    {
      k: 'מתי',
      v: (
        <code>
          <Num className="inline-flex max-w-full break-words text-start text-micro">
            (hover: hover) and (pointer: fine)
          </Num>
        </code>
      ),
    },
    {
      k: 'תזוזה',
      v: (
        <>
          עד <Num>{MAGNET.max}px</Num> בכל ציר, <Num>{Math.round(MAGNET.strength * 100)}%</Num> מהמרחק אל המצביע
        </>
      ),
    },
    {
      k: 'מעקב',
      v: (
        <>
          <Token>ease-out-quint</Token> · <Num>{durations.fast.ms}ms</Num>
        </>
      ),
    },
    {
      k: 'חזרה',
      v: (
        <>
          קפיץ, <Token>ease-spring</Token> · <Num>{spring.durationMs}ms</Num>
        </>
      ),
    },
    { k: 'כבוי', v: 'מגע, מצביע גס ותנועה מופחתת – הכפתור פשוט נשאר במקומו' },
  ];
  return (
    <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-caption">
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

const policy: Array<{ what: string; full: ReactNode; reduced: ReactNode }> = [
  {
    what: 'שדה הגיבור',
    full: (
      <>
        החלקות נשרטטות, השתילים נובטים שורה אחר שורה והארגזים נערמים · <Num>{durations.season.ms}ms</Num>
      </>
    ),
    reduced: 'העונה המוגמרת, מיד – בלי שרטוט ובלי השהיות',
  },
  {
    what: 'ספירת מספרים',
    full: (
      <>
        מאפס אל הערך כשהמספר נכנס לתצוגה · <Token>out-expo</Token> · <Num>{durations.season.ms}ms</Num>
      </>
    ),
    reduced: 'הערך הסופי, מהרגע הראשון',
  },
  {
    what: 'חשיפת מצב שמש',
    full: (
      <>
        מעגל שמתרחב מהכפתור · <Token>out-expo</Token> · <Num>{durations.grow.ms}ms</Num>
      </>
    ),
    reduced: 'החלפה מיידית של הערכה',
  },
  {
    what: 'הודעות',
    full: (
      <>
        עולות ב־<Num>{durations.slow.ms}ms</Num>, נסגרות ב־<Num>{durations.fast.ms}ms</Num>{' '}
        <Token>in-quint</Token>, פס זמן מתקצר
      </>
    ),
    reduced: 'מופיעות ונעלמות במקום; פס הזמן מוסתר והטיימר ממשיך',
  },
  {
    what: 'כפתור מגנטי',
    full: (
      <>
        נמשך אחרי המצביע עד <Num>{MAGNET.max}px</Num> וחוזר בקפיץ
      </>
    ),
    reduced: 'כבוי – הכפתור נשאר במקומו',
  },
  {
    what: 'מעברי עמוד',
    full: (
      <>
        תנועת מצלמה · <Token>in-out-quart</Token> · <Num>{durations.grow.ms}ms</Num>
      </>
    ),
    reduced: 'חיתוך ישיר, בלי תזוזה',
  },
];

function ReducedPolicy() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
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
                className="text-body text-ink max-md:col-span-full max-md:whitespace-normal max-md:border-0 max-md:p-0"
              >
                {p.what}
              </th>
              <td role="cell" data-label="תנועה מלאה" className="text-ink-2 max-md:grid max-md:justify-start max-md:gap-1">
                <span>{p.full}</span>
              </td>
              <td role="cell" data-label="תנועה מופחתת" className="font-semibold max-md:grid max-md:justify-start max-md:gap-1">
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
 * 05 · תנועה – the motion system as an instrument panel for growth. Every
 * duration, curve and delay below is read from src/design/tokens.ts and
 * played with WAAPI, so the demo runs the exact values that ship.
 */
export function MotionSection() {
  return (
    <Section
      id="motion"
      surface="soil"
      intro={
        <p>
          תנועה אורגנית, אבל מדויקת: בממשק הזה דברים צומחים – לא קופצים ולא מקפצים. שישה משכים, שש עקומות וכלל
          השהיה אחד, כולם מקובץ הטוקנים, ואותו ערך עובד ב־CSS, ב־WAAPI וב־GSAP. כל לוח כאן חי: לחצו „הפעלה” או
          רחפו מעל עקומה.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="עקרונות" note="ארבעה כללים שכל מסך נמדד מולם">
          <Principles />
        </Block>

        <Block
          title="משכים"
          note={
            <>
              <Token>durations</Token> · שישה ערכים על ציר זמן אחד
            </>
          }
        >
          <DurationLab />
        </Block>

        <Block
          title="עקומות"
          note={
            <>
              <Token>easings</Token> · הזמן זורם מימין לשמאל, כמו הקריאה
            </>
          }
        >
          <EasingLab />
        </Block>

        <div className="grid gap-x-(--gutter) gap-y-20 lg:grid-cols-12">
          <Block
            className="lg:col-span-6"
            title="צמיחה שורה אחר שורה"
            note={
              <>
                <Token>staggerDelay()</Token> · <Num>{stagger.stepMs}ms</Num> לשורה
              </>
            }
          >
            <StaggerField />
          </Block>
          <Block
            className="lg:col-span-6"
            title="ספירה"
            note={
              <>
                <Token>out-expo</Token> · <Num>{durations.season.ms}ms</Num>
              </>
            }
          >
            <CountUp />
          </Block>
        </div>

        <div className="grid gap-x-(--gutter) gap-y-20 xl:grid-cols-12">
          <Block className="xl:col-span-5" title="כפתור מגנטי" note="פעולה ראשית אחת בכל מסך">
            <MagneticDemo />
            <MagnetSpec />
          </Block>
          <Block
            className="xl:col-span-7"
            title="תנועה מופחתת"
            note={<Token>prefers-reduced-motion: reduce</Token>}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <MotionPreference />
              <p className="text-caption text-ink-2">לא פחות מידע – רק פחות תזוזה.</p>
            </div>
            <ReducedPolicy />
            <p className="max-w-[62ch] text-caption text-ink-2">
              איך: ב־CSS כל <Token>--dur-*</Token> קורס ל־<Num>1ms</Num>, וכל אנימציית JS בודקת את{' '}
              <Token>matchMedia</Token> וקופצת למצב הסופי. מה שנשאר תמיד הוא המצב הסופי – אף פעם לא תוכן חסר.
            </p>
          </Block>
        </div>
      </div>
    </Section>
  );
}
