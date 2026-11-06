import { SeasonParcels } from '@/components/illustrations/SeasonParcels';
import { Num } from '@/components/ui/Num';

export const concept = [
  {
    num: '01',
    line: 'חקלאים לא קונים מוצרים. הם מנהלים עונות.',
    sub: 'הפורטל מתחיל מהגידול, מהדונמים ומתאריך השתילה – לא מהקטלוג.',
  },
  {
    num: '02',
    line: 'כל שלב בעונה הוא סל אחד.',
    sub: 'זריעה, השקיה, הגנה, קטיף ואריזה – עם כמויות, מחיר ומלאי אמיתי בסניף הקרוב.',
  },
  {
    num: '03',
    line: '21 נקודות מהגולן ועד הערבה הן היתרון.',
    sub: 'הרשת הפיזית הופכת ליתרון דיגיטלי: איסוף היום, 3 ק״מ ממך.',
  },
] as const;

/** Style-tile hero: the concept in three lines over the season seen from above. */
export function Hero() {
  return (
    <section
      id="hero"
      data-surface="soil"
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40"
    >
      <div className="wrap">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
          <p className="eyebrow">שלב 0 · כיוון אמנותי · Style Tile</p>
          <p className="text-micro text-ink-2">
            <Num>06.11.2026</Num> · גרסה <Num>0.1</Num>
          </p>
        </div>

        <div className="mt-10 grid gap-x-(--gutter) gap-y-8 lg:mt-14 lg:grid-cols-12">
          <h1 id="hero-title" className="text-display lg:col-span-8">
            העונה <span className="text-sprout-ink">שלך</span>
          </h1>
          <p className="max-w-[34ch] text-lead text-ink-2 lg:col-span-4 lg:self-end">
            מערכת העיצוב של פורטל החקלאי: צבע, טיפוגרפיה, מרווח, צורה, תנועה ורכיבים – לפני שורת קוד אחת של
            האפליקציה.
          </p>
        </div>
      </div>

      <div className="wrap mt-12 lg:mt-16">
        <SeasonParcels animate showLabels className="w-full" />
      </div>

      <div className="wrap mt-12 lg:mt-16">
        <h2 className="sr-only">הקונספט בשלוש שורות</h2>
        <ol className="grid gap-x-(--gutter) gap-y-10 md:grid-cols-3">
          {concept.map((c) => (
            <li key={c.num} className="grid content-start gap-3 border-t border-line pt-5">
              <Num className="text-caption text-sprout-ink">{c.num}</Num>
              <p className="font-display text-title leading-[1.15]">{c.line}</p>
              <p className="text-body text-ink-2">{c.sub}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
