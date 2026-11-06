import type { CSSProperties } from 'react';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { orchard, orchardSurvey as survey } from '@/data/imagery';
import { contrast, sampleRamp } from '@/design/color';
import { ndvi, palette } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';
import css from './imagery.module.css';
import { Credit, Photo } from './photo';

const W = orchard.width;
const H = orchard.height;
const r1 = (v: number) => Math.round(v * 10) / 10;
const cross = (x: number, y: number, r: number) => `M${r1(x - r)} ${r1(y)}h${2 * r}M${r1(x)} ${r1(y - r)}v${2 * r}`;

/** Overlay geometry in the photo's own pixel space (see orchardSurvey). */
function geometry() {
  const step = survey.gridM / survey.metresPerPx;
  const grid: string[] = [];
  for (let x = step; x < W; x += step) for (let y = step; y < H; y += step) grid.push(cross(x, y, 16));
  const t = 20;
  const ticks: string[] = [];
  for (let i = 1; i < 10; i++) {
    const x = (W * i) / 10;
    const y = (H * i) / 10;
    ticks.push(`M${x} 0v${t}M${x} ${H}v${-t}M0 ${y}h${t}M${W} ${y}h${-t}`);
  }
  return {
    grid: grid.join(''),
    ticks: ticks.join(''),
    boundary: `M${survey.boundary.map(([x, y]) => `${x} ${y}`).join('L')}`,
    vertices: survey.vertices.map(([x, y]) => cross(x, y, 26)).join(''),
  };
}

const plateContrast = contrast(palette.soil.hex, palette.paper.hex).toFixed(1);

const rules = [
  {
    term: 'קו',
    text: 'נייר ברוחב 1px על עטיפת אדמה, כדי שיחזיק גם על יריעה לבנה וגם על אדמה כהה; 2px במצב שמש.',
  },
  {
    term: 'צלב',
    text: `בכל קודקוד של גבול חלקה, ועל רשת קבועה כל ${survey.gridM} מ׳. אף צלב לא נמצא שם לקישוט.`,
  },
  {
    term: 'תווית',
    text: `לוחית אדמה וטקסט נייר: ניגודיות ${plateContrast}:1 על כל צילום. מספרים במונו, יחידות בעברית.`,
  },
  {
    term: 'קנה מידה',
    text: `תמיד. כאן הוא משוער, לפי שורות המטע${NB}– כ־${survey.rowSpacingM} מ׳ בין שורה לשורה. חץ צפון רק כשהכיוון ידוע.`,
  },
] as const;

function SurveyFigure() {
  const g = geometry();
  const scale = survey.scaleBarM / survey.metresPerPx / W;
  return (
    <figure className="grid content-start gap-4">
      <Photo photo={orchard} ratio="4/3" slot="wide7">
        <svg
          className={css.overlay}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {(['casing', 'line'] as const).map((layer) => (
            <g key={layer} className={css[layer]}>
              <path d={g.ticks} className={css.faint} />
              <path d={g.grid} className={css.faint} />
              <path d={g.boundary} className={css.boundary} />
              <path d={g.vertices} className={css.vertex} />
              {survey.vertices.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={10} className={css.vertex} />
              ))}
            </g>
          ))}
        </svg>
        {survey.parcels.map((p) => (
          <div key={p.id} className={css.pin} style={{ '--x': `${p.at.x}%`, '--y': `${p.at.y}%` } as CSSProperties}>
            <p className={css.plate} style={{ '--swatch': sampleRamp(ndvi.stops, p.index) } as CSSProperties}>
              <span className="text-micro font-bold">
                {p.id} · {p.name}
              </span>
              <span className={cn(css.plateMeta, 'text-micro')}>
                מדד ממוצע <Num>{p.index.toFixed(2)}</Num>
              </span>
            </p>
          </div>
        ))}
        <p className={cn(css.plate, css.corner)}>
          <span className={css.scaleBar} style={{ '--scale': scale.toFixed(4) } as CSSProperties} />
          <span className="text-micro">
            <Num>{survey.scaleBarM}</Num>
            {NB}מ׳ · משוער
          </span>
        </p>
      </Photo>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 text-micro text-ink-2">
        <span>
          {orchard.place} · <Num>{survey.coords}</Num>
        </span>
        <span>
          רשת <Num>{survey.gridM}</Num>
          {NB}מ׳ · מדד ממוצע לכל צד של הדרך
        </span>
        <Credit photo={orchard} />
        <DemoTag />
      </figcaption>
    </figure>
  );
}

/** Survey layer over a photo: the hero's crosshairs, scale bar and mono labels, on real ground. */
export function Survey() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-7">
        <SurveyFigure />
      </div>
      <div className="grid content-start gap-5 lg:col-span-4 lg:col-start-9">
        <div className="grid gap-2">
          <h4 className="text-lead font-extrabold">שכבת מדידה</h4>
          <p className="text-body text-ink-2">
            קווים, צלבים ותוויות מעל הצילום, באותה שפה של החלקות במסך הפתיחה. כל קו מסמן משהו שאפשר למדוד.
          </p>
        </div>
        <dl className="grid">
          {rules.map((r) => (
            <div key={r.term} className="grid gap-1 border-t-(length:--bw) border-line py-4">
              <dt className="text-caption font-bold">{r.term}</dt>
              <dd className="text-caption text-ink-2">
                <NumText>{r.text}</NumText>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
