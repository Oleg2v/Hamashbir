import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { NB } from '@/lib/typography';
import { Section } from './Section';

/** `demo`: the statement prints invented figures, so it carries a demo tag */
export const boldDecisions: ReadonlyArray<{ title: string; body: string; demo?: boolean }> = [
  {
    title: 'הגלילה היא העונה',
    body: `מטפורה אחת מקצה לקצה: השדה במסך הפתיחה עובר עונה שלמה בגלילה${NB}– אדמה חשופה, שתילה, טפטוף, חופה, NDVI, פרי, קרטונים${NB}– ואותו עמוד שדרה של חמישה שלבים מארגן את המתכנן, הקטלוג והניווט. אין תפריט מחלקות ענק.`,
  },
  {
    title: 'שלט מורשת מול מכשיר מדידה',
    body: `Suez One בגודל פוסטר מול IBM Plex Mono לכל כמות. המספרים במרכז${NB}– 40 דונם, 50,000 מ׳${NB}– והם צומחים כמו יבול, לא קופצים כמו מונה.`,
    demo: true,
  },
  {
    title: 'NDVI – שפת הנתונים',
    body: 'רמפה אחת, מאדמה חשופה לחופה מלאה, לכל נתון במוצר: כיסוי מלאי, התקדמות תוכנית, תחזית ביקוש וסריקת מסך הפתיחה. המותג הוא הנתונים.',
  },
  {
    title: 'מצב שמש, לא מצב לילה',
    body: `ערכת שטח כתכונת דגל: נגיעה אחת, ניגודיות מרבית, אזורי מגע של 56 פיקסלים, בלי צללים${NB}– והיא זורחת מהכפתור. נגישות שהיא גם רגע שיווקי.`,
  },
  {
    title: 'אור הוא מידע',
    body: `קנבס אדמה מט שבו רק שני דברים זוהרים: מים (קווי הטפטוף) ופעולה (נבט). כל השאר חומר${NB}– אדמה, נייר, קרטון. אם משהו מאיר, יש לו סיבה.`,
  },
];

export const cliches = [
  {
    title: 'טרקטורים, שיבולים וחקלאים מחייכים',
    body: 'קליפ־ארט, אייקוני חיטה, שמש מצוירת וצילומי סטוק מבוימים. במקומם: צילומי אוויר ולוויין, ושרטוט טכני נקי של מוצרים אמיתיים.',
  },
  {
    title: 'אגרו־טק ירוק־טורקיז עם משושים',
    body: 'גרדיאנט „אקולוגי”, לוחות מחוונים מזויפים ו־HUD משושה. אצלנו ירוק מופיע רק כשהוא אומר משהו.',
  },
  {
    title: 'חטיפת גלילה ופתיח שאי אפשר לדלג עליו',
    body: `פרילואדר מתחת ל־1.2 שניות, גלילה טבעית (מוחלקת, לא נחטפת) ותוכן שנקרא גם בלי התלת־ממד${NB}– עם וידאו בנייד ותמונה סטטית בתנועה מופחתת.`,
  },
  {
    title: 'זכוכית, כתמי גרדיאנט ונצנוצי AI',
    body: 'בלי גלאסמורפיזם, בלי בועות צבע ובלי „חכם” על כל כפתור. חומרים מטים, נתונים אמיתיים ותווית דמו כנה על כל מספר מומצא.',
  },
  {
    title: 'עברית שהיא מראה של אנגלית',
    body: 'טקסט מיושר לשמאל, כותרות־על לטיניות, מספרים מתהפכים, מירכאות ישרות במקום גרשיים וחיצים הפוכים. RTL כאן הוא המקור, לא השתקפות.',
  },
] as const;

/**
 * A row: the number hangs in its own column beside the text. On a phone the
 * column and its gap stop growing with the text (at 320px, 15vw is exactly
 * 3rem and 5vw exactly 1rem), so at 200% text the copy keeps room for its
 * longest word („טרקטורים,”) instead of pushing the page sideways.
 */
const item =
  'grid grid-cols-[min(3rem,15vw)_minmax(0,1fr)] content-start gap-x-[min(1rem,5vw)] border-t border-line pt-6 lg:pb-10';

/**
 * Decisions and clichés face each other row by row: two real lists (one per
 * column) on a shared subgrid, so their hairlines line up across the gutter.
 */
export function StanceSection() {
  return (
    <Section
      id="stance"
      intro={<p>חמש החלטות שאנחנו מתחייבים אליהן, וחמש קלישאות שלא ניגע בהן. זה הקו שכל מסך בשלבים הבאים נמדד מולו.</p>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-(--gutter) gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_repeat(5,auto)] lg:gap-y-0">
        <h3 className="text-h3 lg:col-start-1 lg:row-start-1 lg:pb-8">חמש החלטות נועזות</h3>
        <ol className="grid gap-y-10 lg:col-start-1 lg:row-span-5 lg:row-start-2 lg:grid-rows-subgrid lg:gap-y-0">
          {boldDecisions.map((d, i) => (
            <li key={d.title} className={item}>
              <Num className="text-caption font-medium text-sprout-ink" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </Num>
              <div className="grid gap-3">
                <h4 className="font-display text-title">{d.title}</h4>
                <p className="max-w-[56ch] text-body text-ink-2">
                  <NumText>{d.body}</NumText>
                </p>
                {d.demo ? <DemoTag className="justify-self-start" /> : null}
              </div>
            </li>
          ))}
        </ol>
        <h3 className="text-h3 lg:col-start-2 lg:row-start-1 lg:pb-8">חמש קלישאות שנמנע מהן</h3>
        <ol className="grid gap-y-10 lg:col-start-2 lg:row-span-5 lg:row-start-2 lg:grid-rows-subgrid lg:gap-y-0">
          {cliches.map((c, i) => (
            <li key={c.title} className={item}>
              <Num className="text-caption font-medium text-harvest-ink" aria-hidden="true">
                ×{String(i + 1).padStart(2, '0')}
              </Num>
              <div className="grid gap-3">
                <h4 className="font-display text-title text-ink-2 line-through decoration-harvest-ink decoration-2">
                  <span className="sr-only">נמנע: </span>
                  {c.title}
                </h4>
                <p className="max-w-[56ch] text-body text-ink-2">
                  <NumText>{c.body}</NumText>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
