import type { CSSProperties, ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { cn } from '@/lib/cn';
import {
  ashushitParts,
  assembledLayout,
  explodedLayout,
  type Callout,
  type Layout,
  type Paint,
  type Shape,
  type Text,
} from './ashushit-geometry';

/**
 * עשושית – Hamashbir's own portable irrigation station, as a technical line
 * illustration (engineering-drawing feel: centre lines, shade lines, chamfer
 * arcs, thread crests). Server component, no JS.
 *
 * - variant="assembled": the station standing on its lateral pipe.
 * - variant="exploded": the parts separated along the assembly axis in their
 *   published installation order – the storyboard for the Stage-1 3D build.
 * - labels={false}: the drawing alone, composed 4:3 for a product card.
 *
 * Strokes are currentColor and never scale; part bodies are opaque so the
 * drawing sits cleanly on a dot grid; water is the only colour. Callout dots
 * and labels are HTML laid over the drawing, so numerals stay legible at any
 * width and the legend is real, selectable text.
 */

type AshushitProps = {
  className?: string;
  variant?: 'assembled' | 'exploded';
  labels?: boolean;
  title?: string;
};

const paintClass: Record<Paint, string> = {
  fill: 'ash-b',
  tone1: 'ash-t1',
  tone2: 'ash-t2',
  tone3: 'ash-t3',
  water: 'ash-wt',
  dot: 'ash-dot',
  line: 'ash-l',
  fine: 'ash-f',
  shade: 'ash-s',
  center: 'ash-c',
  hidden: 'ash-h',
  axis: 'ash-ax',
  jet: 'ash-jet',
  drop: 'ash-dp',
  dropSm: 'ash-dp2',
  splash: 'ash-sp',
  cue: 'ash-cue',
  leader: 'ash-ld',
};

/* Scoped stylesheet, hoisted once per page (React 19 <style precedence>). */
const css = `
.ash{--ash-w:1.5px;--ash-wf:.8px;--ash-ws:2.4px;--ash-fo:.62;--ash-fill:var(--surface)}
:root[data-theme='sun'] .ash{--ash-w:2px;--ash-wf:1.25px;--ash-ws:3px;--ash-fo:1}
.ash path{fill:none;stroke:none;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.ash .ash-b{fill:var(--ash-fill)}
.ash .ash-t1{fill:color-mix(in oklab,currentColor 7%,var(--ash-fill))}
.ash .ash-t2{fill:color-mix(in oklab,currentColor 15%,var(--ash-fill))}
.ash .ash-t3{fill:color-mix(in oklab,currentColor 62%,var(--ash-fill))}
.ash .ash-wt{fill:var(--color-water)}
.ash .ash-dot{stroke:currentColor;stroke-width:calc(var(--ash-w)*2.8)}
.ash .ash-l{stroke:currentColor;stroke-width:var(--ash-w)}
.ash .ash-f{stroke:currentColor;stroke-width:var(--ash-wf);stroke-opacity:var(--ash-fo)}
.ash .ash-s{stroke:currentColor;stroke-width:var(--ash-ws)}
.ash .ash-c{stroke:currentColor;stroke-width:var(--ash-wf);stroke-opacity:calc(var(--ash-fo)*.8);stroke-dasharray:16 3 2 3;stroke-linecap:butt}
.ash .ash-h{stroke:currentColor;stroke-width:var(--ash-wf);stroke-opacity:var(--ash-fo);stroke-dasharray:3 2.5;stroke-linecap:butt}
.ash .ash-ax{stroke:currentColor;stroke-width:var(--ash-wf);stroke-dasharray:6 4;stroke-linecap:butt}
.ash .ash-ld{stroke:currentColor;stroke-width:var(--ash-wf)}
.ash .ash-jet{stroke:var(--water-ink);stroke-width:var(--ash-w);stroke-dasharray:7 5;animation:ash-flow 1.6s linear infinite}
.ash .ash-dp{stroke:var(--water-ink);stroke-width:calc(var(--ash-w)*1.9)}
.ash .ash-dp2{stroke:var(--water-ink);stroke-width:calc(var(--ash-w)*1.35)}
.ash .ash-sp{stroke:var(--water-ink);stroke-width:var(--ash-wf)}
.ash .ash-cue{stroke:currentColor;stroke-width:var(--ash-w)}
@keyframes ash-flow{to{stroke-dashoffset:-24}}
@media (prefers-reduced-motion:reduce){.ash .ash-jet{animation:none}}
`;

const pct = (v: number) => `${Math.round(v * 10000) / 100}%`;

function Shapes({ shapes }: { shapes: Shape[] }) {
  return shapes.map((sh, i) => <path key={i} d={sh.d} className={sh.paint.map((p) => paintClass[p]).join(' ')} />);
}

/** Plain-text form of a rich name (for aria-label). */
const plain = (t: Text) => t.map((seg) => (typeof seg === 'string' ? seg : seg.num)).join('');

function Rich({ text }: { text: Text }) {
  return text.map((seg, i) => (typeof seg === 'string' ? seg : <Num key={i}>{seg.num}</Num>));
}

/**
 * Callout dot: sprout fill, soil numeral. Its diameter is `--ash-dot`
 * (set on the figure, larger in sun mode) so overlays can pin its centre.
 */
function Dot({ n }: { n: number }) {
  return (
    <span className="grid size-(--ash-dot) shrink-0 place-items-center rounded-full border border-sprout-ink bg-sprout text-soil [:root[data-theme=sun]_&]:border-2">
      <Num className="text-micro font-semibold leading-none">{n}</Num>
    </span>
  );
}

/**
 * Pin an overlay so the centre of its leading dot sits on a drawing point,
 * or flush with inline-start for an edge balloon. The drawing is composed
 * RTL, so x is measured from inline-start (right); in an LTR page the SVG
 * mirrors (see `ltr:-scale-x-100`) and this still holds.
 */
const pin = (layout: Layout, c: Callout): CSSProperties => ({
  insetInlineStart: c.edge ? 0 : `calc(${pct((layout.w - c.dot.x) / layout.w)} - var(--ash-dot) / 2)`,
  top: `calc(${pct(c.dot.y / layout.h)} - var(--ash-dot) / 2)`,
});

function ariaLabel(title: string, variant: 'assembled' | 'exploded') {
  const parts = ashushitParts.map((p) => `${p.n} ${plain(p.name)}`).join(', ');
  return variant === 'exploded'
    ? `${title} – שרטוט מפורק לאורך ציר ההרכבה, מלמטה למעלה לפי סדר ההתקנה: ${parts}.`
    : `${title} – תחנת השקיה ניידת מורכבת על צינור שלוחה. החלקים לפי סדר ההתקנה: ${parts}.`;
}

export function Ashushit({ className, variant = 'assembled', labels = true, title = 'עשושית' }: AshushitProps) {
  const exploded = variant === 'exploded';
  const layout = exploded ? explodedLayout({ labels }) : assembledLayout({ labels });
  const { x, y, k } = layout.frame;

  const drawing: ReactNode = (
    <svg
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      role="img"
      aria-label={ariaLabel(title, variant)}
      focusable="false"
      className="ash block h-auto w-full ltr:-scale-x-100"
    >
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <Shapes shapes={layout.under} />
        {layout.parts.map((p) => (
          <g key={p.id} transform={p.dy ? `translate(0 ${p.dy})` : undefined}>
            <Shapes shapes={p.shapes} />
          </g>
        ))}
        <Shapes shapes={layout.over} />
      </g>
    </svg>
  );

  return (
    <figure
      className={cn(
        '@container relative m-0 [--ash-dot:1.25rem] [:root[data-theme=sun]_&]:[--ash-dot:1.5rem] [:where(&)]:w-full',
        className,
      )}
    >
      <style href="hm-ashushit" precedence="medium">
        {css}
      </style>
      <div className="relative">
        {drawing}
        {labels && !exploded ? (
          <div aria-hidden="true">
            {layout.callouts.map((c) => (
              <span key={c.n} className="absolute" style={pin(layout, c)}>
                <Dot n={c.n} />
              </span>
            ))}
          </div>
        ) : null}
        {labels && exploded ? (
          <ol aria-hidden="true" className="m-0 list-none p-0">
            {layout.callouts.map((c) => {
              const part = ashushitParts[c.n - 1];
              return (
                <li key={c.n} className="absolute flex items-start gap-2" style={pin(layout, c)}>
                  <Dot n={c.n} />
                  <span className="grid w-max max-w-36 gap-1">
                    <span className="text-caption font-semibold text-ink">
                      <Rich text={part.short} />
                    </span>
                    {part.spec ? (
                      <span className="text-micro text-ink-2">
                        <Rich text={part.spec} />
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>

      {labels && !exploded ? (
        <figcaption className="mt-6 grid gap-4 border-t border-line pt-5">
          <ol className="m-0 grid list-none gap-x-8 gap-y-3 p-0 @md:grid-flow-col @md:grid-rows-4">
            {ashushitParts.map((p) => (
              <li key={p.n} className="flex items-center gap-3 text-caption">
                <Dot n={p.n} />
                <span>
                  <Rich text={p.name} />
                </span>
              </li>
            ))}
          </ol>
          <p className="m-0 text-caption text-ink-2">
            {/* each spec stays whole; a separator may end a line, never start one */}
            מתאים לצינור{' '}
            <span className="whitespace-nowrap">
              PE <Num>50</Num> מ״מ ·
            </span>{' '}
            <span className="whitespace-nowrap">
              PVC <Num>50</Num> מ״מ ·
            </span>{' '}
            <span className="whitespace-nowrap">
              אלומיניום <Num>2</Num>״
            </span>
          </p>
        </figcaption>
      ) : null}
      {labels && exploded ? (
        <figcaption className="mt-4 text-caption text-ink-2">שרטוט מפורק · סדר ההתקנה מלמטה למעלה</figcaption>
      ) : null}
    </figure>
  );
}
