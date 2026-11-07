import type { CSSProperties } from 'react';
import { Ashushit } from '@/components/illustrations/Ashushit';
import { StageIcon } from '@/components/illustrations/StageIcons';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardMedia } from '@/components/ui/Card';
import { AgroChip, Chip, DemoTag, StockChip, type ChipTone } from '@/components/ui/Chip';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { TextField } from '@/components/ui/Field';
import { FilterChip } from '@/components/ui/FilterChip';
import { CloseIcon, PinIcon, PlusIcon, SearchIcon, StoreIcon, TruckIcon } from '@/components/ui/icons';
import { NumberField } from '@/components/ui/NumberField';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { ToastCard } from '@/components/ui/Toast';
import {
  demoFarm,
  dripAvailability,
  lineTotal,
  nearbyBranches,
  planLines,
  pricedTotal,
  season,
  type PlanLine,
} from '@/data/demo-farm';
import { sampleRamp } from '@/design/color';
import { ndvi, stages, toastLifetime } from '@/design/tokens';
import { formatMoney, formatNumber } from '@/lib/format';
import { NB } from '@/lib/typography';
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
  { key: 'primary', he: 'ראשי', label: 'הזמינו' },
  { key: 'secondary', he: 'משני', label: 'שלחו' },
  { key: 'ghost', he: 'שקט', label: 'ביטול' },
  { key: 'icon', he: 'אייקון', label: '' },
] as const;

/**
 * A row of states: two, three or six to a row (by breakpoint, set as --cols),
 * but never a cell narrower than the widest specimen – the primary pill, about
 * 7.6rem in sun mode. At normal size every breakpoint keeps its count; with
 * 200% text the row reflows to fewer columns instead of letting the pills
 * overlap. (`- 1px` keeps sub-pixel rounding from dropping a column.)
 */
const stateGap = 'calc(var(--spacing) * 6)';
const stateRow: CSSProperties = {
  columnGap: stateGap,
  gridTemplateColumns: `repeat(auto-fill, minmax(max(8rem, (100% - (var(--cols) - 1) * ${stateGap}) / var(--cols) - 1px), 1fr))`,
};

/**
 * Six states per variant. Only the resting sample is a live control; the
 * frozen states are specimens — inert, so keyboard and screen-reader users
 * don't meet 18 buttons that do nothing.
 */
