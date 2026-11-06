import type { CSSProperties, ReactNode } from 'react';
import { DemoTag } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { demoFarm, planLines, season as farm } from '@/data/demo-farm';
import { mixOklab, sampleRamp } from '@/design/color';
import { durations, ndvi, palette, stages, staggerDelay, surfaces, type StageId } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import css from './SeasonParcels.module.css';

/**
 * העונה מלמעלה – the season, seen from above.
 *
 * The demo farm's one field (src/data/demo-farm.ts: 40 dunam of pepper in a
 * net house in the Arava) drawn at five moments of a single season, side by
 * side in time order from inline-start: שתילה → השקיה → הגנה → קטיף → אריזה.
 * One generator feeds two compositions – a wide strip and a 2–2–1 block for
 * phones – switched by a container query on the figure's own width.
 *
 * Each composition is two layers with the same viewBox:
 *  - the ground (soil, tracks, parcels, terrain, beds, stubble, survey
 *    vertices) is static, so it ships as one <img> of an SVG data URI: a
 *    single DOM node that the browser rasterises once;
 *  - the season (plants, drip, fruit, cartons) is inline SVG on top, so it
 *    can open with CSS keyframes – opacity and transform only, plus the
 *    dash-offset draw of the drip lines – after <html data-ready> (set once
 *    the page has loaded and gone idle), never while it is still hydrating.
 *
 * Plants use the dot trick (round caps + stroke-dasharray "0 N"), so one
 * <path> is one row of plants. Geometry comes from a seeded PRNG at module
 * load: the markup is identical on every render. Server component, no JS.
 * Under prefers-reduced-motion the finished season shows immediately.
 */

/* ───────────────────────────── randomness ───────────────────────────── */

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────────── colour ───────────────────────────── */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The NDVI ramp sampled in OKLCH (design/color.ts) – the same space as the CSS ramp. */
const ndviColor = (v: number) => sampleRamp(ndvi.stops, v);

const ndviStops = (from: number, to: number, n: number) =>
  Array.from({ length: n }, (_, i) => ({ o: i / (n - 1), c: ndviColor(lerp(from, to, i / (n - 1))) }));

const C = {
  soil: palette.soil.hex,
  loam: palette.loam.hex,
  paper: palette.paper.hex,
  sprout: palette.sprout.hex,
  water: palette.water.hex,
  wheat: palette.wheat.hex,
  harvest: palette.harvest.hex,
};

/** Ground tone per moment: fresh beds, wet soil, bare loam, shade under canopy, straw. */
const TONES = [
  mixOklab(C.loam, C.paper, 0.03),
  mixOklab(mixOklab(C.loam, C.soil, 0.2), C.water, 0.03),
  C.loam,
  mixOklab(C.loam, C.soil, 0.3),
  mixOklab(C.loam, C.wheat, 0.09),
];

/* ───────────────────────────── plane geometry ───────────────────────────── */

type P = readonly [number, number];
/** Parcel corners in this order: top-right, top-left, bottom-left, bottom-right. */
type Quad = readonly [P, P, P, P];
type Curve = readonly [P, P, P, P];
type Line = { p: P; d: P };
type Box = { x0: number; y0: number; x1: number; y1: number };

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mix = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const dist = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const line = (a: P, b: P): Line => ({ p: a, d: [b[0] - a[0], b[1] - a[1]] });

function meet(l1: Line, l2: Line): P {
  const den = l1.d[0] * l2.d[1] - l1.d[1] * l2.d[0];
  const t = ((l2.p[0] - l1.p[0]) * l2.d[1] - (l2.p[1] - l1.p[1]) * l2.d[0]) / den;
  return [l1.p[0] + t * l1.d[0], l1.p[1] + t * l1.d[1]];
}

