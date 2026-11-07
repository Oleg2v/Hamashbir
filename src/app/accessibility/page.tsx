import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { SunModeToggle } from '@/components/ui/SunModeToggle';
import { formatDate } from '@/lib/format';
import { NB } from '@/lib/typography';

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description: 'הצהרת נגישות (טיוטה) לקונספט פורטל החקלאי „העונה שלך”: WCAG 2.0 AA ות״י 5568.',
};

/**
 * Draft accessibility statement for the concept (IS 5568 / WCAG 2.0 AA).
 * Contact details are placeholders until the client names its coordinator.
 */
export default function AccessibilityPage() {
  return (
    <div data-surface="paper" className="min-h-dvh">
      {/* the statement offers the same outdoor mode it describes */}
      <header className="wrap @container/bar flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6 lg:pt-10">
        <Link href="/style-tile" className="inline-flex min-h-(--target) items-center no-underline">
          <Wordmark compact />
          <span className="sr-only"> – חזרה ללוח הסגנון</span>
        </Link>
        <SunModeToggle />
      </header>
      <main id="main" tabIndex={-1} className="outline-none">
        {/* .wrap keeps the page margins; the inner column holds the measure (45–75 characters) */}
        <div className="wrap pb-16 pt-10 lg:pb-24 lg:pt-14">
          <div className="max-w-[40rem]">
            <h1 className="text-h1">הצהרת נגישות</h1>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-caption text-ink-2">
              <span>
                טיוטה לקונספט · עודכן <Num>{formatDate(new Date(2026, 10, 6))}</Num>
              </span>
              <DemoTag>טיוטה</DemoTag>
            </p>

            <div className="mt-12 grid gap-10 text-body">
              <section aria-labelledby="a11y-goal" className="grid gap-3">
                <h2 id="a11y-goal" className="text-h3">
                  המחויבות שלנו
                </h2>
                <p>
                  {/* spaces next to elements live inside string literals: a lone {' '} is dropped from
                      Chrome's accessibility tree after server rendering (lint:rtl flags it) */}
                  הפורטל נבנה מהיום הראשון לפי תקן ישראלי ת״י{NB}
                  <Num>5568</Num>
                  {' (המבוסס על '}
                  <span lang="en" dir="ltr">
                    WCAG 2.0
                  </span>
                  {' ברמה AA), ובעברית מימין לשמאל. המטרה: שכל חקלאי יוכל לתכנן עונה, לבדוק מלאי ולהזמין'}
                  {NB}– גם בשטח, בשמש של צהריים, עם כפפות או עם קורא מסך.
                </p>
              </section>

              <section aria-labelledby="a11y-done" className="grid gap-3">
                <h2 id="a11y-done" className="text-h3">
                  מה כבר קיים
                </h2>
                <ul className="grid list-disc gap-2 ps-6">
                  <li>ניווט מלא במקלדת, קישור „דלג לתוכן הראשי” ופוקוס גלוי בכל רכיב.</li>
                  <li>
                    „מצב שמש”: ניגודיות מרבית, קווים של <Num>2</Num>
                    {NB}פיקסלים, אזורי מגע של <Num>56</Num>
                    {NB}פיקסלים וגודל טקסט מינימלי של <Num>15</Num>
                    {NB}פיקסלים.
                  </li>
                  <li>כיבוד הגדרת „תנועה מופחתת” של מערכת ההפעלה: אין תנועה מיותרת, והמצב הסופי מוצג מיד.</li>
                  <li>
                    ניגודיות טקסט של <Num>4.5:1</Num> לפחות על כל משטח, ומספרים מבודדים כך שלא יתהפכו בטקסט עברי.
                  </li>
                  <li>
                    {'הודעות מוקראות בקורא המסך, ופעולות בהודעות אינן נעלמות לפני שאפשר להגיע אליהן: '}
                    <kbd className="num" dir="ltr">
                      Alt+T
                    </kbd>
                    {' מעביר אליהן את הפוקוס, ו־'}
                    <kbd className="num" dir="ltr">
                      Esc
                    </kbd>
                    {' סוגר אותן.'}
                  </li>
                </ul>
              </section>

              <section aria-labelledby="a11y-known" className="grid gap-3">
                <h2 id="a11y-known" className="text-h3">
                  מגבלות ידועות
                </h2>
                <p>
                  זהו קונספט בשלבי פיתוח. רגע התלת־ממד במסך הפתיחה יקבל חלופה טקסטואלית, וידאו לנייד ותמונה סטטית; תוכן
                  חדש ייבדק בקורא מסך לפני כל מסירה.
                </p>
              </section>

              <section aria-labelledby="a11y-contact" className="grid gap-3">
                <h2 id="a11y-contact" className="text-h3">
                  פנייה בנושא נגישות
                </h2>
                <p>נתקלתם בקושי? נשמח לשמוע ולתקן. פרטי רכז הנגישות יפורסמו כאן עם עליית השירות.</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-caption">
                  <dt className="font-bold">רכז/ת נגישות</dt>
                  <dd className="text-ink-2">ימולא בהמשך</dd>
                  <dt className="font-bold">טלפון</dt>
                  <dd className="text-ink-2">ימולא בהמשך</dd>
                  <dt className="font-bold">דוא״ל</dt>
                  <dd className="text-ink-2">ימולא בהמשך</dd>
                </dl>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
