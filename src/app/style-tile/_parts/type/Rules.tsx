import type { ReactNode } from 'react';
import { ChevronDownIcon } from '@/components/ui/icons';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { Verdict } from '@/components/ui/Verdict';
import { demoFarm, dripAvailability, season } from '@/data/demo-farm';
import { posterType, typeScale } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { Code, CodePoint, Mark } from './bits';

type Rule = {
  title: ReactNode;
  /** the long explanation – folded into <details> */
  why: ReactNode;
  good: ReactNode;
  bad: ReactNode;
  goodNote: ReactNode;
  badNote: ReactNode;
  /** grid footprint at xl: 1 (default), 2 or the full row */
  span?: 2 | 4;
  /** always-visible line under the panes */
  coda?: ReactNode;
};

const titleStep = typeScale.find((s) => s.name === 'title')!;
/** the tightest tracking anywhere in the system (the poster) */
const tightest = posterType.tracking.replace('-', '−');

const para =
  'התוכנית מתחילה מהשדה: הגידול, מספר הדונמים ותאריך השתילה. מכאן נבנה סל לכל שלב\u00A0– זרעים ושתילים לזריעה ולשתילה, טפטוף ומסננים להשקיה, ציוד לקטיף וקרטונים לאריזה. כל פריט מגיע עם כמות מחושבת, מחיר ומלאי בזמן אמת בסניף הקרוב אליך: הזמינו עד 12:00 ואספו היום.';

const short = 'הזינו את הגידול והדונמים\u00A0– ונבנה לך סל לכל שלב בעונה.';

/* every sample sits at one size, so the panes compare glyph for glyph */
const sampleSize = 'text-lead';

