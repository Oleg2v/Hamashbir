import { Verdict } from '@/components/ui/Verdict';

/**
 * Choosing a photo. The don'ts are described in words – the tile never
 * shows a cliché photo to make the point.
 */
const choose = [
  { head: 'מבט אנכי', body: 'מלמעלה, כמו מפה: בלי אופק ובלי שמיים.' },
  { head: 'אור יום טבעי', body: 'צללים קצרים וצבע אמיתי של אדמה וצמחייה, בלי HDR.' },
  { head: 'גימור מט', body: 'ניגודיות מתונה ורוויה טבעית, כדי שהנבט בממשק יישאר הצבע החזק במסך.' },
  { head: 'שדות אמיתיים', body: 'שורות, תלמים, יריעות וקווי השקיה כמו שהם: הדפוס מספר את הסיפור.' },
] as const;

const avoid = [
  { head: 'סטוק רווי', body: 'ירוק זרחני, שמיים כחולים מדי ושדה שנראה כמו טפט.' },
  { head: 'חקלאים מצטלמים', body: 'חיוך למצלמה וידיים שמחזיקות עגבנייה. החקלאי הוא המשתמש, לא הדוגמן.' },
  { head: 'טרקטור במרכז הפריים', body: 'המכונה בתור נושא הצילום, במקום השדה שהיא עובדת בו.' },
  { head: 'קלישאת שקיעה', body: 'שמיים כתומים וצלליות: יפה, ולא רואים בה כלום.' },
  {
    head: 'ממשק עתידני מזויף',
    body: 'רשתות זוהרות ומספרים מומצאים על הצילום. כל קו על תמונה הוא מדידה אמיתית או דמו מסומן.',
  },
] as const;

function List({
  ok,
  items,
  label,
}: {
  ok: boolean;
  items: ReadonlyArray<{ head: string; body: string }>;
  label: string;
}) {
  return (
    <ul className="grid content-start" aria-label={label}>
      {items.map((it) => (
        <li
          key={it.head}
          className="grid gap-x-4 gap-y-2 border-t-(length:--bw) border-line py-4 sm:grid-cols-[6rem_1fr] sm:items-baseline"
        >
          <Verdict ok={ok} />
          <p className="text-body">
            <span className="font-bold">{it.head}. </span>
            <span className="text-ink-2">{it.body}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function DoDont() {
  return (
    <div className="grid gap-6">
      <div className="grid max-w-[62ch] gap-2">
        <h4 className="text-lead font-extrabold">בחירת צילום</h4>
        <p className="text-body text-ink-2">מה מצלמים, ומה משאירים בספריית הסטוק.</p>
      </div>
      <div className="grid gap-x-(--gutter) gap-y-8 lg:grid-cols-2">
        <List ok items={choose} label="לבחור" />
        <List ok={false} items={avoid} label="להימנע" />
      </div>
    </div>
  );
}
