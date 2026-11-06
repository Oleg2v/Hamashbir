import type { CSSProperties } from 'react';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { covered } from '@/data/imagery';
import { cn } from '@/lib/cn';
import css from './imagery.module.css';
import { Credit, Photo } from './photo';

const W = covered.width;
const H = covered.height;
/** keep edge-aligned frames inside the photo so their stroke is never clipped */
const IN = 3;

type Frame = {
  ratio: '21:9' | '4:3' | '1:1';
  use: string;
  cls?: string;
  /** frame in photo pixels */
  box: { x: number; y: number; w: number; h: number };
  /** where its label sits on its own line, % of the photo */
  label: { x: number; y: number };
};

const h219 = (W * 9) / 21;
const w43 = (H * 4) / 3;

const frames: Frame[] = [
  {
    ratio: '21:9',
    use: 'מסך הפתיחה ובאנר העונה',
    box: { x: 0, y: (H - h219) / 2, w: W, h: h219 },
    label: { x: 76, y: ((H + h219) / 2 / H) * 100 },
  },
  {
    ratio: '4:3',
    use: 'כרטיס: מוצר, שלב, סניף',
    cls: css.crop43,
    box: { x: W - w43, y: 0, w: w43, h: H },
    label: { x: ((W - w43) / W) * 100, y: 62 },
  },
  {
    ratio: '1:1',
    use: 'תמונה ממוזערת: חלקה ברשימה',
    cls: css.crop11,
    box: { x: 0, y: 0, w: H, h: H },
    label: { x: (H / W) * 100, y: 22 },
  },
];

const rules = [
  'בנייד 21:9 הופך ל־4:3, סביב אותה נקודת מוקד.',
  'צילום אוויר עומד בפינות ישרות; בתוך כרטיס, הכרטיס חותך אותו.',
  'בלי אופק ובלי שמיים: אם רואים אותם, זה לא צילום אוויר.',
];

/** The frame drawn to proportion as a legend glyph. */
function Glyph({ frame }: { frame: Frame }) {
  const k = 24 / Math.min(frame.box.w, frame.box.h);
  const w = Math.round(frame.box.w * k);
  const h = Math.round(frame.box.h * k);
  return (
    <svg
      className={css.glyph}
      width={w + 2}
      height={h + 2}
      viewBox={`-1 -1 ${w + 2} ${h + 2}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width={w} height={h} className={frame.cls} />
    </svg>
  );
}

function CropFigure() {
  return (
    <figure className="grid content-start gap-4">
      <Photo
        photo={covered}
        ratio="native"
        slot="wide7"
        focus={{ x: 50, y: 50 }}
        alt="המנהרות והשדה הפתוח במלואם, ועליהם שלוש מסגרות חיתוך: רחבה לכל הרוחב, מלבנית מימין וריבועית משמאל."
      >
        <svg
          className={css.overlay}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {(['casing', 'line'] as const).map((layer) => (
            <g key={layer} className={css[layer]}>
              {frames.map((f) => (
                <rect
                  key={f.ratio}
                  x={f.box.x + IN}
                  y={f.box.y + IN}
                  width={f.box.w - 2 * IN}
                  height={f.box.h - 2 * IN}
                  className={cn(css.crop, f.cls)}
                />
              ))}
            </g>
          ))}
        </svg>
        {frames.map((f) => (
          <span
            key={f.ratio}
            className={cn(css.pin, css.pinCentre, css.tag, 'text-micro font-bold')}
            style={{ '--x': `${f.label.x}%`, '--y': `${f.label.y}%` } as CSSProperties}
            aria-hidden="true"
          >
            <Num>{f.ratio}</Num>
          </span>
        ))}
      </Photo>
      <figcaption className="text-micro text-ink-2">
        <Credit photo={covered} />
      </figcaption>
    </figure>
  );
}

/** Crops: three ratios only, always from the same focal point. */
export function Crops() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
        <CropFigure />
      </div>
      <div className="grid content-start gap-5 lg:col-span-5 lg:col-start-1 lg:row-start-1">
        <div className="grid gap-2">
          <h4 className="text-lead font-extrabold">חיתוכים</h4>
          <p className="text-body text-ink-2">שלושה יחסים בלבד, ותמיד מאותה נקודת מוקד.</p>
        </div>
        <dl className="grid">
          {frames.map((f) => (
            <div key={f.ratio} className="grid gap-1 border-t-(length:--bw) border-line py-4">
              <dt className="flex items-center gap-4 text-caption font-bold">
                <span className="grid w-12 shrink-0 place-items-center">
                  <Glyph frame={f} />
                </span>
                <Num>{f.ratio}</Num>
              </dt>
              <dd className="ps-16 text-caption text-ink-2">{f.use}</dd>
            </div>
          ))}
        </dl>
        <ul className="grid gap-2 text-caption text-ink-2">
          {rules.map((r) => (
            <li key={r}>
              <NumText>{r}</NumText>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
