import { SeasonParcels } from '@/components/illustrations/SeasonParcels';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { formatDate } from '@/lib/format';

const NB = ' ';

/** The concept in three lines (Stage-0 deliverable 1). */
export const concept = [
  {
    num: '01',
    line: ['חקלאים לא קונים מוצרים.', 'הם מנהלים עונות.'],
    sub: `הפורטל מתחיל מהגידול, מהדונמים ומתאריך השתילה${NB}– לא מהקטלוג.`,
  },
  {
    num: '02',
    line: ['כל שלב בעונה', 'הוא סל אחד.'],
    sub: `זריעה, השקיה, הגנה, קטיף ואריזה${NB}– כל שלב עם המוצרים, הכמויות והמלאי בסניף הקרוב.`,
  },
  {
    num: '03',
    line: ['הסניף הקרוב', 'הוא היתרון.'],
    sub: `21 נקודות מהגולן ועד הערבה, והמלאי שלהן בכל מסך: הזמנה בבוקר, איסוף היום, 3 ק״מ ממך.`,
  },
] as const;

/** Style-tile opening: the poster headline over the season seen from above. */
export function Hero() {
  return (
    <section
      id="hero"
      data-surface="soil"
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-20 pt-28 lg:pb-28 lg:pt-32"
    >
      <div className="wrap">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
          <p className="eyebrow">שלב 0 · כיוון אמנותי · לוח סגנון</p>
          <p className="text-micro text-ink-2">
            <Num>{formatDate(new Date(2026, 10, 6))}</Num> · גרסה <Num>0.2</Num>
          </p>
        </div>

        <h1 id="hero-title" className="mt-8 text-poster lg:mt-10">
          העונה <span className="text-sprout-ink">שלך</span>
        </h1>

        <div className="mt-6 grid gap-x-(--gutter) lg:mt-8 lg:grid-cols-12">
          <p className="max-w-[40ch] text-lead text-ink-2 lg:col-span-5 lg:col-start-8">
            מערכת העיצוב של פורטל החקלאי: צבע, תמונה, טיפוגרפיה, מרווח, צורה, תנועה ורכיבים{NB}– לפני שורת קוד
            אחת של האפליקציה.
          </p>
        </div>
      </div>

      <div className="wrap mt-12 lg:mt-16">
        <SeasonParcels animate showLabels className="w-full" />
      </div>

      <div className="wrap mt-16 lg:mt-20">
        <h2 className="eyebrow text-sprout-ink">הקונספט בשלוש שורות</h2>
        <ol className="mt-6 grid gap-x-(--gutter) gap-y-10 md:grid-cols-3">
          {concept.map((c) => (
            <li key={c.num} className="grid content-start gap-3 border-t border-line pt-5">
              <Num className="text-caption text-sprout-ink" aria-hidden="true">
                {c.num}
              </Num>
              <p className="font-display text-title leading-[1.12]">
                {c.line[0]}
                <br />
                {c.line[1]}
              </p>
              <p className="text-body text-ink-2">
                <NumText>{c.sub}</NumText>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