/** Shrink a convex quad by `d` on every side – the dirt track between parcels. */
function inset(q: Quad, d: number): Quad {
  const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
  const cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
  const edges = q.map((a, i) => {
    const b = q[(i + 1) % 4];
    const len = dist(a, b);
    let nx = -(b[1] - a[1]) / len;
    let ny = (b[0] - a[0]) / len;
    if ((cx - a[0]) * nx + (cy - a[1]) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return line([a[0] + nx * d, a[1] + ny * d], [b[0] + nx * d, b[1] + ny * d]);
  });
  const v = (i: number) => meet(edges[(i + 3) % 4], edges[i]);
  return [v(0), v(1), v(2), v(3)];
}

/** Shoelace area of a quad, in drawing units². */
const area = (q: Quad) =>
  Math.abs(q.reduce((s, a, i) => s + a[0] * q[(i + 1) % 4][1] - q[(i + 1) % 4][0] * a[1], 0)) / 2;

/** Attribute numbers (stroke widths, dashes): one decimal. */
const n1 = (x: number) => `${Math.round(x * 10) / 10}`;

/** Path writer: relative commands at a per-composition precision keep the markup light. */
function pen(prec: number) {
  const k = 10 ** prec;
  const n = (x: number) => `${Math.round(x * k) / k || 0}`;
  const list = (xs: number[]) =>
    xs.reduce((acc, x, i) => {
      const s = n(x);
      return i === 0 || s[0] === '-' ? acc + s : `${acc} ${s}`;
    }, '');
  return {
    curve: ([a, b, c, e]: Curve, dx = 0) =>
      `M${list([a[0] + dx, a[1]])}c${list([b[0] - a[0], b[1] - a[1], c[0] - a[0], c[1] - a[1], e[0] - a[0], e[1] - a[1]])}`,
    seg: (a: P, b: P) => `M${list([a[0], a[1]])}l${list([b[0] - a[0], b[1] - a[1]])}`,
    poly: (pts: readonly P[]) => `M${pts.map((p) => list([p[0], p[1]])).join('L')}z`,
    rect: (x: number, y: number, w: number, h: number) => `M${list([x, y])}h${n(w)}v${n(h)}h${n(-w)}z`,
    dot: (x: number, y: number) => `M${list([x, y])}h.01`,
    cross: (x: number, y: number, r: number) => `M${list([x - r, y])}h${n(2 * r)}M${list([x, y - r])}v${n(2 * r)}`,
  };
}

const spread = (n: number) => Array.from({ length: n }, (_, i) => (n === 1 ? 0.5 : i / (n - 1)));
const between = (n: number) => Array.from({ length: n - 1 }, (_, i) => (i + 0.5) / (n - 1));

/** 'down': rows run top → bottom, spread right → left. 'across': rows run right → left, spread top → bottom. */
type Axis = 'down' | 'across';

type RowOpts = {
  axis: Axis;
  /** margins across the rows (start, end) */
  pad: readonly [number, number];
  /** trims along each row (start, end) */
  trim: readonly [number, number] | ((j: number) => readonly [number, number]);
  /** terrain contour: an S-bend shared by every row, so the spacing stays even */
  bend: number;
  /** rows stop short of this box (the carton yard) */
  avoid?: Box;
  minLen?: number;
};

const edgesFor = ([tr, tl, bl, br]: Quad, axis: Axis) => (axis === 'down' ? [tr, tl, br, bl] : [tr, br, tl, bl]);

function rowCount(q: Quad, o: RowOpts, spacing: number) {
  const [u0, u1, v0, v1] = edgesFor(q, o.axis);
  const len = (dist(u0, u1) + dist(v0, v1)) / 2 - o.pad[0] - o.pad[1];
  return Math.max(2, Math.round(len / spacing) + 1);
}

/** Plant rows inside a parcel, each one cubic, all sharing the parcel's contour. */
function rows(q: Quad, fractions: number[], o: RowOpts): Curve[] {
  const [u0, u1, v0, v1] = edgesFor(q, o.axis);
  const lu = dist(u0, u1);
  const lv = dist(v0, v1);
  const out: Curve[] = [];
  fractions.forEach((f, j) => {
    const S = mix(u0, u1, o.pad[0] / lu + f * (1 - (o.pad[0] + o.pad[1]) / lu));
    const E = mix(v0, v1, o.pad[0] / lv + f * (1 - (o.pad[0] + o.pad[1]) / lv));
    const L = dist(S, E);
    const [t0, t1] = typeof o.trim === 'function' ? o.trim(j) : o.trim;
    const p0 = mix(S, E, t0 / L);
    let p3 = mix(S, E, 1 - t1 / L);
    const a = o.avoid;
    if (a && o.axis === 'down' && p3[0] > a.x0 && p3[0] < a.x1 && p3[1] > a.y0) {
      p3 = mix(S, E, (a.y0 - S[1]) / (E[1] - S[1]));
    }
    if (a && o.axis === 'across' && p3[1] > a.y0 && p3[1] < a.y1 && p3[0] < a.x1) {
      p3 = mix(S, E, (a.x1 - S[0]) / (E[0] - S[0]));
    }
    if (dist(p0, p3) < (o.minLen ?? 0)) return;
    const off: P = o.axis === 'down' ? [o.bend, 0] : [0, o.bend];
    out.push([p0, add(mix(p0, p3, 1 / 3), off), add(mix(p0, p3, 2 / 3), [-off[0] * 0.55, -off[1] * 0.55]), p3]);
  });
  return out;
}

/* ───────────────────────────── compositions ───────────────────────────── */

type Spec = {
  key: 'w' | 'n';
  W: number;
  H: number;
  /** path precision (decimals) */
  prec: number;
  quads: Quad[];
  dividers: ReadonlyArray<readonly [P, P]>;
  vertices: P[];
  /** half the width of the dirt track between parcels */
  track: number;
  /** stroke and spacing scale */
  u: number;
  /** bare headland at the top of every parcel (room for a label plate) */
  head: number;
  bend: readonly number[];
  yard: { cols: number; rows: number; skip: readonly number[] };
  mottles: ReadonlyArray<{ c: P; r: P; tone: 'dark' | 'light' }>;
  seed: number;
};

/** Wide: the five moments side by side, the first at the right. */
const WT: P[] = [
  [1590, 18],
  [1262, 10],
  [950, 22],
  [644, 12],
  [316, 24],
  [10, 14],
];
const WB: P[] = [
  [1584, 626],
  [1278, 632],
  [934, 620],
  [662, 630],
  [298, 618],
  [16, 628],
];

const wideSpec: Spec = {
  key: 'w',
  W: 1600,
  H: 640,
  prec: 0,
  quads: [0, 1, 2, 3, 4].map((i) => [WT[i], WT[i + 1], WB[i + 1], WB[i]] as const),
  dividers: [1, 2, 3, 4].map((k) => [WT[k], WB[k]] as const),
  vertices: [...WT, ...WB],
  track: 7,
  u: 1,
  head: 0,
  bend: [12, -17, 18, -13, 10],
  yard: { cols: 5, rows: 5, skip: [0, 21, 24] },
  mottles: [
    { c: [1190, 430], r: [320, 210], tone: 'dark' },
    { c: [400, 150], r: [380, 170], tone: 'dark' },
    { c: [780, 520], r: [400, 170], tone: 'light' },
    { c: [1480, 110], r: [260, 140], tone: 'light' },
  ],
  seed: 1993,
};

/**
 * Narrow: 2–2–1, read right-to-left, then down. Row heights 2 : 2 : 1, so the
 * full-width fifth parcel has the same area as the four half-width ones.
 */
const narrowSpec: Spec = (() => {
  const H0 = line([356, 6], [4, 10]);
  const H1 = line([356, 262], [4, 254]);
  const H2 = line([356, 512], [4, 518]);
  const H3 = line([356, 640], [4, 636]);
  const R = line([356, 0], [356, 1]);
  const L = line([4, 0], [4, 1]);
  /* field lines rarely meet across a road: the two mid boundaries are offset */
  const A = line([188, 0], [180, 266]);
  const B = line([164, 256], [176, 522]);
  const [a0, a1, a2] = [meet(H0, R), meet(H0, A), meet(H0, L)];
  const [b0, b1, b2, b3] = [meet(H1, R), meet(H1, A), meet(H1, B), meet(H1, L)];
  const [c0, c1, c2] = [meet(H2, R), meet(H2, B), meet(H2, L)];
  const [d0, d1] = [meet(H3, R), meet(H3, L)];
  return {
    key: 'n',
    W: 360,
    H: 646,
    prec: 1,
    quads: [
      [a0, a1, b1, b0],
      [a1, a2, b3, b1],
      [b0, b2, c1, c0],
      [b2, b3, c2, c1],
      [c0, c2, d1, d0],
    ],
    dividers: [
      [a1, b1],
      [b2, c1],
      [b0, b3],
      [c0, c2],
    ],
    vertices: [a0, a1, a2, b0, b1, b2, b3, c0, c1, c2, d0, d1],
    track: 4,
    u: 0.78,
    head: 64,
    bend: [5, -7, 7, -6, 4],
    yard: { cols: 3, rows: 3, skip: [8] },
    mottles: [
      { c: [270, 330], r: [150, 120], tone: 'dark' },
      { c: [80, 120], r: [140, 90], tone: 'dark' },
      { c: [150, 580], r: [170, 70], tone: 'light' },
      { c: [300, 80], r: [90, 70], tone: 'light' },
    ],
    seed: 2026,
  };
})();

/* ───────────────────────────── the opening ───────────────────────────── */

/**
 * The opening, in ms, from tokens only: each moment of the season opens one
 * `base` beat after the one before it; rows inside a moment follow
 * staggerDelay (40ms apart, 480ms at most).
 */
const beat = durations.base.ms;
const T = {
  seedlings: 0,
  main: beat,
  laterals: beat + durations.fast.ms,
  protect: 2 * beat,
  canopy: 3 * beat,
  fruit: 3 * beat + durations.grow.ms,
  cartons: 3 * beat + durations.grow.ms + durations.fast.ms,
};

/** Each animated mark's motion, so the opening's length is computed, never typed. */
const MOVES = {
  pop: durations.slow.ms,
  draw: durations.grow.ms,
  fade: durations.grow.ms,
  grow: durations.grow.ms,
  glow: durations.slow.ms,
  stack: durations.slow.ms,
} as const;
type Move = keyof typeof MOVES;

function build(spec: Spec) {
  const rnd = prng(spec.seed);
  const { u, W, H } = spec;
  const d = pen(spec.prec);
  const inner = spec.quads.map((q) => inset(q, spec.track));
  const side = 9 * u;
  const end = 12 * u;
  const top = end + spec.head;
  const merge = (cs: Curve[], dx = 0) => cs.map((c) => d.curve(c, dx)).join('');
  const down = (bend: number): RowOpts => ({ axis: 'down', pad: [side, side], trim: [top, end], bend });
  const across = (bend: number): RowOpts => ({ axis: 'across', pad: [top, end], trim: [side, side], bend });
  let ends = 0;
  const at = (ms: number, move: Move) => {
    ends = Math.max(ends, ms + MOVES[move]);
    return ms;
  };

  /* 01 שתילה – beds across the field, young seedlings set out along them */
  const q1 = inner[0];
  const o1 = across(spec.bend[0]);
  const n1Rows = rowCount(q1, o1, 11.6 * u);
  const sow = {
    troughs: merge(rows(q1, spread(n1Rows), o1)),
    ridges: merge(rows(q1, between(n1Rows), o1)),
    seedlings: merge(rows(q1, between(n1Rows), { ...o1, trim: () => [side + rnd() * 22 * u, side] })),
    delay: at(T.seedlings, 'pop'),
  };

  /* 02 השקיה – a sub-main along the headland, laterals down every other bed */
  const q2 = inner[1];
  const o2 = down(spec.bend[1]);
  const n2Rows = rowCount(q2, o2, 11.6 * u);
  const laterals = rows(
    q2,
    between(n2Rows).filter((_, i) => i % 2 === 0),
    { ...o2, trim: [top + 6 * u, end + 4 * u] },
  );
  const first = laterals[0][0];
  const last = laterals[laterals.length - 1][0];
  const along = dist(first, last);
  const reach = side + spec.track + 2 * u;
  const supply: P = [
    first[0] + ((first[0] - last[0]) / along) * reach,
    first[1] + ((first[1] - last[1]) / along) * reach,
  ];
  const lateralDelays = laterals.map((_, j) => at(T.laterals + staggerDelay(j, laterals.length), 'draw'));
  const drawn = Math.max(...lateralDelays) + MOVES.draw;
  const irrigate = {
    furrows: merge(rows(q2, spread(n2Rows), o2)),
    main: d.seg(supply, last),
    mainDelay: at(T.main, 'draw'),
    valve: d.rect(supply[0] - 3.5 * u, supply[1] - 3.5 * u, 7 * u, 7 * u),
    laterals: laterals.map((c, j) => ({ d: d.curve(c), delay: lateralDelays[j] })),
    emitters: merge(laterals),
    emittersDelay: at(T.laterals + MOVES.draw, 'fade'),
    /* light as information: the wet lines glow once the water has reached their ends */
    glow: d.seg(supply, last) + merge(laterals),
    glowDelay: at(drawn, 'glow'),
  };

  /* 03 הגנה – young to dense canopy, coloured by NDVI (mean ≈ the label's reading) */
  const q3 = inner[2];
  const o3 = down(spec.bend[2]);
  const protectCurves = rows(q3, spread(rowCount(q3, o3, 13.4 * u)), o3);
  const protect = {
    rows: protectCurves.map((c, j, all) => {
      const t = j / (all.length - 1);
      return {
        d: d.curve(c),
        w: lerp(2.3, 7.4, t * t) * u,
        dash: `0 ${n1(lerp(11.5, 6.4, t) * u)}`,
        delay: at(T.protect + staggerDelay(j, all.length), 'grow'),
      };
    }),
    grad: {
      x1: (q3[0][0] + q3[3][0]) / 2,
      y1: (q3[0][1] + q3[3][1]) / 2 - 30 * u,
      x2: (q3[1][0] + q3[2][0]) / 2,
      y2: (q3[1][1] + q3[2][1]) / 2 + 30 * u,
      /* sparse young rows to the first dense ones: wheat → sprout → green on the ramp */
      stops: ndviStops(0.28, 0.7, 6),
    },
  };

  /* 04 קטיף – near-full canopy; peppers set on both sides of each row, in bands of three rows */
  const q4 = inner[3];
  const o4: RowOpts = { ...down(spec.bend[3]), pad: [side + 2 * u, side + 2 * u] };
  const fr4 = spread(rowCount(q4, o4, 14.6 * u));
  const canopy = rows(q4, fr4, o4);
  const fruitRows = rows(q4, fr4, { ...o4, trim: () => [top + rnd() * 26 * u, end] });
  const bands = Math.ceil(fruitRows.length / 3);
  const fruitDash = () => Array.from({ length: 6 }, () => `0 ${n1(lerp(9, 31, rnd()) * u)}`).join(' ');
  const fruit = (dx: number, start: number) =>
    Array.from({ length: bands }, (_, g) => ({
      d: merge(fruitRows.slice(g * 3, g * 3 + 3), dx),
      dash: fruitDash(),
      delay: at(start + staggerDelay(g, bands), 'pop'),
    }));
  const harvest = {
    canopy: canopy.map((c, j) => ({
      d: d.curve(c),
      w: (9 + (rnd() - 0.5) * 1.6) * u,
      delay: at(T.canopy + staggerDelay(j, canopy.length), 'grow'),
    })),
    red: fruit(2.6 * u, T.fruit),
    yellow: fruit(-2.6 * u, T.fruit + staggerDelay(1, 2)),
    grad: {
      cx: (q4[0][0] + q4[1][0] + q4[2][0] + q4[3][0]) / 4,
      cy: (q4[0][1] + q4[1][1] + q4[2][1] + q4[3][1]) / 4,
      r: dist(q4[0], q4[2]) * 0.6,
      stops: ndviStops(0.84, 0.72, 4),
    },
  };

  /* 05 אריזה – the rows after the harvest, carton pallets at the field edge */
  const q5 = inner[4];
  /* a pallet seen from above: 2 × 3 cartons, tight; aisles between pallets */
  const carton = { w: 12 * u, h: 8 * u };
  const pallet = { w: 2 * carton.w, h: 3 * carton.h };
  const pitch = { x: pallet.w + 5 * u, y: pallet.h + 6 * u };
  const yardW = spec.yard.cols * pitch.x - 5 * u;
  const yardH = spec.yard.rows * pitch.y - 6 * u;
  const leftAt = (y: number) => meet(line(q5[1], q5[2]), line([0, y], [1, y]))[0];
  const bottomAt = (x: number) => meet(line(q5[2], q5[3]), line([x, 0], [x, 1]))[1];
  const yx0 = leftAt(q5[2][1]) + 12 * u;
  const yy1 = Math.min(bottomAt(yx0), bottomAt(yx0 + yardW)) - 12 * u;
  const yard: Box = { x0: yx0, y0: yy1 - yardH, x1: yx0 + yardW, y1: yy1 };
  const m5 = 14 * u;
  const o5: RowOpts = {
    ...across(spec.bend[4]),
    avoid: { x0: yard.x0 - m5, y0: yard.y0 - m5, x1: yard.x1 + m5, y1: yard.y1 + m5 },
    minLen: 40 * u,
  };
  const stubble = rows(q5, spread(rowCount(q5, o5, 10.4 * u)), o5);
  const pallets = Array.from({ length: spec.yard.rows }, (_, r) => {
    let shadow = '';
    let tops = '';
    let lower = '';
    let grid = '';
    for (let c = 0; c < spec.yard.cols; c++) {
      if (spec.yard.skip.includes(r * spec.yard.cols + c)) continue;
      const x = yard.x0 + c * pitch.x + (rnd() - 0.5) * 2.4 * u;
      const y = yard.y0 + r * pitch.y + (rnd() - 0.5) * 2.4 * u;
      /* stack height reads as shadow length (low sun in the south-east) */
      const tall = (2.5 + rnd() * 5) * u;
      shadow += d.rect(x - tall * 0.9, y - tall * 0.7, pallet.w, pallet.h);
      /* some stacks are still being built: the layer below shows through */
      const missing = rnd() < 0.34 ? 1 + Math.floor(rnd() * 3) : 0;
      for (let k = 0; k < 6; k++) {
        const cell = d.rect(x + (k % 2) * carton.w, y + Math.floor(k / 2) * carton.h, carton.w, carton.h);
        if (k < missing) lower += cell;
        else tops += cell;
      }
      grid +=
        d.rect(x, y, pallet.w, pallet.h) +
        d.seg([x + carton.w, y], [x + carton.w, y + pallet.h]) +
        d.seg([x, y + carton.h], [x + pallet.w, y + carton.h]) +
        d.seg([x, y + 2 * carton.h], [x + pallet.w, y + 2 * carton.h]);
    }
    return { shadow, tops, lower, grid, delay: at(T.cartons + staggerDelay(r, spec.yard.rows), 'stack') };
  });
  const pack = {
    stubble: merge(stubble),
    windrows: merge(stubble.filter((_, i) => i % 5 === 2)),
    yard: d.rect(yard.x0 - 8 * u, yard.y0 - 8 * u, yardW + 16 * u, yardH + 14 * u),
    pallets,
  };

  /* ground: tracks with wheel ruts, cadastral vertices, grain */
  const ruts = spec.dividers
    .map(([a, b]) => {
      const len = dist(a, b);
      const off: P = [(-(b[1] - a[1]) / len) * 2.4 * u, ((b[0] - a[0]) / len) * 2.4 * u];
      const neg: P = [-off[0], -off[1]];
      return d.seg(add(a, off), add(b, off)) + d.seg(add(a, neg), add(b, neg));
    })
    .join('');
  const tile = 96 * u;
  let grainDark = '';
  let grainLight = '';
  for (let k = 0; k < 96; k++) {
    const speck = d.dot(rnd() * tile, rnd() * tile);
    if (k % 3 === 0) grainLight += speck;
    else grainDark += speck;
  }

  /* label anchors, as fractions of the drawing (percentages in CSS) */
  const pad = 12 * u;
  const anchors = inner.map((q) => ({
    x: (W - q[0][0]) / W,
    w: (q[0][0] - q[1][0]) / W,
    plateX: (W - q[0][0] + pad) / W,
    plateY: (Math.max(q[0][1], q[1][1]) + pad) / H,
    plateW: (q[0][0] - q[1][0] - 2 * pad) / W,
  }));

  /* scale: one parcel is the demo farm's field, so the mean parcel area is that many dunams */
  const meanArea = inner.reduce((s, q) => s + area(q), 0) / inner.length;
  const metresPerUnit = Math.sqrt((demoFarm.area * 1000) / meanArea);

  return {
    key: spec.key,
    W,
    H,
    u,
    parcels: inner.map((q, i) => ({ d: d.poly(q), fill: TONES[i] })),
    /* terrain is clipped to the fields themselves, so the tracks stay clean */
    fields: inner.map((q) => d.poly(q)).join(''),
    tracks: spec.dividers.map(([a, b]) => d.seg(a, b)).join(''),
    trackWidth: 2 * spec.track + 2 * u,
    ruts,
    vertices: spec.vertices.map((p) => d.cross(p[0], p[1], 4 * u)).join(''),
    mottles: spec.mottles,
    grain: { tile, dark: grainDark, light: grainLight },
    sow,
    irrigate,
    protect,
    harvest,
    pack,
    anchors,
    /** 100 m on the drawing, as a fraction of its width */
    scale100m: 100 / metresPerUnit / W,
    /** when the last mark of the opening has landed */
    ends,
  };
}

type Built = ReturnType<typeof build>;

const WIDE = build(wideSpec);
const NARROW = build(narrowSpec);

/** The opening's full length (ms), computed from the token timeline. */
export const seasonOpeningMs = Math.max(WIDE.ends, NARROW.ends);

/* ───────────────────────────── the ground, as an image ───────────────────────────── */

type Attrs = Record<string, string | number | undefined>;

const tag = (name: string, attrs: Attrs, children = '') => {
  const a = Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}='${v}'`)
    .join('');
  return children ? `<${name}${a}>${children}</${name}>` : `<${name}${a}/>`;
};

/** The static layer as SVG markup (fills from palette tokens), then a compact data URI. */
function groundUri(b: Built) {
  const w = (x: number) => n1(x * b.u);
  const { soil, paper, wheat } = C;
  const defs =
    tag('clipPath', { id: 'f' }, tag('path', { d: b.fields })) +
    tag(
      'radialGradient',
      { id: 'dk' },
      tag('stop', { offset: 0, 'stop-color': soil, 'stop-opacity': 0.55 }) +
        tag('stop', { offset: 1, 'stop-color': soil, 'stop-opacity': 0 }),
    ) +
    tag(
      'radialGradient',
      { id: 'lt' },
      tag('stop', { offset: 0, 'stop-color': paper, 'stop-opacity': 0.09 }) +
        tag('stop', { offset: 1, 'stop-color': paper, 'stop-opacity': 0 }),
    ) +
    tag(
      'pattern',
      { id: 'g', width: n1(b.grain.tile), height: n1(b.grain.tile), patternUnits: 'userSpaceOnUse' },
      tag('path', {
        d: b.grain.dark,
        stroke: soil,
        'stroke-opacity': 0.45,
        'stroke-width': w(1.6),
        'stroke-linecap': 'round',
      }) +
        tag('path', {
          d: b.grain.light,
          stroke: paper,
          'stroke-opacity': 0.07,
          'stroke-width': w(1.2),
          'stroke-linecap': 'round',
        }),
    );

  const body = [
    /* soil, then compacted dirt tracks – paler than the fields – with wheel ruts */
    tag('rect', { width: b.W, height: b.H, fill: soil }),
    tag('path', { d: b.tracks, fill: 'none', stroke: paper, 'stroke-opacity': 0.12, 'stroke-width': n1(b.trackWidth) }),
    tag('path', { d: b.ruts, fill: 'none', stroke: paper, 'stroke-opacity': 0.16, 'stroke-width': w(0.9) }),
    /* the parcels, toned per moment */
    ...b.parcels.map((p) => tag('path', { d: p.d, fill: p.fill })),
    /* terrain: soil variation that crosses parcel lines, and grain */
    tag(
      'g',
      { 'clip-path': 'url(#f)' },
      b.mottles
        .map((m) =>
          tag('ellipse', {
            cx: m.c[0],
            cy: m.c[1],
            rx: m.r[0],
            ry: m.r[1],
            fill: `url(#${m.tone === 'dark' ? 'dk' : 'lt'})`,
          }),
        )
        .join('') + tag('rect', { width: b.W, height: b.H, fill: 'url(#g)' }),
    ),
    /* 01 beds, 02 furrows, 05 stubble and the pallet pad */
    tag(
      'g',
      { fill: 'none', 'stroke-linecap': 'round' },
      tag('path', { d: b.sow.troughs, stroke: soil, 'stroke-opacity': 0.55, 'stroke-width': w(4.6) }) +
        tag('path', { d: b.sow.ridges, stroke: paper, 'stroke-opacity': 0.11, 'stroke-width': w(1.8) }) +
        tag('path', { d: b.irrigate.furrows, stroke: soil, 'stroke-opacity': 0.42, 'stroke-width': w(4.2) }) +
        tag('path', { d: b.pack.windrows, stroke: wheat, 'stroke-opacity': 0.12, 'stroke-width': w(6) }),
    ),
    tag('path', {
      d: b.pack.stubble,
      fill: 'none',
      stroke: wheat,
      'stroke-opacity': 0.5,
      'stroke-width': w(1.4),
      'stroke-dasharray': `${w(1.3)} ${w(3.3)}`,
    }),
    tag('path', { d: b.pack.yard, fill: paper, 'fill-opacity': 0.035 }),
    /* survey: cadastral vertices */
    tag('path', { d: b.vertices, fill: 'none', stroke: paper, 'stroke-opacity': 0.55, 'stroke-width': w(1) }),
  ].join('');

  const svg = tag(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${b.W} ${b.H}`, width: b.W, height: b.H },
    tag('defs', {}, defs) + body,
  );
  return `data:image/svg+xml,${svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}`;
}

const GROUND = { w: groundUri(WIDE), n: groundUri(NARROW) };

/* ───────────────────────────── data & copy ───────────────────────────── */

type Datum = { kind: 'ndvi'; value: number } | { kind: 'qty'; value: number; unit: string };

/** What the field reads at each moment. Quantities come from the demo farm; NDVI is a plausible reading. */
const DATA: Record<StageId, Datum> = {
  sow: { kind: 'ndvi', value: 0.12 },
  irrigate: { kind: 'qty', value: farm.dripMeters, unit: 'מ׳ טפטוף' },
  protect: { kind: 'ndvi', value: 0.46 },
  harvest: { kind: 'ndvi', value: 0.78 },
  pack: { kind: 'qty', value: farm.cartons, unit: 'קרטונים' },
};

/** What each moment shows, for the figure's accessible name. */
const LOOK: Record<StageId, string> = {
  sow: 'ערוגות שתולות ושתילים צעירים לאורכן',
  irrigate: 'שלוחות טפטוף כחולות לאורך הערוגות, עם קו מחלק ומגוף',
  protect: 'חופה צעירה עד צפופה בצבעי מדד הצמחייה',
  harvest: 'חופה כמעט מלאה עם פלפלים אדומים וצהובים',
  pack: 'השורות אחרי הקטיף ומשטחי קרטונים בשולי החלקה',
};

/** Stage colour as a fill on the drawing's own soil, and its ink variant on a light surface. */
const STAGE_COLOR: Record<StageId, { fill: string; ink: string }> = {
  sow: { fill: 'var(--color-sprout)', ink: 'var(--sprout-ink)' },
  irrigate: { fill: 'var(--color-water)', ink: 'var(--water-ink)' },
  protect: { fill: 'var(--color-field)', ink: 'var(--sprout-ink)' },
  harvest: { fill: 'var(--color-harvest)', ink: 'var(--harvest-ink)' },
  pack: { fill: 'var(--color-wheat)', ink: 'var(--wheat-ink)' },
};

/** The farm's own word for each moment: pepper is transplanted, so stage 1 reads שתילה. */
const momentName = (id: StageId, fallback: string) => planLines.find((l) => l.stage === id)?.stageLabel ?? fallback;

const season = stages.map((s, i) => ({
  ...s,
  name: momentName(s.id, s.he),
  num: String(i + 1).padStart(2, '0'),
  datum: DATA[s.id],
}));

const NB = ' ';
const coords = `${demoFarm.coords.lat.toFixed(2)}°N ${demoFarm.coords.lon.toFixed(2)}°E`;
const field = `${demoFarm.area}${NB}דונם ${demoFarm.crop} ב${demoFarm.method} ב${demoFarm.region}`;

const datumText = (d: Datum) =>
  d.kind === 'ndvi' ? `NDVI ${formatNumber(d.value, 2)}` : `${formatNumber(d.value)}${NB}${d.unit}`;

function DatumLine({ d }: { d: Datum }) {
  if (d.kind === 'ndvi') return <Num>NDVI {formatNumber(d.value, 2)}</Num>;
  return (
    <>
      <Num>{formatNumber(d.value)}</Num>
      {NB}
      {d.unit}
    </>
  );
}

function ariaLabel(withData: boolean) {
  const parts = season.map((s) => `${s.num} ${s.name}${NB}– ${LOOK[s.id]}${withData ? `, ${datumText(s.datum)}` : ''}`);
  return `העונה מלמעלה: איור אווירי סכמטי של אותה חלקה, ${field}, בחמישה רגעים של עונה אחת, זה לצד זה לפי סדר העונה. ${parts.join('; ')}.${withData ? ' נתוני דמו.' : ''}`;
}

const vars = (o: Record<string, string>) => o as CSSProperties;
const pct = (f: number) => `${Math.round(f * 10000) / 100}%`;

/* ───────────────────────────── the season layer ───────────────────────────── */

function Season({ b, animate }: { b: Built; animate: boolean }) {
  const id = (k: string) => `sp-${b.key}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;
  const at = (ms: number) => (animate ? vars({ '--d': `${ms}ms` }) : undefined);
  const w = (x: number) => n1(x * b.u);
  const { soil, loam, water, wheat, sprout } = C;

  return (
    <svg
      className={css.season}
      viewBox={`0 0 ${b.W} ${b.H}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient
          id={id('ndvi3')}
          gradientUnits="userSpaceOnUse"
          x1={n1(b.protect.grad.x1)}
          y1={n1(b.protect.grad.y1)}
          x2={n1(b.protect.grad.x2)}
          y2={n1(b.protect.grad.y2)}
        >
          {b.protect.grad.stops.map((s) => (
            <stop key={s.o} offset={n1(s.o)} stopColor={s.c} />
          ))}
        </linearGradient>
        <radialGradient
          id={id('ndvi4')}
          gradientUnits="userSpaceOnUse"
          cx={n1(b.harvest.grad.cx)}
          cy={n1(b.harvest.grad.cy)}
          r={n1(b.harvest.grad.r)}
        >
          {b.harvest.grad.stops.map((s) => (
            <stop key={s.o} offset={n1(s.o)} stopColor={s.c} />
          ))}
        </radialGradient>
      </defs>

      {/* 01 שתילה */}
      <path
        className={css.pop}
        style={at(b.sow.delay)}
        d={b.sow.seedlings}
        fill="none"
        stroke={sprout}
        strokeLinecap="round"
        strokeWidth={w(2.4)}
        strokeDasharray={`0 ${w(22)}`}
      />

      {/* 02 השקיה – the glow is a wide, faint copy of the wet lines (no blur filter) */}
      <g fill="none" strokeLinecap="round" stroke={water}>
        <path
          className={css.glow}
          style={at(b.irrigate.glowDelay)}
          d={b.irrigate.glow}
          strokeOpacity="0.1"
          strokeWidth={w(7)}
        />
        <path
          className={css.glow}
          style={at(b.irrigate.glowDelay)}
          d={b.irrigate.glow}
          strokeOpacity="0.18"
          strokeWidth={w(3.6)}
        />
        <path
          className={css.draw}
          style={at(b.irrigate.mainDelay)}
          pathLength={1}
          d={b.irrigate.main}
          strokeWidth={w(2.2)}
        />
        {b.irrigate.laterals.map((l, j) => (
          <path key={j} className={css.draw} style={at(l.delay)} pathLength={1} d={l.d} strokeWidth={w(1.1)} />
        ))}
        <path
          className={css.fade}
          style={at(b.irrigate.emittersDelay)}
          d={b.irrigate.emitters}
          strokeWidth={w(2.6)}
          strokeDasharray={`0 ${w(16)}`}
          strokeDashoffset={w(8)}
        />
      </g>
      <path d={b.irrigate.valve} fill={soil} stroke={water} strokeWidth={w(1.4)} />

      {/* 03 הגנה */}
      <g fill="none" strokeLinecap="round" stroke={url('ndvi3')}>
        {b.protect.rows.map((r, j) => (
          <path
            key={j}
            className={css.grow}
            style={at(r.delay)}
            d={r.d}
            strokeWidth={n1(r.w)}
            strokeDasharray={r.dash}
          />
        ))}
      </g>

      {/* 04 קטיף */}
      <g fill="none" strokeLinecap="round">
        <g stroke={url('ndvi4')} strokeDasharray={`0 ${w(5)}`}>
          {b.harvest.canopy.map((r, j) => (
            <path key={j} className={css.grow} style={at(r.delay)} d={r.d} strokeWidth={n1(r.w)} />
          ))}
        </g>
        <g stroke={C.harvest} strokeWidth={w(3.8)}>
          {b.harvest.red.map((r, j) => (
            <path key={j} className={css.pop} style={at(r.delay)} d={r.d} strokeDasharray={r.dash} />
          ))}
        </g>
        <g stroke={wheat} strokeWidth={w(3.3)}>
          {b.harvest.yellow.map((r, j) => (
            <path key={j} className={css.pop} style={at(r.delay)} d={r.d} strokeDasharray={r.dash} />
          ))}
        </g>
      </g>

      {/* 05 אריזה */}
      {b.pack.pallets.map((p, r) => (
        <g key={r} className={css.stack} style={at(p.delay)}>
          <path d={p.shadow} fill={soil} fillOpacity="0.6" />
          <path d={p.tops} fill={wheat} />
          <path d={p.lower} fill={wheat} fillOpacity="0.5" />
          <path d={p.grid} fill="none" stroke={loam} strokeOpacity="0.85" strokeWidth={w(0.9)} />
        </g>
      ))}
    </svg>
  );
}

function Scene({ b, animate }: { b: Built; animate: boolean }) {
  return (
    <div className={css.scene}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a data-URI SVG: nothing to optimise */}
      <img className={css.ground} src={GROUND[b.key]} width={b.W} height={b.H} alt="" decoding="async" />
      <Season b={b} animate={animate} />
    </div>
  );
}

/* ───────────────────────────── labels & legend ───────────────────────────── */

const stageVars = (id: StageId) => vars({ '--stage': STAGE_COLOR[id].fill, '--stage-ink': STAGE_COLOR[id].ink });

function WideLabels() {
  return (
    <div className={css.labels}>
      {season.map((s, i) => {
        const a = WIDE.anchors[i];
        return (
          <div
            key={s.id}
            className={css.label}
            style={{ ...vars({ '--x': pct(a.x), '--w': pct(a.w) }), ...stageVars(s.id) }}
          >
            <p className={css.labelHead}>
              <Num className="text-caption text-ink-2">{s.num}</Num>
              <span className="text-lead font-bold">{s.name}</span>
            </p>
            <p className="text-caption text-ink-2">
              <DatumLine d={s.datum} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

function NarrowPlates() {
  return (
    <div className={css.plates} style={vars({ '--img-ink': surfaces.soil.ink, '--img-ink-2': surfaces.soil.ink2 })}>
      {season.map((s, i) => {
        const a = NARROW.anchors[i];
        return (
          <div
            key={s.id}
            className={css.plate}
            style={{
              ...vars({ '--x': pct(a.plateX), '--y': pct(a.plateY), '--w': pct(a.plateW) }),
              ...stageVars(s.id),
            }}
          >
            <p className={css.plateHead}>
              <Num className={cn(css.plateNum, 'text-micro')}>{s.num}</Num>
              <span className="text-caption font-bold">{s.name}</span>
            </p>
            <p className={cn(css.plateData, 'text-micro')}>
              <DatumLine d={s.datum} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

function NorthArrow() {
  return (
    <svg className={css.northIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8 1.5 12.5 14 8 11 3.5 14Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M8 1.5V11L3.5 14Z" fill="currentColor" />
    </svg>
  );
}

function Legend() {
  const marks = season.filter((s) => s.datum.kind === 'ndvi');
  return (
    <div
      className={css.legend}
      aria-hidden="true"
      style={vars({ '--scale-w': `${WIDE.scale100m}`, '--scale-n': `${NARROW.scale100m}` })}
    >
      <div className={css.caption}>
        <p className="text-caption font-bold text-ink">אותה חלקה, חמישה רגעים</p>
        <p className="text-caption text-ink-2">
          <Num>{demoFarm.area}</Num>
          {NB}דונם {demoFarm.crop} ב{demoFarm.method} · עונה אחת, משתילה ועד אריזה
        </p>
        <p className="text-micro text-ink-2">
          {demoFarm.region} · <Num>{demoFarm.branch.km}</Num>
          {NB}ק״מ מ{demoFarm.branch.name} · <Num>{coords}</Num>
        </p>
      </div>
      <div className={css.ndvi}>
        <p className="text-micro text-ink-2">
          מדד צמחייה <Num>NDVI</Num> · מתחת לרשת · מכויל · מאדמה חשופה לחופה מלאה
        </p>
        <div className={css.gauge}>
          {marks.map((s) => (
            <span key={s.id} className={cn(css.mark, 'text-micro')} style={vars({ '--at': pct(s.datum.value) })}>
              <Num>{s.num}</Num>
            </span>
          ))}
          <div className={css.bar} />
        </div>
        <div className={css.ticks}>
          {ndvi.ticks.map((t) => (
            <span key={t} className={cn(css.tick, 'text-micro')} style={vars({ '--at': pct(t) })}>
              <Num>{formatNumber(t, 1)}</Num>
            </span>
          ))}
        </div>
      </div>
      <div className={cn(css.meta, 'text-micro')}>
        <span className={css.scale}>
          <span className={css.scaleBar} />
          <span>
            <Num>100</Num>
            {NB}מ׳
          </span>
        </span>
        <span className={css.north}>
          <NorthArrow />
          צפון
        </span>
        <DemoTag />
      </div>
    </div>
  );
}

/* ───────────────────────────── figure ───────────────────────────── */

export function SeasonParcels({
  className,
  animate = false,
  showLabels = false,
}: {
  className?: string;
  animate?: boolean;
  showLabels?: boolean;
}): ReactNode {
  return (
    <div role="img" aria-label={ariaLabel(showLabels)} className={cn(css.root, animate && css.animate, className)}>
      <div className={css.wide} aria-hidden="true">
        {showLabels ? <WideLabels /> : null}
        <Scene b={WIDE} animate={animate} />
      </div>
      <div className={css.narrow} aria-hidden="true">
        <Scene b={NARROW} animate={animate} />
        {showLabels ? <NarrowPlates /> : null}
      </div>
      {showLabels ? <Legend /> : null}
    </div>
  );
}