const rules: Rule[] = [
  {
    title: 'גרשיים וגרש, לא מירכאות',
    why: 'ראשי תיבות מקבלים גרשיים (״): מ״מ, ק״מ. קיצורים מקבלים גרש (׳): מ׳, יח׳. אלה סימנים עבריים, נטויים ומכווננים לאות; מירכאות ישרות ואפוסטרוף הם שריד של מכונת הכתיבה.',
    // the demo farm's drip line: a 16 mm lateral, 50,000 m of it
    good: (
      <p className={sampleSize}>
        <Num>16</Num>&nbsp;מ<Mark ok>״</Mark>מ&nbsp;· <Num>{formatNumber(season.dripMeters)}</Num>&nbsp;מ
        <Mark ok>׳</Mark>
      </p>
    ),
    bad: (
      <p className={sampleSize}>
        <Num>16</Num>&nbsp;מ<Mark ok={false}>{'"'}</Mark>מ&nbsp;· <Num>{formatNumber(season.dripMeters)}</Num>
        &nbsp;מ<Mark ok={false}>{"'"}</Mark>
      </p>
    ),
    goodNote: (
      <>
        גרשיים <CodePoint ch="״" /> · גרש <CodePoint ch="׳" />
      </>
    ),
    badNote: (
      <>
        מירכאות <CodePoint ch={'"'} /> · אפוסטרוף <CodePoint ch={"'"} />
      </>
    ),
  },
  {
    title: 'קו מפריד, עם\u00A0רווח משני צדיו', // the preposition never ends a line
    why: 'משפט שנשבר באמצע מקבל קו מפריד (–) ורווח משני צדיו, והרווח שלפניו בלתי שביר\u00A0– כך הקו לעולם לא פותח שורה. מקף המקלדת (-) קצר מדי, ונבלע בין המילים.',
    good: (
      <p className={sampleSize}>
        זרעים ודשנים&nbsp;<Mark ok>–</Mark> בסל אחד
      </p>
    ),
    bad: (
      <p className={sampleSize}>
        זרעים ודשנים&nbsp;<Mark ok={false}>-</Mark> בסל אחד
      </p>
    ),
    goodNote: (
      <>
        קו מפריד <CodePoint ch="–" />
      </>
    ),
    badNote: (
      <>
        מקף מקלדת <CodePoint ch="-" />
      </>
    ),
  },
  {
    title: 'מקף עברי לפני ספרה',
    why: 'אות שימוש שנצמדת למספר מתחברת במקף העברי (־), שיושב בגובה הקו העליון. מקף המקלדת יושב באמצע הגובה, וקורא מסך עלול להקריא אותו כ„מינוס”.',
    // the network's real size (the hero's „21 נקודות”) and the demo farm – never a count that contradicts them
    good: (
      <p className={sampleSize}>
        ב<Mark ok>־</Mark>
        <Num>{dripAvailability.networkPoints}</Num>&nbsp;נקודות&nbsp;· ל<Mark ok>־</Mark>
        <Num>{demoFarm.area}</Num>&nbsp;דונם
      </p>
    ),
    bad: (
      <p className={sampleSize}>
        ב<Mark ok={false}>-</Mark>
        <Num>{dripAvailability.networkPoints}</Num>&nbsp;נקודות&nbsp;· ל<Mark ok={false}>-</Mark>
        <Num>{demoFarm.area}</Num>&nbsp;דונם
      </p>
    ),
    goodNote: (
      <>
        מקף <CodePoint ch="־" />, בגובה הקו העליון
      </>
    ),
    badNote: (
      <>
        מקף מקלדת <CodePoint ch="-" />, באמצע הגובה
      </>
    ),
  },
  {
    title: 'בלי ריווח אותיות',
    why: (
      <>
        בעברית אין אותיות רישיות, ולכן אין מה „לפתוח”: ריווח רק מפרק את צורת המילה. הידוק אופטי קל, עד{' '}
        <Num>{tightest}</Num>, מותר בגדלי תצוגה בלבד.
      </>
    ),
    good: <p className={cn(sampleSize, 'font-bold')}>מלאי בסניף הקרוב</p>,
    bad: <p className={cn(sampleSize, 'font-bold tracking-[0.3em]')}>מלאי בסניף הקרוב</p>,
    goodNote: <Code>letter-spacing: 0</Code>,
    badNote: <Code>letter-spacing: 0.3em</Code>,
  },
  {
    title: (
      <>
        כל מספר בבידוד: <Code>&lt;bdi&gt;</Code>
      </>
    ),
    why: (
      <>
        מספר בתוך משפט עברי עובר דרך <Code>&lt;Num&gt;</Code>&nbsp;– בידוד כיווניות ב־
        <Code>&lt;bdi dir=&quot;ltr&quot;&gt;</Code>. בלי בידוד, האלגוריתם הדו־כיווני מסדר את הסימנים מחדש. שתי הדוגמאות
        הן אותה מחרוזת בדיוק, כפי שהדפדפן הזה מציג אותה.
      </>
    ),
    good: (
      <div className={cn('grid gap-2', sampleSize)}>
        <p>
          התראת קרה:{' '}
          <Mark ok>
            <Num>−2°</Num>
          </Mark>{' '}
          הלילה
        </p>
        <p>
          מרווח שתילה <Num>40–60</Num>&nbsp;ס״מ
        </p>
      </div>
    ),
    bad: (
      // deliberately NOT isolated: the reordering below is the failure we document.
      // Plain spans (no bdi, no dir) keep the digits in mono, so isolation is the only difference.
      <div className={cn('grid gap-2', sampleSize)}>
        <p>
          {'התראת קרה: '}
          <span className="font-mono">
            <Mark ok={false}>−</Mark>
            {'2°'}
          </span>
          {' הלילה'}
        </p>
        <p>
          {'מרווח שתילה '}
          <span className="font-mono">{'40–60'}</span>
          {' ס״מ'}
        </p>
      </div>
    ),
    goodNote: 'עם בידוד: המינוס צמוד לספרה, הטווח 40–60',
    badNote: 'בלי בידוד: המינוס ברח לצד השני, והטווח התהפך',
    span: 2,
    coda: (
      <p className="text-caption text-ink-2">
        <span className="font-bold text-ink">בהתראת קרה, סימן המינוס הוא כל ההבדל.</span> בלי בידוד המינוס נראה כמו קו
        מפריד, <Num>−2°</Num>&nbsp;נקרא כמו <Num>2°</Num>&nbsp;– והתראה שאמורה להציל יבול נקראת כמו עוד לילה רגיל.
      </p>
    ),
  },
  {
    title: (
      <>
        <span lang="en">Suez One</span> לעולם לא בגוף טקסט
      </>
    ),
    why: (
      <>
        סואץ כבדה ודחוסה: בגודל של גוף טקסט החללים הפנימיים של האותיות מצטמקים, והפסקה הופכת לכתם כהה. זה הכלל שלנו, לא
        של הגופן: אצלנו <span lang="en">Suez One</span> מתחילה ב־<Code>title</Code> (<Num>{titleStep.min}px</Num>)
        ומעלה, ורק בכותרות.
      </>
    ),
    good: <p className="text-body">{short}</p>,
    bad: <p className="font-display text-body">{short}</p>,
    goodNote: (
      <>
        <span lang="en">Assistant</span> · <Code>text-body · 400</Code>
      </>
    ),
    badNote: (
      <>
        <span lang="en">Suez One</span> · <Code>text-body</Code>
      </>
    ),
  },
  {
    title: 'אין כותרות־על לטיניות במוצר',
    why: 'בממשק המוצר הכול בעברית. תווית־על באנגלית, ברישיות מרווחות, היא קישוט מיובא\u00A0– החקלאי לא צריך לתרגם כדי לדעת איפה הוא.',
    good: (
      <div className="grid gap-1">
        <p className="text-caption font-bold text-ink-2">
          שלב <Num>2</Num> · השקיה
        </p>
        <p className={cn(sampleSize, 'font-bold')}>
          טפטוף לחלקה <Num mono={false}>3</Num>
        </p>
      </div>
    ),
    bad: (
      <div className="grid gap-1">
        <p lang="en" className="text-micro font-bold tracking-[0.2em] text-ink-2">
          STAGE <Num>02</Num> · IRRIGATION
        </p>
        <p className={cn(sampleSize, 'font-bold')}>
          טפטוף לחלקה <Num mono={false}>3</Num>
        </p>
      </div>
    ),
    goodNote: 'תווית בעברית, משקל 700, בלי ריווח',
    badNote: 'לטינית, רישיות וריווח',
  },
  {
    title: (
      <>
        {/* Assistant digits in a heading: Plex's full-cell period reads "1 . 6" at this size */}
        {/* one text node up to the number: a lone {' '} before a <bdi> drops out of Chrome's accessible name */}
        גובה שורה <Num mono={false}>1.6</Num>
        {', ושורות של '}
        <Num mono={false} className="whitespace-nowrap">
          45–75
        </Num>
        &nbsp;תווים
      </>
    ),
    why: (
      <>
        גוף טקסט נקרא בגובה שורה <Num>1.6</Num>&nbsp;ובשורות של <Num className="whitespace-nowrap">45–75</Num>
        &nbsp;תווים. בשורה ארוכה מדי העין הולכת לאיבוד בדרך חזרה לתחילת השורה; שורה צפופה נדבקת לשכנה שלה.
      </>
    ),
    good: (
      // 50ch of the zero glyph sets about 60 Hebrew characters a line (measured: 58–60)
      <p className="max-w-[50ch] text-body">
        <NumText>{para}</NumText>
      </p>
    ),
    bad: (
      <p className="text-body leading-[1.15]">
        <NumText>{para}</NumText>
      </p>
    ),
    goodNote: 'גובה שורה 1.6 · כ־60 תווים בשורה',
    badNote: 'גובה שורה 1.15 · בלי גבול מידה',
    span: 4,
  },
];

