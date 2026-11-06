/**
 * Motion maths for the style tile. Dependency-free and deterministic, so the
 * server and the browser draw byte-identical plots (no hydration drift).
 *
 * Plots live in a 160 × 100 box (t, p ∈ [0, 1]). Time flows toward
 * inline-end – right → left in Hebrew – exactly like the NDVI ramp and the
 * season itself, so a plot and the dot travelling under it always agree.
 */

import { easings, spring, type EasingKey } from '@/design/tokens';

export type Point = { readonly x: number; readonly y: number };
export type Ease = (t: number) => number;

export const PLOT_W = 160;
export const PLOT_H = 100;

/* ───────────────────────── cubic-bezier solver ───────────────────────── */

/**
 * CSS cubic-bezier(x1, y1, x2, y2) as a function of time: solve x(s) = t for
 * the curve parameter s (Newton–Raphson, falling back to bisection – the same
 * strategy browsers use), then return y(s).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (s: number) => ((ax * s + bx) * s + cx) * s;
  const y = (s: number) => ((ay * s + by) * s + cy) * s;
  const dx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  const EPS = 1e-7;

  const solve = (t: number) => {
    let s = t;
    for (let i = 0; i < 8; i++) {
      const err = x(s) - t;
      if (Math.abs(err) < EPS) return s;
      const d = dx(s);
      if (Math.abs(d) < 1e-6) break;
      s = Math.min(1, Math.max(0, s - err / d));
    }
    let lo = 0;
    let hi = 1;
    s = t;
    for (let i = 0; i < 64 && hi - lo > EPS; i++) {
      const v = x(s);
      if (Math.abs(v - t) < EPS) return s;
      if (v < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return s;
  };

  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : y(solve(t)));
}

/* ───────────────────────── linear() parsing ───────────────────────── */

/**
 * The stops of a CSS linear() easing. Stops without a position are spread
 * evenly between their neighbours, as the spec does; the first defaults to 0%
 * and the last to 100%.
 */
export function parseLinear(css: string): Point[] {
  const body = css.slice(css.indexOf('(') + 1, css.lastIndexOf(')'));
  const raw = body.split(',').map((part) => {
    const [value, at] = part.trim().split(/\s+/);
    return { y: Number(value), x: at === undefined ? Number.NaN : Number.parseFloat(at) / 100 };
  });
  if (raw.length === 0) return [];
  if (Number.isNaN(raw[0].x)) raw[0].x = 0;
  const last = raw[raw.length - 1];
  if (raw.length > 1 && Number.isNaN(last.x)) last.x = 1;
  for (let i = 1; i < raw.length - 1; i++) {
    if (!Number.isNaN(raw[i].x)) continue;
    let j = i;
    while (Number.isNaN(raw[j].x)) j++;
    const a = raw[i - 1].x;
    const b = raw[j].x;
    for (let k = i; k < j; k++) raw[k].x = a + ((b - a) * (k - i + 1)) / (j - i + 1);
    i = j;
  }
  return raw;
}

/** Piecewise-linear interpolation through the stops – exactly what linear() does. */
export function linearEase(points: readonly Point[]): Ease {
  return (t) => {
    if (t <= points[0].x) return points[0].y;
    for (let i = 1; i < points.length; i++) {
      const b = points[i];
      if (t <= b.x) {
        const a = points[i - 1];
        return b.x === a.x ? b.y : a.y + ((b.y - a.y) * (t - a.x)) / (b.x - a.x);
      }
    }
    return points[points.length - 1].y;
  };
}

/* ───────────────────────── sampling & readouts ───────────────────────── */

/**
 * Adaptive samples of an easing: subdivide any segment longer than `step`
 * (in unit space) so steep starts like out-expo stay smooth without
 * thousands of points.
 */
export function sampleEase(ease: Ease, step = 0.01): Point[] {
  const out: Point[] = [{ x: 0, y: ease(0) }];
  const seg = (a: Point, b: Point, depth: number) => {
    if (depth < 10 && Math.hypot(b.x - a.x, b.y - a.y) > step) {
      const mx = (a.x + b.x) / 2;
      const m = { x: mx, y: ease(mx) };
      seg(a, m, depth + 1);
      seg(m, b, depth + 1);
    } else {
      out.push(b);
    }
  };
  const n = 32;
  for (let i = 0; i < n; i++) {
    const x0 = i / n;
    const x1 = (i + 1) / n;
    seg({ x: x0, y: ease(x0) }, { x: x1, y: ease(x1) }, 0);
  }
  return out;
}

/** First moment the curve reaches progress `p` (bisection over a monotone rise). */
export function timeToReach(ease: Ease, p: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const fmt = (n: number) => String(Number(n.toFixed(2)));

/** Plot coordinates: time toward inline-end (RTL: right → left), progress up. */
export const px = (t: number) => PLOT_W * (1 - t);
export const py = (p: number) => PLOT_H * (1 - p);

export function plotPath(points: readonly Point[]) {
  return points.map((pt, i) => `${i ? 'L' : 'M'}${fmt(px(pt.x))} ${fmt(py(pt.y))}`).join(' ');
}

export const coord = (n: number) => fmt(n);

/* ───────────────────────── the six curves ───────────────────────── */

export type CurveSpec = {
  key: EasingKey;
  /** Tailwind utility / CSS variable name. */
  token: string;
  he: string;
  use: string;
  css: string;
  gsap: string | null;
  ease: Ease;
  path: string;
  /** Bezier control points, for the handles. */
  handles: readonly [Point, Point] | null;
  /** linear() stops, drawn as sample dots. */
  stops: readonly Point[] | null;
  /** Readout: when 90% of the way is covered (beziers) or the peak (spring). */
  mark: { at: Point; kind: 'p90' | 'peak' };
};

const springStops = parseLinear(spring.css);
const springPeak = springStops.reduce((m, p) => (p.y > m.y ? p : m), springStops[0]);

export const curveOrder = ['out-quint', 'out-expo', 'in-out-quart', 'in-quint', 'growth', 'spring'] as const;

export const curves: CurveSpec[] = curveOrder.map((key) => {
  if (key === 'spring') {
    return {
      key,
      token: 'ease-spring',
      he: spring.he,
      use: spring.use,
      css: spring.css,
      gsap: null,
      ease: linearEase(springStops),
      path: plotPath(springStops),
      handles: null,
      stops: springStops,
      mark: { at: springPeak, kind: 'peak' },
    };
  }
  const e = easings[key];
  const [x1, y1, x2, y2] = e.bezier;
  const ease = cubicBezier(x1, y1, x2, y2);
  const t90 = timeToReach(ease, 0.9);
  return {
    key,
    token: `ease-${key}`,
    he: e.he,
    use: e.use,
    css: `cubic-bezier(${e.bezier.join(', ')})`,
    gsap: e.gsap,
    ease,
    path: plotPath(sampleEase(ease)),
    handles: [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ],
    stops: null,
    mark: { at: { x: t90, y: 0.9 }, kind: 'p90' },
  };
});

export const springInfo = {
  stops: springStops.length,
  peak: springPeak,
};
