import type { CSSProperties, ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';
import styles from './Ashushit.module.css';
import { AshushitJet } from './AshushitJet';
import {
  ashushitParts,
  ashushitSteps,
  assembledLayout,
  explodedLayout,
  type Callout,
  type Layout,
  type Placed,
  type Shape,
  type Text,
} from './ashushit-geometry';

/**
 * עשושית – Hamashbir's own irrigation station (עמדת השקיה), as a technical
 * line illustration drawn from the client's published installation guide:
 * centre lines, shade lines, chamfer arcs, thread crests, hidden lines.
 * Server component; only the jet's one-shot play is a client island.
 *
 * - variant="assembled": the station inline on its lateral, a parts drawing
 *   with balloons and a legend in the client's part names.
 * - variant="exploded": the guide's five steps (01–05) on two assembly
 *   axes – the storyboard for the Stage-1 3D build.
 * - labels={false}: the drawing alone – no balloons, step tags or caption. The
 *   assembled variant is then composed 4:3 for a product card.
 *
 * Strokes are currentColor and never scale; part bodies are opaque so the
 * drawing sits cleanly on a dot grid; water is the only colour. Balloons,
 * step tags and the legend are HTML laid over or under the drawing, so
 * numerals stay legible at any width and the text is real, selectable text.
 */

type AshushitProps = {
  className?: string;
  variant?: 'assembled' | 'exploded';
  labels?: boolean;
  title?: string;
};

const pct = (v: number) => `${Math.round(v * 10000) / 100}%`;

function Shapes({ shapes }: { shapes: Shape[] }) {
  return shapes.map((s, i) => (
    <path key={i} d={s.d} className={s.paint.map((p) => styles[p]).join(' ')} data-jet={s.jet} />
  ));
}

function Part({ p }: { p: Placed }) {
  const t = [p.dx || p.dy ? `translate(${p.dx ?? 0} ${p.dy ?? 0})` : '', p.rotate ? `rotate(${p.rotate})` : '']
    .filter(Boolean)
    .join(' ');
  return (
    <g transform={t || undefined}>
      <Shapes shapes={p.shapes} />
    </g>
  );
}

/** Plain-text form of a rich text (for aria-label). */
const plain = (t: Text) => t.map((seg) => (typeof seg === 'string' ? seg : seg.num)).join('');

function Rich({ text }: { text: Text }) {
  return text.map((seg, i) => (typeof seg === 'string' ? seg : <Num key={i}>{seg.num}</Num>));
}

const two = (n: number) => String(n).padStart(2, '0');

/**
 * Part balloon: sprout fill, soil numeral. Its diameter is `--ash-dot` (set
 * on the figure, larger in sun mode) so overlays can pin its centre.
 */
function Dot({ n }: { n: number }) {
  return (
    <span className="grid size-(--ash-dot) shrink-0 place-items-center rounded-full border-(length:--bw) border-sprout-ink bg-sprout text-soil">
      <Num className="text-micro leading-none font-semibold">{n}</Num>
    </span>
  );
}

/** Step tag (01–05): ink chip, mono numerals – the guide's own step numbering. */
function StepTag({ n }: { n: number }) {
  return (
    <span className="inline-grid h-(--ash-dot) min-w-7 shrink-0 place-items-center rounded-xs bg-inverse px-1 text-inverse-ink">
      <Num className="text-micro leading-none font-semibold">{two(n)}</Num>
    </span>
  );
}

/**
 * Pin an overlay so its centre sits on a drawing point (a zero-size flex
 * box centres any child without a direction-dependent translate), or – for
 * an edge balloon – flush with inline-start. The drawing is composed RTL,
 * so x is measured from inline-start (right); in an LTR page the SVG mirrors
 * (see `ltr:-scale-x-100`) and this still holds.
 */
function Pin({
  layout,
  at,
  edge,
  children,
}: {
  layout: Layout;
  at: { x: number; y: number };
  edge?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = edge
    ? { insetInlineStart: 0, top: `calc(${pct(at.y / layout.h)} - var(--ash-dot) / 2)` }
    : { insetInlineStart: pct((layout.w - at.x) / layout.w), top: pct(at.y / layout.h) };
  return (
    <span className={cn('absolute', !edge && 'flex size-0 items-center justify-center')} style={style}>
      {children}
    </span>
  );
}

function Overlay({ layout, c }: { layout: Layout; c: Callout }) {
  if (c.kind === 'part') {
    return (
      <Pin layout={layout} at={c.at} edge={c.edge}>
        <Dot n={c.n} />
      </Pin>
    );
  }
  if (c.kind === 'step') {
    return (
      <Pin layout={layout} at={c.at}>
        <StepTag n={c.n} />
      </Pin>
    );
  }
  return (
    <Pin layout={layout} at={c.at}>
      <span className="text-micro whitespace-nowrap text-ink-2">
        כ־<Num>5</Num>
        {NB}ס״מ
      </span>
    </Pin>
  );
}

function ariaLabel(title: string, variant: 'assembled' | 'exploded', labels: boolean) {
  if (variant === 'exploded') {
    const steps = ashushitSteps.map((s) => `${two(s.n)} ${plain(s.text)}`).join(' ');
    return `${title}${NB}– שרטוט מפורק לפי הוראות ההרכבה, בחמישה שלבים. ${steps}`;
  }
  if (!labels) return `${title}${NB}– עמדת השקיה: ממטיר על זקף, במצמד שעל צינור השלוחה`;
  const parts = ashushitParts.map((p) => `${p.n} ${plain(p.name)}`).join(', ');
  return `${title}${NB}– עמדת השקיה מורכבת על צינור השלוחה, שנכנס למצמד מצד אחד ויוצא מהצד השני. החלקים: ${parts}.`;
}

export function Ashushit({ className, variant = 'assembled', labels = true, title = 'עשושית' }: AshushitProps) {
  const exploded = variant === 'exploded';
  const layout = exploded ? explodedLayout() : assembledLayout({ labels });
  const { x, y, k } = layout.frame;

  const drawing: ReactNode = (
    <svg
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      role="img"
      aria-label={ariaLabel(title, variant, labels)}
      focusable="false"
      className={cn(styles.ash, 'block h-auto w-full ltr:-scale-x-100')}
    >
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <Shapes shapes={layout.under} />
        {layout.parts.map((p) => (
          <Part key={p.id} p={p} />
        ))}
        <Shapes shapes={layout.over} />
      </g>
    </svg>
  );

  const overlays = labels ? (
    <div aria-hidden="true">
      {layout.callouts.map((c, i) => (
        <Overlay key={i} layout={layout} c={c} />
      ))}
    </div>
  ) : null;

  return (
    <figure
      className={cn(
        '@container relative m-0 [--ash-dot:1.25rem] [:root[data-theme=sun]_&]:[--ash-dot:1.5rem] [:where(&)]:w-full',
        className,
      )}
    >
      {exploded ? (
        <div className="relative">
          {drawing}
          {overlays}
        </div>
      ) : (
        <AshushitJet className="relative">
          {drawing}
          {overlays}
        </AshushitJet>
      )}

      {labels && !exploded ? (
        <figcaption className="mt-6 grid gap-4 border-t-(length:--bw) border-line pt-5">
          <ol className="m-0 grid list-none gap-x-8 gap-y-3 p-0 @md:grid-flow-col @md:grid-rows-5">
            {ashushitParts.map((p) => (
              <li key={p.n} className="flex items-start gap-3 text-caption">
                <Dot n={p.n} />
                <span className="grid gap-1">
                  <span>
                    <Rich text={p.name} />
                  </span>
                  {p.spec ? (
                    <span className="text-micro text-ink-2">
                      <Rich text={p.spec} />
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          <p className="m-0 text-caption text-ink-2">
            {/* each spec stays whole; a separator may end a line, never start one */}
            מתאים לצינור{' '}
            <span className="whitespace-nowrap">
              PE <Num>50</Num>
              {NB}מ״מ ·
            </span>{' '}
            <span className="whitespace-nowrap">
              PVC <Num>50</Num>
              {NB}מ״מ ·
            </span>{' '}
            <span className="whitespace-nowrap">
              אלומיניום <Num>2״</Num>
            </span>
          </p>
        </figcaption>
      ) : null}

      {labels && exploded ? (
        <figcaption className="mt-6 grid gap-4 border-t-(length:--bw) border-line pt-5">
          <ol className="m-0 grid list-none gap-3 p-0">
            {ashushitSteps.map((s) => (
              <li key={s.n} className="flex items-start gap-3 text-caption">
                <StepTag n={s.n} />
                <span>
                  <Rich text={s.text} />
                </span>
              </li>
            ))}
          </ol>
          <p className="m-0 text-micro text-ink-2">
            לפי „עשושית הוראות הרכבה”, המשביר לחקלאי. הפתח השני של המצמד מקבל את המשך השלוחה באותו אופן.
          </p>
        </figcaption>
      ) : null}
    </figure>
  );
}