function Pane({ ok, note, children }: { ok: boolean; note: ReactNode; children: ReactNode }) {
  return (
    <figure
      className={cn(
        'grid min-w-0 content-start gap-2 rounded-md border-(length:--bw) border-line bg-canvas p-3',
        'border-t-[length:calc(var(--bw)*3)]',
        ok ? 'border-t-sprout-ink' : 'border-t-harvest-ink',
      )}
    >
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Verdict ok={ok} />
        <span className="text-micro text-ink-2">{typeof note === 'string' ? <NumText>{note}</NumText> : note}</span>
      </figcaption>
      <div className="min-w-0">{children}</div>
    </figure>
  );
}

/**
 * The explanation folds away; its summary sits in the card's corner, so a
 * closed card spends no height on it and an open one shows the text right
 * under the title it explains.
 */
function Why({ topic, children }: { topic: ReactNode; children: ReactNode }) {
  return (
    <details className="group">
      <summary
        className={cn(
          'mt-2 inline-flex min-h-(--target) min-w-(--target) cursor-pointer list-none items-center justify-center gap-1 rounded-full',
          'border-(length:--bw) border-line px-3 text-caption font-bold text-ink-2',
          'transition-colors duration-(--dur-fast) ease-out-quint hover:border-ink hover:text-ink',
          'group-open:border-ink group-open:text-ink [&::-webkit-details-marker]:hidden',
        )}
      >
        למה
        {/* the rule's title makes each of the eight names unique („למה – ההסבר המלא: …”) */}
        <span className="sr-only">&nbsp;– ההסבר המלא: {topic}</span>
        <ChevronDownIcon
          size={16}
          strokeWidth={2}
          className="transition-transform duration-(--dur-fast) ease-out-quint group-open:rotate-180"
        />
      </summary>
      <p className="mt-3 max-w-[68ch] text-caption text-ink-2">{children}</p>
    </details>
  );
}

