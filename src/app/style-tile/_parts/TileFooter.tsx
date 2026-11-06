import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { NB } from '@/lib/typography';

export function TileFooter() {
  return (
    <footer data-surface="soil" className="pb-28 pt-16 lg:pb-24 lg:pt-20">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-4">
          <Wordmark />
          <p className="text-caption text-ink-2">
            לוח סגנון · שלב&nbsp;<Num>0</Num> · קונספט ועיצוב: <span lang="en">Kikkey</span>
          </p>
          <p className="max-w-[36ch] text-micro text-ink-2">
            הסמל והלוגוטייפ שלמעלה הם הצעת קונספט למצגת{NB}– לא הלוגו הרשום של המשביר לחקלאי.
          </p>
        </div>
        <dl className="grid gap-6 text-caption sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          <div className="grid gap-1">
            <dt className="font-bold text-ink">נתונים</dt>
            <dd className="flex flex-wrap items-center gap-2 text-ink-2">
              <span>
                כל נתוני המשק והמוצרים{NB}– כמויות, מחירים, מלאי, יבול ו־NDVI{NB}– הם להמחשה בלבד
              </span>
              <DemoTag /> <DemoTag>מחירי דמו</DemoTag>
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">גופנים</dt>
            <dd className="text-ink-2">
              {/* one isolate per name, so the list keeps its RTL order */}
              <bdi lang="en">Suez One</bdi> · <bdi lang="en">Assistant</bdi> · <bdi lang="en">IBM Plex Mono</bdi>
              {NB}– רישיון <bdi lang="en">SIL Open Font</bdi>
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">הבהרה</dt>
            <dd className="text-ink-2">
              קונספט של <span lang="en">Kikkey</span>. אינו האתר הרשמי של המשביר לחקלאי ואינו מציג מחירים, מלאי או
              המלצות אמיתיים.
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">ניווט</dt>
            <dd className="flex flex-wrap gap-x-6">
              <a href="#hero" className="inline-flex min-h-(--target) items-center">
                חזרה לראש העמוד
              </a>
              <Link href="/accessibility" className="inline-flex min-h-(--target) items-center">
                הצהרת נגישות
              </Link>
            </dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}
