import type { ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';
import { CodePoint, Mark, Nums, Verdict } from './bits';

type Rule = {
  title: ReactNode;
  why: ReactNode;
  good: ReactNode;
  bad: ReactNode;
  goodNote: ReactNode;
  badNote: ReactNode;
  /** spans both columns on desktop */
  wide?: boolean;
  /** panes stacked, full width each (the measure rule needs the width) */
  stack?: boolean;
  /** extra line under the panes */
  coda?: ReactNode;
};

const para =
  'התוכנית מתחילה מהשדה: הגידול, מספר הדונמים ותאריך השתילה. מכאן נבנה סל לכל שלב\u00A0– זרעים ושתילים לזריעה, טפטוף ומסננים להשקיה, ציוד לקטיף וקרטונים לאריזה. כל פריט מגיע עם כמות מחושבת, מחיר ומלאי בזמן אמת בסניף הקרוב אליכם, כך שאפשר להזמין היום ולאסוף מחר בבוקר.';

const short = 'הזינו את הגידול, הדונמים ותאריך השתילה, ונבנה לכם סל לכל שלב בעונה\u00A0– עם כמויות, מחיר ומלאי בסניף הקרוב.';

const rules: Rule[] = [
  {
    title: 'גרשיים וגרש, לא מירכאות',
    why: 'קיצורים וראשי תיבות מקבלים גרשיים (״) וגרש (׳)\u00A0– סימנים עבריים, נטויים ומכווננים לאות. מירכאות ישרות הן שארית של מכונת כתיבה.',
    good: (
      <p className="text-title text-balance">
        טפטוף <Num>16</Num>&nbsp;מ<Mark ok>״</Mark>מ&nbsp;· <Num>3</Num>&nbsp;ק<Mark ok>״</Mark>מ ממך&nbsp;· פלפל צ
        <Mark ok>׳</Mark>ילי
      </p>
    ),
    bad: (
      <p className="text-title text-balance">
        טפטוף <Num>16</Num>&nbsp;מ<Mark ok={false}>{'"'}</Mark>מ&nbsp;· <Num>3</Num>&nbsp;ק<Mark ok={false}>{'"'}</Mark>מ ממך&nbsp;·
        פלפל צ
        <Mark ok={false}>{"'"}</Mark>ילי
      </p>
    ),
    goodNote: (
      <>
        גרשיים <CodePoint ch="״" /> · גרש <CodePoint ch="׳" />
      </>
    ),
    badNote: (
      <>
        מירכאות <CodePoint ch={'"'} /> · גרש מקלדת <CodePoint ch={"'"} />
      </>
    ),
  },
  {
    title: 'קו מפריד, עם רווח משני צדיו',
    why: 'משפט שנשבר באמצע מקבל קו מפריד (–) ורווח משני צדיו, והרווח שלפניו בלתי שביר\u00A0– כך הקו לעולם לא פותח שורה. מקף המקלדת קצר מדי, ונבלע בין המילים.',
    good: (
      <p className="text-title text-balance">
        זרעים, השקיה ודשנים&nbsp;<Mark ok>–</Mark> בתוכנית אחת
      </p>
    ),
    bad: (
      <p className="text-title text-balance">
        זרעים, השקיה ודשנים&nbsp;<Mark ok={false}>-</Mark> בתוכנית אחת
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
    why: 'אות שימוש שנצמדת למספר מתחברת במקף העברי (־), שיושב בגובה הקו העליון. מקף המקלדת יושב באמצע הגובה, וקורא מסך עלול להקריא אותו כ״מינוס״.',
    good: (
      <p className="text-title text-balance">
        איסוף ב<Mark ok>־</Mark>
        <Num>14</Num>&nbsp;סניפים&nbsp;· ל<Mark ok>־</Mark>
        <Num>5,000</Num>&nbsp;דונם
      </p>
    ),
    bad: (
      <p className="text-title text-balance">
        איסוף ב<Mark ok={false}>-</Mark>
        <Num>14</Num>&nbsp;סניפים&nbsp;· ל<Mark ok={false}>-</Mark>
        <Num>5,000</Num>&nbsp;דונם
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
        בעברית אין אותיות רישיות, ולכן אין מה „לפתוח”: ריווח רק מפרק את צורת המילה. הידוק אופטי קל&nbsp;– עד{' '}
        <Num>−0.02em</Num>&nbsp;– מותר בגדלי תצוגה בלבד.
      </>
    ),
    good: <p className="text-title font-bold text-balance">מלאי בסניף הקרוב</p>,
    bad: <p className="text-title font-bold tracking-[0.3em] text-balance">מלאי בסניף הקרוב</p>,
    goodNote: <Num>letter-spacing: 0</Num>,
    badNote: <Num>letter-spacing: 0.3em</Num>,
  },
  {
    title: (
      <>
        כל מספר בבידוד: <code dir="ltr" lang="en" className="font-mono">&lt;bdi&gt;</code>
      </>
    ),
    why: (
      <>
        מספר בתוך משפט עברי עובר דרך <code dir="ltr" lang="en" className="font-mono">&lt;Num&gt;</code>&nbsp;– בידוד
        כיווניות ב־<code dir="ltr" lang="en" className="font-mono">&lt;bdi dir=&quot;ltr&quot;&gt;</code>. בלי בידוד,
        האלגוריתם הדו־כיווני מסדר את הסימנים מחדש. זה לא תיאורטי&nbsp;– כך הדפדפן הזה מציג את אותה מחרוזת בדיוק:
      </>
    ),
    good: (
      <div className="grid gap-3 text-title text-balance">
        <p>
          התראת קרה: <Mark ok>
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
      <div className="grid gap-3 text-title text-balance">
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
    goodNote: 'המינוס צמוד לספרה, הטווח מ־40 עד 60',
    badNote: 'המינוס ברח לצד השני, והטווח התהפך',
    wide: true,
    coda: (
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t-(length:--bw) border-line pt-5 text-body">
        <span className="font-bold">בהתראת קרה, סימן המינוס הוא כל ההבדל.</span>
        <span className="text-ink-2">
          בלי בידוד המינוס נראה כמו קו מפריד, <Num>−2°</Num> נקרא כמו <Num>2°</Num>&nbsp;– והתראה שאמורה להציל יבול
          נקראת כמו עוד לילה רגיל.
        </span>
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
        סואץ כבדה ודחוסה&nbsp;– היא נבנתה לגדלים של <Num>31px</Num> ומעלה. בגוף טקסט העיניים הפנימיות של האותיות
        נסגרות, והפסקה הופכת לכתם.
      </>
    ),
    good: <p className="text-body">{short}</p>,
    bad: <p className="font-display text-body">{short}</p>,
    goodNote: (
      <>
        <span lang="en">Assistant</span> · <Num>text-body · 400</Num>
      </>
    ),
    badNote: (
      <>
        <span lang="en">Suez One</span> · <Num>text-body</Num>
      </>
    ),
  },
  {
    title: 'אין כותרות־על לטיניות במוצר',
    why: 'בממשק המוצר הכול בעברית. תווית־על באנגלית, ברישיות מרווחות, היא קישוט מיובא\u00A0– החקלאי לא צריך לתרגם כדי לדעת איפה הוא.',
    good: (
      <div className="grid gap-2">
        <p className="text-caption font-bold text-ink-2">
          שלב <Num>2</Num> · השקיה
        </p>
        <p className="text-title font-bold text-balance">
          טפטוף לחלקה <Num mono={false}>3</Num>
        </p>
      </div>
    ),
    bad: (
      <div className="grid gap-2">
        <p lang="en" className="text-micro font-bold tracking-[0.2em] text-ink-2">
          STAGE <Num>02</Num> · IRRIGATION
        </p>
        <p className="text-title font-bold text-balance">
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
        גובה שורה <Num mono={false}>1.6</Num>, ובין <Num mono={false}>45</Num> ל־<Num mono={false}>75</Num> תווים
        בשורה
      </>
    ),
    why: 'גוף טקסט נקרא בגובה שורה 1.6 ובשורות של 45 עד 75 תווים. שורה ארוכה מדי מאבדת את העין בדרך חזרה לתחילת השורה; שורה צפופה נדבקת לשכנה שלה.',
    good: <p className="max-w-[50ch] text-body">{para}</p>,
    bad: <p className="text-body leading-[1.15]">{para}</p>,
    goodNote: (
      <>
        גובה שורה <Num>1.6</Num> · כ־<Num>60</Num> תווים בשורה
      </>
    ),
    badNote: (
      <>
        גובה שורה <Num>1.15</Num> · בלי גבול מידה
      </>
    ),
    wide: true,
    stack: true,
  },
];

function Pane({ ok, note, children }: { ok: boolean; note: ReactNode; children: ReactNode }) {
  return (
    <figure
      className={cn(
        'grid min-w-0 content-start gap-5 rounded-md border-(length:--bw) border-line border-t-4 bg-canvas p-5 sm:p-6',
        ok ? 'border-t-sprout-ink' : 'border-t-harvest-ink',
      )}
    >
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Verdict ok={ok} />
        <span className="text-micro text-ink-2">{typeof note === 'string' ? <Nums>{note}</Nums> : note}</span>
      </figcaption>
      <div className="min-w-0">{children}</div>
    </figure>
  );
}

export function Rules() {
  return (
    <ol className="grid gap-x-(--gutter) gap-y-6 lg:grid-cols-2 lg:gap-y-8" aria-label="כללי סדר עבריים">
      {rules.map((r, i) => (
        <li
          key={i}
          className={cn(
            'grid min-w-0 gap-6 rounded-lg border-(length:--bw) border-line bg-surface p-5 sm:p-8',
            r.coda ? 'grid-rows-[auto_1fr_auto]' : 'grid-rows-[auto_1fr]',
            r.wide && 'lg:col-span-2',
          )}
        >
          <header className="grid gap-2">
            <div className="flex items-baseline gap-3">
              <Num className="text-caption font-medium text-ink-3">{String(i + 1).padStart(2, '0')}</Num>
              <h4 className="text-title font-bold leading-tight">{r.title}</h4>
            </div>
            <p className="max-w-[68ch] text-body text-ink-2">
              {/* plain-string copy still puts its numbers through <Num> */}
              {typeof r.why === 'string' ? <Nums>{r.why}</Nums> : r.why}
            </p>
          </header>
          {/* stacked by default: both examples start at the same edge, so they compare line over line */}
          <div className={cn('grid gap-4', !r.wide && 'auto-rows-fr', r.wide && !r.stack && 'lg:grid-cols-2')}>
            <Pane ok note={r.goodNote}>
              {r.good}
            </Pane>
            <Pane ok={false} note={r.badNote}>
              {r.bad}
            </Pane>
          </div>
          {r.coda}
        </li>
      ))}
    </ol>
  );
}
