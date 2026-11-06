import { Num } from '@/components/ui/Num';
import { elevations, radii } from '@/design/tokens';
import { Block, Section } from './Section';

/* Static class maps – Tailwind only sees complete class names in source. */
const radiusClass: Record<keyof typeof radii, string> = {
  none: 'rounded-none',
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const shadowClass: Record<(typeof elevations)[number]['name'], string> = {
  raised: 'bg-surface shadow-raised',
  float: 'bg-surface shadow-float',
  overlay: 'bg-surface shadow-overlay',
  inset: 'bg-sunken shadow-inset',
};

function Radii() {
  return (
    <ul className="grid grid-cols-2 gap-x-(--gutter) gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
      {(Object.keys(radii) as Array<keyof typeof radii>).map((k) => (
        <li key={k} className="grid gap-3">
          <span
            className={`block aspect-square w-full max-w-28 border border-line-strong bg-surface shadow-raised ${radiusClass[k]}`}
            aria-hidden="true"
          />
          <span className="grid gap-0.5 text-caption">
            <Num className="font-medium">rounded-{k}</Num>
            <span className="text-ink-2">
              {k === 'full' ? 'מלא' : <Num>{radii[k].px}px</Num>} · {radii[k].use}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ElevationRow() {
  return (
    <ul className="grid grid-cols-2 gap-(--gutter) lg:grid-cols-4">
      {elevations.map((e) => (
        <li
          key={e.name}
          className={`grid min-h-36 content-between rounded-lg p-5 ${shadowClass[e.name]}`}
        >
          <Num className="text-caption font-medium">shadow-{e.name}</Num>
          <span className="grid gap-0.5 text-caption">
            <span className="font-bold">{e.he}</span>
            <span className="text-ink-2">{e.use}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Glows() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-8 sm:grid-cols-2">
      <figure className="grid gap-4">
        <div className="grid min-h-36 place-items-center rounded-lg bg-surface">
          <span className="inline-flex min-h-(--target) items-center rounded-full bg-sprout px-6 font-bold text-soil shadow-glow-sprout">
            בנו תוכנית עונה
          </span>
        </div>
        <figcaption className="text-caption">
          <Num className="font-medium">shadow-glow-sprout</Num>
          <span className="block text-ink-2">פעולה אחת בכל מסך זוהרת – ורק היא</span>
        </figcaption>
      </figure>
      <figure className="grid gap-4">
        <div className="grid min-h-36 place-items-center overflow-hidden rounded-lg bg-surface px-6">
          <svg viewBox="0 0 320 40" className="w-full max-w-80" aria-hidden="true" focusable="false">
            <path
              d="M4 26 C 70 6, 130 34, 190 18 S 290 10, 316 22"
              fill="none"
              stroke="var(--color-water)"
              strokeOpacity="0.28"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M4 26 C 70 6, 130 34, 190 18 S 290 10, 316 22"
              fill="none"
              stroke="var(--color-water)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {[40, 100, 160, 220, 280].map((x) => (
              <circle key={x} cx={x} cy={x === 160 ? 22 : x < 160 ? 20 : 16} r="3" fill="var(--color-paper)" />
            ))}
          </svg>
        </div>
        <figcaption className="text-caption">
          <Num className="font-medium">shadow-glow-water</Num>
          <span className="block text-ink-2">מים הם אור: קווי טפטוף זוהרים, השאר מט</span>
        </figcaption>
      </figure>
    </div>
  );
}

function Lines() {
  return (
    <ul className="grid gap-x-(--gutter) gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      <li className="grid gap-3">
        <span className="block h-12 border-b border-line" aria-hidden="true" />
        <span className="text-caption">
          <Num className="font-medium">border-line</Num>
          <span className="block text-ink-2">קו שיער · 12% דיו · מחיצות</span>
        </span>
      </li>
      <li className="grid gap-3">
        <span className="block h-12 border-b border-line-strong" aria-hidden="true" />
        <span className="text-caption">
          <Num className="font-medium">border-line-strong</Num>
          <span className="block text-ink-2">גבול שדה · ≥ 3:1 מול הרקע</span>
        </span>
      </li>
      <li className="grid gap-3">
        <span className="flex h-12 items-end" aria-hidden="true">
          <span className="btn btn--secondary" data-force="focus">
            <span className="btn__label">פוקוס</span>
          </span>
        </span>
        <span className="text-caption">
          <Num className="font-medium">--focus</Num>
          <span className="block text-ink-2">טבעת 3 פיקסלים · 4 במצב שמש</span>
        </span>
      </li>
      <li className="grid gap-3">
        <span className="block h-12 border-b-2 border-black" aria-hidden="true" />
        <span className="text-caption">
          <Num className="font-medium">sun · 2px</Num>
          <span className="block text-ink-2">במצב שמש אין צללים – רק קווים</span>
        </span>
      </li>
    </ul>
  );
}

export function ShapeSection() {
  return (
    <Section
      id="shape"
      intro={
        <p>
          רך לשדה, חד לנתונים: כפתורים וצ׳יפים מעוגלים לגמרי, כרטיסים <Num>20</Num>, שדות <Num>12</Num>, שורות טבלה
          ישרות. עומק בא מחומר – צללים חמים בגוון אדמה, לא אפור – ובמצב שמש הוא מתחלף בקו.
        </p>
      }
    >
      <div className="grid gap-20 lg:gap-28">
        <Block title="רדיוסים" note="7 ערכים · כולם כפולות של 4">
          <Radii />
        </Block>
        <Block title="עומק על נייר" note="צל חם, בגוון אדמה">
          <ElevationRow />
        </Block>
        <div data-surface="soil" className="-mx-(--page-margin) rounded-none px-(--page-margin) py-12 sm:mx-0 sm:rounded-xl sm:px-8 lg:px-12">
          <Block title="עומק ואור על אדמה" note="הדגשה עליונה + צל עמוק; זוהר רק למים ולפעולה">
            <div className="grid gap-12">
              <ElevationRow />
              <Glows />
            </div>
          </Block>
        </div>
        <Block title="קווים" note="מחיצות, גבולות, פוקוס">
          <Lines />
        </Block>
      </div>
    </Section>
  );
}
