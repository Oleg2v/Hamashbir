import { Ashushit } from '@/components/illustrations/Ashushit';
import { StageIcon } from '@/components/illustrations/StageIcons';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardMedia } from '@/components/ui/Card';
import { AgroChip, Chip, DemoTag, StockChip, type ChipTone } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/Field';
import { FilterChip } from '@/components/ui/FilterChip';
import { CloseIcon, PlusIcon, SearchIcon, StoreIcon, TruckIcon } from '@/components/ui/icons';
import { NumberField } from '@/components/ui/NumberField';
import { Num } from '@/components/ui/Num';
import { ToastCard } from '@/components/ui/Toast';
import { sampleRamp } from '@/design/color';
import { ndvi } from '@/design/tokens';
import { formatMoney, formatNumber } from '@/lib/format';
import { ToastDemo } from './components/ToastDemo';
import { Block, Section } from './Section';

/* ───────────────────────── Buttons ───────────────────────── */

const states = [
  { key: 'rest', he: 'רגיל' },
  { key: 'hover', he: 'ריחוף' },
  { key: 'focus', he: 'פוקוס מקלדת' },
  { key: 'active', he: 'לחיצה' },
  { key: 'disabled', he: 'מושבת' },
  { key: 'loading', he: 'בטעינה' },
] as const;

const variants = [
  { key: 'primary', he: 'ראשי', label: 'בנו תוכנית עונה' },
  { key: 'secondary', he: 'משני', label: 'שלחו לאגרונום' },
  { key: 'ghost', he: 'שקט', label: 'ביטול' },
  { key: 'icon', he: 'אייקון', label: '' },
] as const;

