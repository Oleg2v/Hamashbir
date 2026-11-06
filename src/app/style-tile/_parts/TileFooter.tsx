import { Wordmark } from '@/components/brand/Wordmark';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';

export function TileFooter() {
  return (
    <footer data-surface="soil" className="pb-28 pt-16 lg:pb-24 lg:pt-20">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-4">
          <Wordmark />
          <p className="text-caption text-ink-2">
            סטייל טייל · שלב <Num>0</Num> · קונספט ועיצוב: Kikkey
          </p>
        </div>
        <dl className="grid gap-6 text-caption sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          <div className="grid gap-1">
            <dt className="font-bold text-ink">נתונים</dt>
            <dd className="flex flex-wrap items-center gap-2 text-ink-2">
              כל המספרים בעמוד הם להמחשה בלבד <DemoTag /> <DemoTag>מחירי דמו</DemoTag>
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">גופנים</dt>
            <dd className="text-ink-2">Suez One · Assistant · IBM Plex Mono – רישיון SIL Open Font</dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">הבהרה</dt>
            <dd className="text-ink-2">
              קונספט של Kikkey. אינו האתר הרשמי של המשביר לחקלאי ואינו מציג מחירים, מלאי או המלצות אמיתיים.
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-ink">ניווט</dt>
            <dd>
              <a href="#hero">חזרה לראש העמוד</a>
            </dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}
