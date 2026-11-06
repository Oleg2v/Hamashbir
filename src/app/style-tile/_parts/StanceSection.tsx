import { Num } from '@/components/ui/Num';
import { Section } from './Section';

export const boldDecisions = [
  {
    title: 'הגלילה היא העונה',
    body: 'מטפור אחד מקצה לקצה: השדה בגיבור עובר עונה שלמה בגלילה – אדמה חשופה, טפטוף, נביטה, חופה, NDVI, פרי, ארגזים – ואותו עמוד שדרה של חמישה שלבים מארגן את המתכנן, הקטלוג והניווט. אין מגה־תפריט של מחלקות.',
  },
  {
    title: 'שלט מורשת מול מכשיר מדידה',
    body: 'Suez One ב־144 פיקסלים מול IBM Plex Mono לכל כמות. המספרים הם הגיבורים – 40 דונם, 50,000 מ׳ – והם צומחים כמו יבול, לא קופצים כמו מונה.',
  },
  {
    title: 'NDVI היא שפת הנתונים',
    body: 'רמפה אחת, מאדמה חשופה לחופה מלאה, לכל נתון במוצר: כיסוי מלאי, התקדמות תוכנית, תחזית ביקוש, וסריקת הגיבור. המותג הוא הנתונים.',
  },
  {
    title: 'מצב שמש, לא מצב לילה',
    body: 'ערכת שטח כתכונת דגל: נגיעה אחת, ניגודיות מרבית, מטרות של 56 פיקסלים, בלי צללים – והיא זורחת מהכפתור. נגישות כרגע שיווקי.',
  },
  {
    title: 'אור הוא מידע',
    body: 'קנבס אדמה מט שבו רק שני דברים זוהרים: מים (קווי הטפטוף) ופעולה (נבט). כל השאר חומר – אדמה, נייר, קרטון. אם משהו מאיר, יש לו סיבה.',
  },
] as const;

export const cliches = [
  {
    title: 'טרקטורים, שיבולים וחקלאים מחייכים',
    body: 'קליפ־ארט, אייקוני חיטה, שמש מצוירת וצילומי סטוק. במקומם: צילומי אוויר ולוויין, ושרטוט טכני נקי של מוצרים אמיתיים.',
  },
  {
    title: 'אגרו־טק ירוק־טורקיז עם משושים',
    body: 'גרדיאנט „אקולוגי”, עלה בלוגו, לוחות מחוונים מזויפים ו־HUD משושה. אצלנו ירוק מופיע רק כשהוא אומר משהו.',
  },
  {
    title: 'חטיפת גלילה ופתיח שאי אפשר לדלג עליו',
    body: 'פרילואדר מתחת ל־1.2 שניות, גלילה טבעית (מוחלקת, לא נחטפת), ותוכן שנקרא גם בלי התלת־ממד – עם וידאו בנייד ותמונה סטטית בתנועה מופחתת.',
  },
  {
    title: 'זכוכית, כתמי גרדיאנט ונצנוצי AI',
    body: 'בלי גלאסמורפיזם, בלי בועות צבע ובלי „חכם” על כל כפתור. חומרים מטים, נתונים אמיתיים, ותווית דמו כנה על כל מספר מומצא.',
  },
  {
    title: 'עברית שהיא מראה של אנגלית',
    body: 'טקסט מיושר לשמאל, כותרות־על לטיניות, מספרים מתהפכים, מרכאות ישרות במקום גרשיים וחיצים הפוכים. RTL כאן הוא המקור, לא השתקפות.',
  },
] as const;

export function StanceSection() {
  return (
    <Section
      id="stance"
      intro={
        <p>
          חמש החלטות שאנחנו מתחייבים אליהן, וחמש קלישאות שלא ניגע בהן. זה הקו שכל מסך בשלבים הבאים נמדד מולו.
        </p>
      }
    >
      <div className="grid gap-x-(--gutter) gap-y-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h3 className="font-sans text-title font-bold">חמש החלטות נועזות</h3>
          <ol className="mt-8 grid gap-10">
            {boldDecisions.map((d, i) => (
              <li key={d.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line pt-6">
                <Num className="text-caption font-medium text-sprout-ink">{String(i + 1).padStart(2, '0')}</Num>
                <div className="grid gap-3">
                  <p className="font-display text-h3">{d.title}</p>
                  <p className="max-w-[56ch] text-body text-ink-2">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h3 className="font-sans text-title font-bold">חמש קלישאות שנמנע מהן</h3>
          <ol className="mt-8 grid gap-10">
            {cliches.map((c, i) => (
              <li key={c.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line pt-6">
                <Num className="text-caption font-medium text-harvest-ink">×{String(i + 1).padStart(2, '0')}</Num>
                <div className="grid gap-3">
                  <p className="font-display text-title text-ink-2 line-through decoration-harvest-ink decoration-2">
                    <span className="sr-only">נמנע: </span>
                    {c.title}
                  </p>
                  <p className="max-w-[56ch] text-body text-ink-2">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