const spanCls = {
  1: '',
  2: 'sm:col-span-2',
  4: 'sm:col-span-2 xl:col-span-4',
} as const;

export function Rules() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="כללי סדר עבריים">
      {rules.map((r, i) => {
        const span = r.span ?? 1;
        return (
          <li
            key={i}
            className={cn(
              'relative flex min-w-0 flex-col rounded-lg border-(length:--bw) border-line bg-surface p-4',
              spanCls[span],
            )}
          >
            {/* titles reserve two lines, so the panes start level across a row */}
            <h4 className="flex items-baseline gap-3 font-sans text-lead font-extrabold sm:min-h-[2lh]">
              {/* the list already numbers the rules for screen readers: no „1. 01” */}
              <span className="text-caption font-medium text-ink-3" aria-hidden="true">
                <Num>{String(i + 1).padStart(2, '0')}</Num>
              </span>
              <span>{r.title}</span>
            </h4>
            <Why topic={r.title}>{typeof r.why === 'string' ? <NumText>{r.why}</NumText> : r.why}</Why>
            {/* wide rules compare side by side; the measure rule gives the bad pane the long line it needs.
                The panes stretch to the card's height, so a taller neighbour leaves no hole above the coda. */}
            <div
              className={cn(
                'mt-4 grid flex-1 content-stretch gap-3',
                span === 2 && 'sm:grid-cols-2',
                span === 4 && 'xl:grid-cols-[5fr_7fr]',
              )}
            >
              <Pane ok note={r.goodNote}>
                {r.good}
              </Pane>
              <Pane ok={false} note={r.badNote}>
                {r.bad}
              </Pane>
            </div>
            {r.coda ? <div className="mt-4 border-t-(length:--bw) border-line pt-3">{r.coda}</div> : null}
          </li>
        );
      })}
    </ol>
  );
}