function ButtonMatrix() {
  return (
    <div className="grid gap-10" data-specimen="">
      {variants.map((v) => (
        <div key={v.key} className="grid gap-4">
          <p className="flex flex-wrap items-baseline gap-x-3 text-caption font-bold">
            <span>{v.he}</span>
            <Num className="text-micro font-normal text-ink-3">btn--{v.key}</Num>
          </p>
          <ul className="grid items-start gap-y-5 [--cols:2] sm:[--cols:3] xl:[--cols:6]" style={stateRow}>
            {states.map((s) => (
              <li key={s.key} className="grid justify-items-start gap-2" inert={s.key !== 'rest' || undefined}>
                <Button
                  variant={v.key}
                  force={s.key === 'hover' || s.key === 'focus' || s.key === 'active' ? s.key : undefined}
                  disabled={s.key === 'disabled'}
                  loading={s.key === 'loading'}
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
      <p className="sr-only">המצבים הקפואים (ריחוף, פוקוס, לחיצה, מושבת, בטעינה) מוצגים כדוגמה בלבד.</p>
    </div>
  );
}

function ButtonsOnSoil() {
  return (
    <div
      data-surface="soil"
      className="relative grid gap-8 rounded-xl p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:p-12"
    >
      <div className="grid gap-3 lg:col-span-4">
        <h4 className="font-display text-title">
          על אדמה<span className="hidden sun:inline"> · במצב שמש: רקע לבן</span>
        </h4>
        <p className="max-w-[44ch] text-caption text-ink-2">
          <NumText>
            {`העיגול בקצה הכפתור הוא זרע: בריחוף או בפוקוס הוא נובט וממלא את הכפתור תוך 400ms. החץ פונה שמאלה${NB}– קדימה, בעברית. פעולה ראשית אחת בכל מסך.`}
          </NumText>
        </p>
      </div>
      {/* specimens that do nothing: the group name tells them apart from the live demo buttons */}
      <div
        role="group"
        aria-label="דוגמאות לסוגי כפתור על אדמה"
        className="flex flex-wrap items-center gap-4 lg:col-span-8"
      >
        <Button size="lg">בנו תוכנית עונה</Button>
        <Button variant="secondary" size="lg">
          כמו בעונה שעברה
        </Button>
        <Button variant="secondary">
          {/* one inline run (.btn__label is a flex box: as two items, the „1” broke away from „שלב”) */}
          <span>
            {'הזמינו את '}
            <span className="whitespace-nowrap">
              שלב{NB}
              <Num>1</Num>
            </span>
          </span>
        </Button>
        <Button variant="ghost">לכל הסניפים</Button>
      </div>
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <Button variant="icon" aria-label="סגירה">
          <CloseIcon size={20} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Inputs ───────────────────────── */

/**
 * One, two or three fields to a row (by breakpoint, set as --cols), but never a
 * column narrower than the stepper (its two targets with their margins, the
 * value and the unit: at most 2 × --target + 5rem) unless the whole row is. At
 * normal size every breakpoint keeps its count; with 200% text the row drops to
 * fewer columns instead of pushing the stepper past its column and the page
 * edge. (`- 1px` keeps sub-pixel rounding from dropping a column.)
 */
const fieldRow: CSSProperties = {
  gridTemplateColumns:
    'repeat(auto-fill, minmax(min(100%, max(2 * var(--target) + 5rem, (100% - (var(--cols) - 1) * var(--gutter)) / var(--cols) - 1px)), 1fr))',
};

function Inputs() {
  return (
    <div className="grid items-start gap-x-(--gutter) gap-y-8 [--cols:1] sm:[--cols:2] lg:[--cols:3]" style={fieldRow}>
      <TextField id="st-farm" label="שם המשק" placeholder="לדוגמה: משק השדות" hint="יופיע בחשבוניות ובתעודות המשלוח" />
      {/* a frozen keyboard-focus specimen, not a live field */}
      <div inert>
        <TextField
          id="st-area"
          label="שטח"
          numeric
          readOnly
          defaultValue="40"
          suffix="דונם"
          force="focus"
          hint="מצב פוקוס (דוגמה)"
        />
      </div>
      <TextField
        id="st-area-err"
        label="שטח"
        numeric
        defaultValue="0"
        suffix="דונם"
        error={`הזינו שטח בין 1 ל־5,000${NB}דונם`}
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
        hint="נקבע לפי המיקום שלך · אפשר לשנות בתוכנית"
      />
      <NumberField
        label="שטח לתכנון"
        unit="דונם"
        defaultValue={demoFarm.area}
        min={1}
        max={5000}
        hint="חצים במקלדת או − / +; PageUp קופץ בעשרה"
        rangeMessage={`הזינו שטח בין {min} ל־{max}${NB}דונם`}
      />
    </div>
  );
}

/* ───────────────────────── Cards ───────────────────────── */

function ProductCard() {
  return (
    <Card interactive id="ashushit-card" tabIndex={-1}>
      <CardMedia className="dot-grid">
        <Ashushit variant="assembled" labels={false} />
      </CardMedia>
      <CardBody>
        <div className="flex flex-wrap gap-2">
          <Chip tone="water">{stages[1].dept}</Chip>
          <Chip dot={false}>ייצור המשביר</Chip>
        </div>
        <div className="grid gap-1">
          <h4 className="font-display text-title font-normal">
            <a href="#ashushit-card" className="card__link">
              עשושית
            </a>
          </h4>
          <p className="text-caption text-ink-2">
            עמדת השקיה · ממטיר <Num>AR044</Num> · זקף משושה <Num>3/4״</Num>
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-caption">
          <dt className="text-ink-2">לצינור</dt>
          <dd>
            <NumText>{'PE 50 מ״מ · PVC 50 מ״מ · אלומיניום 2״'}</NumText>
          </dd>
          <dt className="text-ink-2">מק״ט</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <Num>HM-ASH-044</Num> <DemoTag />
          </dd>
        </dl>
        <StockChip status="in" branch={demoFarm.branch.name} km={demoFarm.branch.km} className="justify-self-start" />
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Num className="text-title font-medium">{formatMoney(184)}</Num>
          <span className="text-caption text-ink-2">ליח׳ · מחיר לקוח</span>
          <DemoTag>מחירי דמו</DemoTag>
        </p>
      </CardBody>
      <CardFooter>
        <Button icon={<StoreIcon size={18} strokeWidth={2} />}>איסוף מסניף</Button>
        <Button variant="secondary">
          <TruckIcon size={20} />
          משלוח למשק
        </Button>
      </CardFooter>
    </Card>
  );
}

function StageCard() {
  const coverage = 0.86;
  return (
    <div data-surface="soil" className="card border-line">
      {/* every row wraps: at 200% text nothing is cut by the card's rounded clip */}
      <CardBody className="gap-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-caption font-bold">
            <span className="grid size-10 place-items-center rounded-full bg-water text-soil" aria-hidden="true">
              <StageIcon stage="irrigate" size={22} />
            </span>
            <span>
              שלב&nbsp;<Num>02</Num> · השקיה
              <span className="block text-micro font-semibold text-ink-2">
                שבועות&nbsp;<Num>1–3</Num>
              </span>
            </span>
          </p>
          <DemoTag />
        </div>
        <div className="grid gap-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <Num className="num-tight text-h2 font-medium leading-none">{formatNumber(season.dripMeters)}</Num>
            <span className="text-lead font-bold">מ׳</span>
          </p>
          <h4 className="text-body font-bold">
            <NumText>{`שלוחת טפטוף 16 מ״מ · ${demoFarm.area} דונם ${demoFarm.crop}`}</NumText>
          </h4>
        </div>
        <div className="grid gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-caption">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
              <span>
                במלאי ב־<Num>{dripAvailability.branchesWithStock}</Num>
                {' מתוך '}
                <Num>{dripAvailability.networkPoints}</Num>
                {NB}נקודות
              </span>
            </span>
            <span className="text-ink-2">
              {/* what the bar measures: planned demand covered, not the share of points with stock */}
              כיסוי הביקוש&nbsp;<Num>{Math.round(coverage * 100)}%</Num>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ inlineSize: `${coverage * 100}%`, backgroundColor: sampleRamp(ndvi.stops, coverage) }}
            />
          </div>
          <p className="text-caption text-ink-2">
            הסניף הקרוב: {demoFarm.branch.name} · <Num>{demoFarm.branch.km}</Num>
            {NB}ק״מ ממך
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

function BranchCard() {
  const lat = 30.942;
  const lon = 35.372;
  return (
    <Card>
      <CardBody className="gap-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-10 place-items-center rounded-full bg-tint-hover text-ink" aria-hidden="true">
            <PinIcon size={22} />
          </span>
          <DemoTag />
        </div>
        <div className="grid gap-1">
          <h4 className="text-lead font-extrabold">סניף {demoFarm.branch.name}</h4>
          <p className="text-caption text-ink-2">
            ערבה · <Num>{demoFarm.branch.km}</Num>
            {NB}ק״מ ממך · <Num>{`${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`}</Num>
          </p>
        </div>
        {/* each day/hours pair wraps as a unit: when narrow the hours drop under their day,
            and neither range breaks after its dash */}
        <dl className="grid gap-y-1 text-caption">
          <div className="flex flex-wrap gap-x-4">
            <dt className="min-w-[3em] whitespace-nowrap text-ink-2">א׳–ה׳</dt>
            <dd>
              <Num className="whitespace-nowrap">07:00–16:00</Num>
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-4">
            <dt className="min-w-[3em] whitespace-nowrap text-ink-2">ו׳</dt>
            <dd>
              <Num className="whitespace-nowrap">07:00–12:00</Num>
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Chip tone="in">עשושית · במלאי</Chip>
          <Chip tone="low">קרטון ייצוא · מלאי נמוך</Chip>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button
          href={`https://waze.com/ul?ll=${lat},${lon}&navigate=yes`}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          ניווט ב־Waze
        </Button>
        <Button variant="ghost">שעות ופרטים</Button>
      </CardFooter>
    </Card>
  );
}

/* ───────────────────────── Chips ───────────────────────── */

const departments: Array<{ he: string; tone: ChipTone }> = [
  ...stages.map((s) => ({ he: s.dept, tone: s.color as ChipTone })),
  { he: 'בתי צמיחה', tone: 'neutral' },
];

function Chips() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="flex flex-wrap items-center gap-3 text-caption font-bold">
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>מלאי בסניף · צורה, לא צבע:</span>
            {/* the separator ends its item, so a wrapped item never opens its line with „·” */}
            {(['in', 'low', 'out'] as const).map((l, i, all) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span className="level-dot" data-level={l} aria-hidden="true" />
                {l === 'in' ? 'במלאי' : l === 'low' ? 'נמוך' : 'אזל'}
                {i < all.length - 1 ? <span aria-hidden="true">·</span> : null}
              </span>
            ))}
          </span>
          <DemoTag />
        </p>
        <div className="flex flex-wrap gap-3">
          {nearbyBranches.map((b) => (
            <StockChip key={b.name} status={b.stock} branch={b.name} km={b.km} />
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold">מחלקות · צבע השלב</p>
        <div className="flex flex-wrap gap-3">
          {departments.map((d) => (
            <Chip key={d.he} tone={d.tone}>
              {d.he}
            </Chip>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold">תוויות שקיפות</p>
        <div className="flex flex-wrap items-center gap-3">
          <DemoTag />
          <DemoTag>מחירי דמו</DemoTag>
          <AgroChip />
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-caption font-bold" id="st-filter-label">
          סינון לפי גידול
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

const stockChip: Record<PlanLine['stock'], { tone: ChipTone; he: string }> = {
  in: { tone: 'in', he: 'במלאי' },
  low: { tone: 'low', he: 'מלאי נמוך' },
  out: { tone: 'out', he: 'אזל' },
  gated: { tone: 'neutral', he: 'לפי אישור' },
};

const columns: ReadonlyArray<Column<PlanLine>> = [
  {
    key: 'week',
    header: 'שבוע',
    cell: (r) =>
      r.week != null ? (
        <Num className="cell-num">{r.week}</Num>
      ) : (
        <span className="cell-muted">
          <span aria-hidden="true">–</span>
          <span className="sr-only">לפי האגרונום</span>
        </span>
      ),
  },
  {
    key: 'stage',
    header: 'שלב',
    cell: (r) => (
      <span className="inline-flex items-center gap-2 font-semibold">
        <StageIcon stage={r.stage} size={18} className="text-ink-2" />
        {r.stageLabel}
      </span>
    ),
  },
  {
    key: 'product',
    header: 'מוצר',
    primary: true,
    cell: (r) => (
      <span className="grid gap-1">
        <span>
          <NumText>{r.product}</NumText>
        </span>
        {r.stock === 'gated' ? (
          <span>
            <AgroChip />
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: 'qty',
    header: 'כמות',
    numeric: true,
    cell: (r) =>
      r.qty != null ? (
        <>
          <Num className="cell-num">{formatNumber(r.qty)}</Num>
          {NB}
          <span className="cell-muted">{r.unit}</span>
        </>
      ) : (
        <span className="cell-muted">לפי אגרונום</span>
      ),
  },
  {
    key: 'stock',
    header: `מלאי ב${demoFarm.branch.name}`,
    cell: (r) =>
      r.stock === 'gated' ? (
        <span className="cell-muted">{stockChip.gated.he}</span>
      ) : (
        <Chip tone={stockChip[r.stock].tone}>{stockChip[r.stock].he}</Chip>
      ),
  },
  {
    key: 'price',
    header: 'מחיר יח׳ (₪)',
    numeric: true,
    cell: (r) =>
      r.unitPrice != null ? (
        <Num className="cell-num">{formatNumber(r.unitPrice, 2)}</Num>
      ) : (
        <span className="cell-muted">לפי הצעה</span>
      ),
  },
  {
    key: 'total',
    header: 'סה״כ (₪)',
    numeric: true,
    cell: (r) => {
      const t = lineTotal(r);
      return t != null ? (
        <Num className="cell-num font-semibold">{formatNumber(t, 2)}</Num>
      ) : (
        <span className="cell-muted">
          <span aria-hidden="true">–</span>
          <span className="sr-only">ללא מחיר</span>
        </span>
      );
    },
  },
];

function PlanTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {/* relative: the scroller holds its sr-only cell notes; positioned against <body>
          they sat outside it and widened the page whenever the table scrolled (200% text) */}
      <DataTable
        className="relative"
        caption={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-4 sm:px-5">
            <span>
              <NumText>{`תוכנית עונה · ${demoFarm.crop} · ${demoFarm.area} דונם · ${demoFarm.method} · ${demoFarm.region}`}</NumText>
            </span>
            <DemoTag />
            <DemoTag>מחירי דמו</DemoTag>
          </span>
        }
        columns={columns}
        rows={planLines}
        rowKey={(r) => r.id}
        rowState={(r) => (r.id === 'seedlings' ? { selected: true } : r.id === 'drip' ? { force: 'hover' } : undefined)}
        footer={{
          label: `סה״כ לשלבים מתומחרים${NB}· ללא הגנת הצומח`,
          value: <Num className="cell-num">{formatMoney(pricedTotal)}</Num>,
        }}
      />
    </div>
  );
}

/* ───────────────────────── Toasts ───────────────────────── */

function Toasts() {
  return (
    <div className="grid gap-10">
      {/* the caption heads the list's own column: from lg the column sits at inline-end */}
      <div className="grid w-full max-w-[28rem] gap-3 lg:ms-auto">
        <p className="flex flex-wrap items-center gap-3 text-caption font-bold">
          <span>ארבעת הטונים · דוגמאות סטטיות</span>
          <DemoTag />
        </p>
        {/* a toast-list container: a narrow list (a phone at 200% text) stacks each
            toast's text under its icon and close button instead of widening the page */}
        <ul className="@container/toast-list grid gap-4" inert>
          <li>
            <ToastCard
              isStatic
              tone="success"
              title="שלב 1 הוזמן"
              body={`איסוף מסניף ${demoFarm.branch.name} · יום ג׳, 10:00`}
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
            <ToastCard
              isStatic
              tone="info"
              title="המלאי עודכן"
              body={`שלוחת טפטוף 16 מ״מ במלאי ב־${dripAvailability.branchesWithStock} מתוך ${dripAvailability.networkPoints}${NB}נקודות`}
              progress={0.3}
            />
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
      </div>
      <div className="grid gap-3">
        <p id="toast-demo-title" className="text-caption font-bold">
          נסו בעצמכם – ההודעות האמיתיות של המערכת
        </p>
        <div role="group" aria-labelledby="toast-demo-title">
          <ToastDemo />
        </div>
        <p className="max-w-[62ch] text-caption text-ink-2">
          <NumText>
            {`הודעה פשוטה נעלמת אחרי ${toastLifetime / 1000} שניות, והטיימר שלה נעצר בריחוף או בפוקוס. הודעה עם פעולה, ושגיאה, נשארות עד שסוגרים אותן – אף אחד לא צריך להתחרות בשעון כדי ללחוץ „ביטול”. ההכרזה לקורא המסך יוצאת מאזור חי קבוע, והסגירה מחזירה את הפוקוס למקום שבו הייתם.`}
          </NumText>
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
          {'שישה רכיבים שנושאים את כל האפליקציה. כל אחד נבנה קודם כול למקלדת ולכיוון '}
          <span className="whitespace-nowrap">ימין־לשמאל</span>, עם מצבי ריחוף, פוקוס, לחיצה, השבתה וטעינה{NB}– ועובד על
          נייר, על אדמה ובמצב שמש.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="כפתור" note="ראשי · משני · שקט · אייקון – שישה מצבים">
          <ButtonMatrix />
          <ButtonsOnSoil />
        </Block>

        <Block title="שדה קלט" note="תווית מעל, עזרה ושגיאה מתחת, יחידות בעברית">
          <Inputs />
        </Block>

        <Block title="כרטיס" note="מוצר על נייר · שלב בתוכנית על אדמה · סניף">
          <div className="grid items-start gap-(--gutter) md:grid-cols-[5fr_7fr]">
            <div className="md:row-span-2">
              <ProductCard />
            </div>
            <StageCard />
            <BranchCard />
          </div>
        </Block>

        <Block title="צ׳יפ" note="סטטוס תמיד עם מילים, לא רק צבע">
          <Chips />
        </Block>

        <Block title="שורת טבלה" note="נבחרת · בריחוף · דורשת אגרונום · רגילה – ובמסך צר: כרטיסים">
          <PlanTable />
        </Block>

        <Block title="הודעה" note="הצלחה · אגרונום · מידע · שגיאה">
          <Toasts />
        </Block>
      </div>
    </Section>
  );
}
