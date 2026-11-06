import type { ReactNode } from 'react';
import { easings } from '@/design/tokens';
import { cn } from '@/lib/cn';
import s from './motion.module.css';

/**
 * Four line glyphs for the motion principles. Decorative (the words carry the
 * meaning), drawn at 1 unit = 1px on a 120 × 56 box, time flowing right → left.
 */

type GlyphProps = { className?: string };

function Frame({ children, className }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 56"
      width="120"
      height="56"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(s.glyph, className)}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** 01 · Organic but precise – the real ease-growth curve over a 4px-style ruler. */
export function GlyphPrecise() {
  const [x1, y1, x2, y2] = easings.growth.bezier;
  const X = (t: number) => 116 - 112 * t;
  const Y = (p: number) => 50 - 42 * p;
  const ticks = Array.from({ length: 15 }, (_, k) => k);
  return (
    <Frame>
      <path d="M4 8H116" data-ink="faint" strokeDasharray="2 4" />
      <path d="M4 50H116" data-ink="rule" />
      {ticks.map((k) => (
        <path key={k} d={`M${116 - 8 * k} 50V${k % 4 === 0 ? 44 : 47}`} data-ink="rule" />
      ))}
      <path d={`M${X(0)} ${Y(0)}C${X(x1)} ${Y(y1)} ${X(x2)} ${Y(y2)} ${X(1)} ${Y(1)}`} data-ink="data" />
      <circle cx={X(0)} cy={Y(0)} r="2.5" data-fill="hole" data-ink="data" />
      <circle cx={X(1)} cy={Y(1)} r="3" data-fill="data" />
    </Frame>
  );
}

/** 02 · Motion is information – water flows from the emitters, data grows. */
export function GlyphInformation() {
  const emitters = [108, 92, 76];
  const bars = [
    { x: 46, h: 10 },
    { x: 35, h: 18 },
    { x: 24, h: 27 },
    { x: 13, h: 38 },
  ];
  return (
    <Frame>
      <path d="M68 16H116" data-ink="water" />
      {emitters.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="16" r="2.25" data-fill="water" />
          <circle cx={x} cy={26 + i * 3} r="1.5" data-fill="water" />
          <circle cx={x} cy={36 + i * 4} r="1.25" data-fill="water" opacity="0.6" />
        </g>
      ))}
      <path d="M4 50H58" data-ink="rule" />
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={50 - b.h} width="6" height={b.h} rx="1" data-fill="data" />
      ))}
    </Frame>
  );
}

/** 03 · Never a bounce on data – the honest approach vs. a struck-out overshoot. */
export function GlyphNoBounce() {
  return (
    <Frame>
      <path d="M4 18H116" data-ink="rule" strokeDasharray="3 4" />
      <path d="M116 50C96 50 86 1 66 5S30 21 4 18" data-ink="wrong" strokeDasharray="1.5 3.5" />
      <path d="M62 1l8 8M70 1l-8 8" data-ink="wrong" />
      <path d="M116 50C72 50 52 18 4 18" data-ink="data" />
      <circle cx="4" cy="18" r="3" data-fill="data" />
    </Frame>
  );
}

/**
 * 04 · Scroll is time – the season line fills as the principle scrolls by
 * (CSS scroll timeline). Static state: half a season, at stage 3.
 */
export function GlyphScroll() {
  const nodes = [116, 88, 60, 32, 4];
  return (
    <Frame>
      <path d="M116 30H4" data-ink="faint" />
      <path d="M116 30H4" pathLength={1} data-ink="progress" className={s.scrollFill} />
      {nodes.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="30"
          r="3.25"
          data-fill={i === 0 ? 'data' : 'hole'}
          data-ink={i === 0 ? undefined : 'rule'}
        />
      ))}
      <g className={s.scrollHead}>
        <path d="M60 14V46" data-ink="rule" />
        <path d="M56 10h8l-4 5z" data-fill="data" />
      </g>
    </Frame>
  );
}