function ButtonMatrix() {
  return (
    <div className="grid gap-10">
      {variants.map((v) => (
        <div key={v.key} className="grid gap-4">
          <p className="text-caption font-bold">
            {v.he} <Num className="ms-2 text-micro font-normal text-ink-3">btn--{v.key}</Num>
          </p>
          <ul className="flex flex-wrap items-start gap-x-6 gap-y-5">
            {states.map((s) => (
              <li key={s.key} className="grid justify-items-start gap-2">
                <Button
                  variant={v.key}
                  force={s.key === 'hover' || s.key === 'focus' || s.key === 'active' ? s.key : undefined}
                  disabled={s.key === 'disabled'}
                  loading={s.key === 'loading'}
                  tabIndex={s.key === 'rest' ? undefined : -1}
                  aria-label={v.key === 'icon' ? 'הוספה לתוכנית' : undefined}
                >
                  {v.key === 'icon' ? <PlusIcon size={20} strokeWidth={2} /> : v.label}
                </Button>
                <span className="text-micro text-ink-2">{s.he}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ButtonsOnSoil() {
  return (
    <div data-surface="soil" className="grid gap-6 rounded-xl p-6 sm:p-8">
      <p className="text-caption font-bold">על אדמה · גדלים md / lg</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg">בנו תוכנית עונה</Button>
        <Button>הזמינו את שלב 1</Button>
        <Button variant="secondary" size="lg">
          כמו בעונה שעברה
        </Button>
        <Button variant="ghost">לכל הסניפים</Button>
        <Button variant="icon" aria-label="סגירה">
          <CloseIcon size={20} strokeWidth={2} />
        </Button>
      </div>
      <p className="max-w-[60ch] text-caption text-ink-2">
        הבוטון בקצה הכפתור הוא זרע: בריחוף או בפוקוס הוא נובט וממלא את הכפתור ב־<Num>400ms</Num>. החץ פונה שמאלה —
        קדימה, בעברית.
      </p>
    </div>
  );
}

/* ───────────────────────── Inputs ───────────────────────── */

function Inputs() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      <TextField id="st-farm" label="שם המשק" placeholder="לדוגמה: משק השדות" hint="יופיע בחשבוניות ובתעודות המשלוח" />
      <TextField
        id="st-area"
        label="שטח"
        numeric
        defaultValue="40"
        suffix="דונם"
        force="focus"
        hint={
          <>
            פוקוס מקלדת · <DemoTag />
          </>
        }
      />
      <TextField
        id="st-area-err"
        label="שטח"
        numeric
        defaultValue="0"
        suffix="דונם"
        error="הזינו שטח בין 1 ל־5,000 דונם"
      />
      <TextField
        id="st-search"
        label="חיפוש בקטלוג"
        type="search"
        placeholder="טפטוף, מגופים, קרטונים…"
        prefix={<SearchIcon size={20} />}
      />
      <TextField
        id="st-branch"
        label="סניף איסוף"
        defaultValue="עין תמר"
        disabled
        hint="נקבע לפי המיקום שלך · ניתן לשנות בתוכנית"
      />
      <NumberField label="שטח לתכנון (חי)" unit="דונם" defaultValue={40} min={1} max={5000} hint="חצים במקלדת או − / +" />
    </div>
  );
}

/* ───────────────────────── Cards ───────────────────────── */

function ProductCard() {
  return (
    <Card interactive className="max-w-[26rem]">
      <CardMedia className="dot-grid">
        <Ashushit variant="assembled" labels={false} className="h-[86%] w-auto text-ink" />
      </CardMedia>
      <CardBody>
        <div className="flex flex-wrap gap-2">
          <Chip tone="water">השקייה ותשתיות</Chip>
          <Chip dot={false}>ייצור המשביר</Chip>
        </div>
        <div className="grid gap-1">
          <h4 className="font-display text-title font-normal">
            <a href="#components" className="card__link">
              עשושית
            </a>
          </h4>
          <p className="text-caption text-ink-2">
            תחנת השקיה ניידת · ממטיר <Num>AR044</Num> · מגבה משושה <Num>3/4״</Num>
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-caption">
          <dt className="text-ink-2">לצינור</dt>
          <dd>
            PE <Num>50</Num> מ״מ · PVC <Num>50</Num> מ״מ · אלומיניום <Num>2״</Num>
          </dd>
          <dt className="text-ink-2">מק״ט</dt>
          <dd>
            <Num>HM-ASH-044</Num> <DemoTag className="ms-1" />
          </dd>
        </dl>
        <StockChip status="in" branch="עין תמר" km={3} className="justify-self-start" />
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Num className="text-title font-medium">{formatMoney(184)}</Num>
          <span className="text-caption text-ink-2">ליח׳ · מחיר חשבון</span>
          <DemoTag>מחירי דמו</DemoTag>
        </p>
      </CardBody>
      <CardFooter>
        <Button icon={<StoreIcon size={18} strokeWidth={2} />}>איסוף מסניף</Button>
        <Button variant="secondary">
          <TruckIcon size={20} />
          משלוח לחווה
        </Button>
      </CardFooter>
    </Card>
  );
}

function StageCard() {
  const coverage = 0.86;
  return (
    <div data-surface="soil" className="card max-w-[26rem] border-line">
      <CardBody className="gap-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-caption font-bold">
            <span className="grid size-10 place-items-center rounded-full bg-water text-soil" aria-hidden="true">
              <StageIcon stage="irrigate" size={22} />
            </span>
            <span>
              שלב <Num>02</Num> · השקיה
              <span className="block text-micro font-semibold text-ink-2">
                שבועות <Num>1–3</Num>
              </span>
            </span>
          </p>
          <DemoTag />
        </div>
        <div className="grid gap-1">
          <p className="flex items-baseline gap-2">
            <Num className="text-h2 font-medium leading-none">{formatNumber(50000)}</Num>
            <span className="text-lead font-bold">מ׳</span>
          </p>
          <h4 className="text-body font-bold">טפטוף 16 מ״מ · 40 דונם פלפל</h4>
        </div>
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between text-caption">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span className="size-2 rounded-full bg-sprout" aria-hidden="true" />
              במלאי ב־<Num>14</Num> סניפים
            </span>
            <span className="text-ink-2">
              כיסוי <Num>{Math.round(coverage * 100)}%</Num>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ inlineSize: `${coverage * 100}%`, backgroundColor: sampleRamp(ndvi.stops, coverage) }}
            />
          </div>
          <p className="text-caption text-ink-2">
            הסניף הקרוב: עין תמר · <Num>3</Num> ק״מ ממך
          </p>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button>הוסיפו לתוכנית</Button>
        <Button variant="ghost">פירוט</Button>
      </CardFooter>
    </div>
  );
}

/* ───────────────────────── Chips ───────────────────────── */

const departments: Array<{ he: string; tone: ChipTone }> = [
  { he: 'זרעים ושתילים', tone: 'sprout' },
  { he: 'השקייה ותשתיות', tone: 'water' },
  { he: 'הדברה ודשנים', tone: 'field' },
  { he: 'ציוד טכני', tone: 'harvest' },
  { he: 'אריזה וקרטונים', tone: 'wheat' },
  { he: 'חממות', tone: 'neutral' },
];

function Chips() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-caption font-bold">מלאי בסניף</p>
        <div className="flex flex-wrap gap-3">
          <StockChip status="in" branch="עין תמר" km={3} />
          <StockChip status="low" branch="תומר" km={41} />
          <StockChip status="out" branch="צופר" km={18} />
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold">מחלקות</p>
        <div className="flex flex-wrap gap-3">
          {departments.map((d) => (
            <Chip key={d.he} tone={d.tone}>
              {d.he}
            </Chip>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold">סימון אמת</p>
        <div className="flex flex-wrap items-center gap-3">
          <DemoTag />
          <DemoTag>מחירי דמו</DemoTag>
          <AgroChip />
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold" id="st-filter-label">
          סינון לפי גידול (חי)
        </p>
        <div className="flex flex-wrap gap-3" role="group" aria-labelledby="st-filter-label">
          {['פלפל', 'עגבנייה', 'תפוח אדמה', 'אבוקדו', 'הדרים', 'פרחי קטיף'].map((c, i) => (
            <FilterChip key={c} defaultPressed={i === 0}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Table ───────────────────────── */

type Row = {
  week: string;
  stage: string;
  stageId: 'sow' | 'irrigate' | 'protect' | 'pack';
  product: string;
  qty?: number;
  unit: string;
  stock: { tone: ChipTone; he: string };
  price?: number;
  state?: 'selected' | 'hover';
  agro?: boolean;
};

const rows: Row[] = [
  {
    week: '1',
    stage: 'זריעה',
    stageId: 'sow',
    product: 'שתילי פלפל, מגש 128',
    qty: 96000,
    unit: 'שתילים',
    stock: { tone: 'in', he: 'במלאי' },
    price: 0.42,
    state: 'selected',
  },
  {
    week: '1',
    stage: 'השקיה',
    stageId: 'irrigate',
    product: 'טפטוף 16 מ״מ',
    qty: 50000,
    unit: 'מ׳',
    stock: { tone: 'in', he: 'במלאי' },
    price: 0.36,
    state: 'hover',
  },
  {
    week: '2',
    stage: 'הגנה',
    stageId: 'protect',
    product: 'קוטל פטריות – לפי המלצת אגרונום',
    unit: '',
    stock: { tone: 'neutral', he: 'אחרי אישור' },
    agro: true,
  },
  {
    week: '14',
    stage: 'אריזה',
    stageId: 'pack',
    product: 'קרטון פלפל 10 ק״ג',
    qty: 32000,
    unit: 'יח׳',
    stock: { tone: 'low', he: 'מלאי נמוך' },
    price: 2.05,
  },
];

function PlanTable() {
  const total = rows.reduce((sum, r) => sum + (r.qty && r.price ? r.qty * r.price : 0), 0);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="table table--stack" role="table">
        <caption className="px-4 pt-4 sm:px-5">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>תוכנית עונה · פלפל · <Num>40</Num> דונם · בית רשת · ערבה</span>
            <DemoTag />
            <DemoTag>מחירי דמו</DemoTag>
          </span>
        </caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">שבוע</th>
            <th scope="col" role="columnheader">שלב</th>
            <th scope="col" role="columnheader">מוצר</th>
            <th scope="col" role="columnheader">כמות</th>
            <th scope="col" role="columnheader">עין תמר</th>
            <th scope="col" role="columnheader">מחיר יח׳ (₪)</th>
            <th scope="col" role="columnheader">סה״כ (₪)</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((r) => (
            <tr
              role="row"
              key={r.product}
              data-selected={r.state === 'selected' ? '' : undefined} data-force={r.state === 'hover' ? 'hover' : undefined}>
              <td role="cell" data-label="שבוע" className="cell-num">
                <Num>{r.week}</Num>
              </td>
              <td role="cell" data-label="שלב">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <StageIcon stage={r.stageId} size={18} className="text-ink-2" />
                  {r.stage}
                </span>
              </td>
              <td role="cell" data-label="מוצר" data-primary="" className="cell-strong">
                <span className="grid gap-1">
                  <span>
                    {r.product}
                    {r.state === 'selected' ? <span className="sr-only"> (נבחר)</span> : null}
                  </span>
                  {r.agro ? (
                    <span>
                      <AgroChip />
                    </span>
                  ) : null}
                </span>
              </td>
              <td role="cell" data-label="כמות">
                {r.qty ? (
                  <>
                    <Num className="cell-num">{formatNumber(r.qty)}</Num> <span className="cell-muted">{r.unit}</span>
                  </>
                ) : (
                  <span className="cell-muted">לפי אגרונום</span>
                )}
              </td>
              <td role="cell" data-label="מלאי בעין תמר">
                <Chip tone={r.stock.tone}>{r.stock.he}</Chip>
              </td>
              <td role="cell" data-label="מחיר יח׳ (₪)">
                {r.price ? <Num className="cell-num">{formatNumber(r.price, 2)}</Num> : <span className="cell-muted">לפי הצעה</span>}
              </td>
              <td role="cell" data-label="סה״כ (₪)">
                {r.qty && r.price ? (
                  <Num className="cell-num font-semibold">{formatNumber(r.qty * r.price, 2)}</Num>
                ) : (
                  <span className="cell-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot role="rowgroup">
          <tr role="row">
            <td role="cell" colSpan={6} className="cell-strong" data-label="">
              סה״כ לשלבים מתומחרים
            </td>
            <td role="cell" className="cell-strong" data-label="סה״כ (₪)">
              <Num className="cell-num">{formatNumber(total, 2)}</Num>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ───────────────────────── Toasts ───────────────────────── */

function Toasts() {
  return (
    <div className="grid gap-8">
      <ul className="grid gap-4 lg:grid-cols-2" aria-label="דוגמאות סטטיות של הודעות">
        <li>
          <ToastCard
            isStatic
            tone="success"
            title="שלב 1 הוזמן"
            body="איסוף מסניף עין תמר · יום ג׳, 10:00"
            action={{ label: 'ביטול ההזמנה' }}
            progress={0.62}
          />
        </li>
        <li>
          <ToastCard
            isStatic
            tone="agro"
            title="מוצרי הגנת הצומח דורשים אישור אגרונום לפני הזמנה"
            action={{ label: 'שלחו לאגרונום לאישור' }}
          />
        </li>
        <li>
          <ToastCard isStatic tone="info" title="המלאי עודכן" body="טפטוף 16 מ״מ זמין ב־14 סניפים" progress={0.3} />
        </li>
        <li>
          <ToastCard
            isStatic
            tone="error"
            title="לא הצלחנו לשלוח את ההזמנה"
            body="אין חיבור לרשת. התוכנית שמורה במכשיר."
            action={{ label: 'נסו שוב' }}
          />
        </li>
      </ul>
      <div className="grid gap-3">
        <p className="text-caption font-bold">נסו בעצמכם — ההודעות האמיתיות של המערכת</p>
        <ToastDemo />
        <p className="max-w-[62ch] text-caption text-ink-2">
          הודעות הצלחה נעלמות אחרי <Num>6</Num> שניות ועוצרות בריחוף או בפוקוס; שגיאות נשארות עד שסוגרים. ההכרזה לקורא
          המסך יוצאת מאזור חי קבוע, לא מהאלמנט שנוסף.
        </p>
      </div>
    </div>
  );
}

export function ComponentsSection() {
  return (
    <Section
      id="components"
      intro={
        <p>
          שישה רכיבים שנושאים את כל האפליקציה. כל אחד נבנה מקלדת־תחילה ו־RTL־תחילה, עם מצבי ריחוף, פוקוס, לחיצה,
          השבתה וטעינה — ועובד על נייר, על אדמה ובמצב שמש.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="כפתור" note="ראשי · משני · שקט · אייקון — שישה מצבים">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ButtonMatrix />
            </div>
            <div className="lg:col-span-5">
              <ButtonsOnSoil />
            </div>
          </div>
        </Block>

        <Block title="שדה קלט" note="תווית מעל, עזרה ושגיאה מתחת, יחידות בעברית">
          <Inputs />
        </Block>

        <Block title="כרטיס" note="מוצר על נייר · שלב בתוכנית על אדמה">
          <div className="flex flex-wrap items-start gap-(--gutter)">
            <ProductCard />
            <StageCard />
          </div>
        </Block>

        <Block title="צ׳יפ" note="סטטוס תמיד עם מילים, לא רק צבע">
          <Chips />
        </Block>

        <Block title="שורת טבלה" note="נבחרת · בריחוף · דורשת אגרונום · רגילה — ובנייד: כרטיסים">
          <PlanTable />
        </Block>

        <Block title="הודעה (טוסט)" note="הצלחה · אגרונום · מידע · שגיאה">
          <Toasts />
        </Block>
      </div>
    </Section>
  );
}
