/**
 * עשושית – geometry for the technical line illustration. Pure data, no React.
 *
 * Drawing units ≈ millimetres (the riser is shortened). SVG axes: y grows
 * downward. Every part is drawn around its own vertical axis (x = 0) and its
 * own seat (y = 0, the face it sits on), so the assembled view and the
 * exploded storyboard place the very same parts – only the offsets differ.
 *
 * Projection: an elevation turned a few degrees about the vertical axis, so
 * rings around the lateral pipe read as shallow arcs (front halves bulge
 * toward −x, away from the open end) while the vertical stack stays
 * orthographic. Light comes from the upper left: faces turned right are
 * toned and carry the heavier shade line, as in a patent drawing.
 *
 * The drawing is composed for RTL: the station stands toward inline-start
 * (right) and the jet throws forward, toward inline-end (left).
 */

export type Pt = { x: number; y: number };
export type Box = { x0: number; y0: number; x1: number; y1: number };

/**
 * Paint roles. Ashushit.tsx maps each to a class in its scoped stylesheet:
 * body fills are opaque (they hide the dot grid and anything behind), tones
 * are currentColor mixed into the body fill, strokes never scale.
 */
export type Paint =
  | 'fill' // opaque body
  | 'tone1' // light shade (grey nut, lit faces)
  | 'tone2' // mid shade (faces turned away)
  | 'tone3' // dark (rubber seals)
  | 'water' // water seen in the pipe bore
  | 'dot' // leader terminal: zero-length round-capped stroke, constant size
  | 'line' // main outline
  | 'fine' // detail: threads, ribs, shading
  | 'shade' // heavier edge on the shadow side
  | 'center' // centre line, dash-dot
  | 'hidden' // hidden edge, short dashes
  | 'axis' // exploded assembly axis
  | 'jet' // the water jet, dashed water blue
  | 'drop' // a drop breaking off the jet
  | 'dropSm' // a smaller drop
  | 'splash' // where the jet lands
  | 'cue' // assembly-direction chevrons on the exploded axis
  | 'leader'; // callout leader

export type Shape = { d: string; paint: Paint[] };

export type PartId = 'stabilizer' | 'coupling' | 'thread' | 'nut' | 'ring' | 'clamp' | 'riser' | 'sprinkler';

export type Part = {
  shapes: Shape[];
  /** extents in part coordinates (also the Stage-1 storyboard's part bounds) */
  box: Box;
  /**
   * Where a callout leader lands, in part coordinates (SVG x is physical):
   * on the −x side (balloons at inline-end, exploded) and the +x side
   * (balloons at inline-start, assembled).
   */
  anchors: { minX: Pt; maxX: Pt };
};

/** 'card' thins the detail (fewer ribs, coarser threads) for small drawings. */
export type Detail = 'full' | 'card';

/* ───────────────────────────── path helpers ───────────────────────────── */

const rnd = (v: number) => {
  const x = Math.round(v * 100) / 100;
  return Object.is(x, -0) ? 0 : x;
};

/** Join path tokens; numbers are rounded to 0.01. */
export function path(...tokens: Array<string | number>) {
  return tokens.map((t) => (typeof t === 'number' ? rnd(t) : t)).join(' ');
}

const sh = (d: string, ...paint: Paint[]): Shape => ({ d, paint });

const deg = (a: number) => (a * Math.PI) / 180;

function roundRect(x0: number, y0: number, x1: number, y1: number, r: number) {
  return path(
    'M', x0 + r, y0, 'H', x1 - r, 'Q', x1, y0, x1, y0 + r, 'V', y1 - r, 'Q', x1, y1, x1 - r, y1,
    'H', x0 + r, 'Q', x0, y1, x0, y1 - r, 'V', y0 + r, 'Q', x0, y0, x0 + r, y0, 'Z',
  );
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return path('M', cx - rx, cy, 'A', rx, ry, 0, 1, 0, cx + rx, cy, 'A', rx, ry, 0, 1, 0, cx - rx, cy, 'Z');
}

function poly(pts: Pt[], close = true) {
  return path(...pts.flatMap((p, i) => [i === 0 ? 'M' : 'L', p.x, p.y]), ...(close ? ['Z'] : []));
}

/* ───────────────────────────── dimensions ───────────────────────────── */

/** Ellipse ratio of rings around the lateral pipe (sine of the turn). */
const K = 0.12;

export const dims = {
  pipeR: 25, // Ø50 PE / PVC, 2״ aluminium
  boreR: 21.5,
  sleeveR: 31,
  sleeveHalf: 64,
  sealR: 28,
  sealLen: 6,
  bandR: 33,
  bandW: 7,
  bands: [-52, -37, 37, 52],
  bossR: 15,
  bossTop: -43, // pipe frame
  hexR: 16, // nipple hex, across-corner radius
  threadMaj: 13.2, // 3/4״ BSP ≈ 26.4 mm
  threadMin: 11.4,
  pitch: 3.6, // drawn coarser than the real 1.81 mm so it reads
  nutR: 21,
  nutH: 22,
  ringR: 18,
  ringH: 4,
  clampR: 19,
  clampH: 12,
  riserR: 15, // across-corner radius of the hex riser
  stabTop: 31, // pipe frame – the cradle meets the sleeve
  ground: 63, // pipe frame
  sprinklerH: 106,
} as const;

/* ───────────────────────────── primitives ───────────────────────────── */

/** x of a ring's front arc (radius r, at x) at height y. */
function ringArcX(x: number, r: number, y: number) {
  const t = Math.min(1, Math.abs(y) / r);
  return x - K * r * Math.sqrt(1 - t * t);
}

/** Front half of a ring around the pipe axis: (x,−r) → (x,r), bulging toward −x. */
function ringArc(x: number, r: number) {
  return path('M', x, -r, 'A', K * r, r, 0, 0, 0, x, r);
}

/** Short cylinder around the pipe axis between x0 and x1, both ends drawn as front arcs. */
function band(x0: number, x1: number, r: number) {
  return path('M', x0, -r, 'H', x1, 'A', K * r, r, 0, 0, 0, x1, r, 'H', x0, 'A', K * r, r, 0, 0, 1, x0, -r, 'Z');
}

/**
 * Hex prism in elevation, seen across the corners: three faces, the middle
 * one square to the viewer. `ch` chamfers an end like a nut – the shallow
 * arc on every face is the signature of a well-drawn nut.
 */
function hexPrism(top: number, bottom: number, rc: number, { ch = 0, detail = 'full' as Detail } = {}): Shape[] {
  const h = rc / 2;
  const q = rc * 0.75; // projected centre of a side face
  const tTop = top + ch;
  const tBot = bottom - ch;
  const faceFill = (xa: number, xb: number, xm: number) =>
    path(
      'M', xa, tTop,
      ...(ch ? ['Q', xm, top - ch, xb, tTop] : ['L', xb, top]),
      'L', xb, tBot,
      ...(ch ? ['Q', xm, bottom + ch, xa, tBot] : ['L', xa, bottom]),
      'Z',
    );
  const out: Shape[] = [sh(faceFill(-rc, -h, -q), 'tone1'), sh(faceFill(-h, h, 0), 'fill'), sh(faceFill(h, rc, q), 'tone2')];
  const e = (rc - q) * 0.2;
  out.push(
    sh(
      ch
        ? path(
            'M', -rc, tTop, 'Q', -rc + e, top, -q, top, 'H', q, 'Q', rc - e, top, rc, tTop,
            'V', tBot, 'Q', rc - e, bottom, q, bottom, 'H', -q, 'Q', -rc + e, bottom, -rc, tBot, 'Z',
          )
        : path('M', -rc, top, 'H', rc, 'V', bottom, 'H', -rc, 'Z'),
      'line',
    ),
  );
  out.push(sh(path('M', -h, tTop, 'V', tBot, 'M', h, tTop, 'V', tBot), detail === 'card' ? 'fine' : 'line'));
  if (ch) {
    const arcs = (y0: number, y1: number, apex: number) =>
      path(
        'M', -h, y1, 'Q', 0, 2 * apex - y1, h, y1,
        'M', -q, y0, 'Q', -h - (q - h) * 0.3, y0, -h, y1,
        'M', q, y0, 'Q', h + (q - h) * 0.3, y0, h, y1,
      );
    out.push(sh(arcs(top, tTop, top) + ' ' + arcs(bottom, tBot, bottom), 'fine'));
  }
  out.push(sh(path('M', rc, tTop, 'V', tBot), 'shade'));
  return out;
}

/**
 * External thread between `top` and `bottom` (top < bottom): sawtooth flanks
 * offset by half a pitch and joined by slanted crest lines – the detailed
 * convention, coarsened so it survives small sizes.
 */
function thread(top: number, bottom: number, detail: Detail = 'full'): Shape[] {
  const { threadMaj: R, threadMin: r } = dims;
  const p = detail === 'card' ? dims.pitch * 1.35 : dims.pitch;
  const ys: number[] = [];
  for (let y = bottom; y > top + 0.01; y -= p / 2) ys.push(y);
  ys.push(top);
  const last = ys.length - 1;
  // k odd → left crest; k even (k > 0, k < last) → right crest
  const left = ys.map((y, k) => ({ x: k % 2 === 1 && k < last ? -R : -r, y }));
  const right = ys.map((y, k) => ({ x: k % 2 === 0 && k > 0 && k < last ? R : r, y }));
  const out: Shape[] = [sh(poly([...left, ...right.slice().reverse()]), 'fill', 'line')];
  const lines: string[] = [];
  for (let k = 1; k + 1 <= last; k += 2) {
    if (left[k].x === -R && right[k + 1].x === R) lines.push(path('M', -R, ys[k], 'L', R, ys[k + 1]));
    if (detail === 'full' && k + 2 <= last && right[k + 2]) {
      lines.push(path('M', -r, ys[k + 1], 'L', r, ys[k + 2]));
    }
  }
  if (lines.length) out.push(sh(lines.join(' '), 'fine'));
  return out;
}

/* ───────────────────────────── scene ───────────────────────────── */

/** The lateral the station clamps onto. Pipe frame: centre (0, 0); open end at +x. */
export function pipe(left: number, right: number, detail: Detail = 'full'): Shape[] {
  const { pipeR: R, boreR } = dims;
  const out: Shape[] = [
    sh(path('M', -left, -R, 'H', right, 'A', K * R, R, 0, 0, 1, right, R, 'H', -left, 'A', K * R, R, 0, 0, 1, -left, -R, 'Z'), 'fill', 'line'),
  ];
  const lines = detail === 'full' ? [32, 47, 60] : [36, 54];
  out.push(
    sh(
      lines
        .map((a) => {
          const y = R * Math.cos(deg(a));
          return path('M', ringArcX(-left, R, y) + 2, y, 'H', ringArcX(right, R, y) - 2);
        })
        .join(' '),
      'fine',
    ),
  );
  out.push(sh(ringArc(right, R), 'line'));
  out.push(sh(ellipse(right, 0, K * boreR, boreR), 'water', 'fine'));
  out.push(sh(path('M', -left, R, 'H', right), 'shade'));
  return out;
}

export function ground(x0: number, x1: number, y: number, hatch: [number, number] | null): Shape[] {
  const out: Shape[] = [sh(path('M', x0, y, 'H', x1), 'line')];
  if (hatch) {
    const segs: string[] = [];
    for (let x = hatch[0]; x <= hatch[1]; x += 7) segs.push(path('M', x, y + 2, 'l', -5, 5));
    out.push(sh(segs.join(' '), 'fine'));
  }
  return out;
}

/* ───────────────────────────── the eight parts ───────────────────────────── */

/**
 * 1 · מייצב – the cradle foot the lateral sits in: a wide moulded stance,
 * staked at both toes, so the pipe cannot roll and the riser stays plumb.
 * Pipe frame (top = sleeve underside).
 */
export function stabilizer(detail: Detail = 'full'): Part {
  const t = dims.stabTop;
  const g = dims.ground;
  const out: Shape[] = [];
  const body = path(
    'M', -46, t, 'H', 46,
    'L', 67, g - 6, 'H', 74, 'Q', 77, g - 6, 77, g - 3, 'V', g,
    'H', 53,
    'L', 37, t + 13,
    'A', 37, 7.5, 0, 0, 0, -37, t + 13,
    'L', -53, g,
    'H', -77, 'V', g - 3, 'Q', -77, g - 6, -74, g - 6, 'H', -67,
    'Z',
  );
  out.push(sh(body, 'fill', 'line'));
  // cradle lip; moulded rib along each leg
  out.push(sh(path('M', -45, t + 4, 'H', 45), 'fine'));
  if (detail === 'full') out.push(sh(path('M', 43, t + 8, 'L', 59.5, g - 6, 'M', -43, t + 8, 'L', -59.5, g - 6), 'fine'));
  // stake heads on the toes, the stakes below grade as hidden lines
  for (const x of [-71, 71]) {
    out.push(sh(roundRect(x - 2.6, g - 9, x + 2.6, g - 6, 0.8), 'tone2', 'line'));
    out.push(sh(path('M', x, g + 2, 'V', g + 17), 'hidden'));
  }
  out.push(sh(path('M', 46, t, 'L', 67, g - 6), 'shade'));
  return {
    shapes: out,
    box: { x0: -77, y0: t, x1: 77, y1: g + 17 },
    anchors: { minX: { x: -60, y: t + 20 }, maxX: { x: 60, y: t + 20 } },
  };
}

/**
 * 2 · מחבר – the coupling: a sleeve that seals onto the lateral with two
 * rubber seals and locks with four band clamps; the outlet socket on top.
 * Pipe frame.
 */
export function coupling(detail: Detail = 'full'): Part {
  const { sleeveR: RS, sleeveHalf: SL, sealR: RE, sealLen, bandR: RB, bandW, bands, bossR: rb, bossTop } = dims;
  const out: Shape[] = [];
  // seals first; the sleeve covers their inner ends
  out.push(sh(path('M', -SL + 2, -RE, 'H', -SL - sealLen, 'A', K * RE, RE, 0, 0, 0, -SL - sealLen, RE, 'H', -SL + 2, 'Z'), 'tone3', 'line'));
  out.push(sh(path('M', SL - 2, -RE, 'H', SL + sealLen, 'A', K * RE, RE, 0, 0, 0, SL + sealLen, RE, 'H', SL - 2, 'Z'), 'tone3', 'line'));
  out.push(sh(band(-SL, SL, RS), 'fill', 'line'));
  const shadeAt = detail === 'full' ? [30, 46] : [40];
  out.push(
    sh(
      shadeAt
        .map((a) => {
          const y = RS * Math.cos(deg(a));
          return path('M', ringArcX(-SL, RS, y) + 2, y, 'H', ringArcX(SL, RS, y) - 2);
        })
        .join(' '),
      'fine',
    ),
  );
  out.push(sh(path('M', -SL, RS, 'H', SL), 'shade'));
  // four band clamps, each with its tightening lug on top
  for (const b of bands) {
    out.push(sh(band(b - bandW / 2, b + bandW / 2, RB), 'tone1', 'line'));
    out.push(
      sh(path('M', b - 4, -RB, 'V', -RB - 3.5, 'Q', b - 4, -RB - 5, b - 2.5, -RB - 5, 'H', b + 2.5, 'Q', b + 4, -RB - 5, b + 4, -RB - 3.5, 'V', -RB, 'Z'), 'fill', 'line'),
    );
    if (detail === 'full') out.push(sh(path('M', b - 2, -RB - 2.5, 'H', b + 2), 'fine'));
  }
  // outlet socket, filleted into the sleeve
  const f = 3;
  const socket = ['M', -rb - f, -RS, 'Q', -rb, -RS, -rb, -RS - f, 'V', bossTop + 1.5, 'L', -rb + 1.5, bossTop, 'H', rb - 1.5, 'L', rb, bossTop + 1.5, 'V', -RS - f, 'Q', rb, -RS, rb + f, -RS] as const;
  out.push(sh(path(...socket, 'V', -RS + 1.4, 'H', -rb - f, 'Z'), 'fill'));
  out.push(sh(path(...socket), 'line'));
  out.push(sh(path('M', -rb, bossTop + 1.5, 'H', rb), 'fine'));
  if (detail === 'full') out.push(sh(path('M', rb * Math.sin(deg(62)), -RS - 3, 'V', bossTop + 2.5), 'fine'));
  out.push(sh(path('M', rb, -RS - f, 'V', bossTop + 1.5), 'shade'));
  return {
    shapes: out,
    box: { x0: -SL - sealLen - K * RE, y0: bossTop, x1: SL + sealLen, y1: RB },
    anchors: { minX: { x: -56, y: -RB - 2.5 }, maxX: { x: 56, y: -RB - 2.5 } },
  };
}

/** 3 · הברגה 3/4״ – a hex nipple. Seat (y = 0) = underside of the hex. */
export function nipple({ lower = true, detail = 'full' as Detail } = {}): Part {
  const out: Shape[] = [];
  if (lower) out.push(...thread(0, 12, detail));
  out.push(...hexPrism(-8, 0, dims.hexR, { ch: 1.6, detail }));
  out.push(...thread(-22, -8, detail));
  return {
    shapes: out,
    box: { x0: -dims.hexR, y0: -22, x1: dims.hexR, y1: lower ? 12 : 0 },
    anchors: { minX: { x: -dims.hexR, y: -4 }, maxX: { x: dims.hexR, y: -4 } },
  };
}

/** 4 · אום אפור – round union nut with grip ribs. Seat = its underside. */
export function nut({ hidden = false, detail = 'full' as Detail } = {}): Part {
  const { nutR: R, nutH: H } = dims;
  const c = 2;
  const out: Shape[] = [
    sh(path('M', -R, -c, 'L', -R + c, 0, 'H', R - c, 'L', R, -c, 'V', -H + c, 'L', R - c, -H, 'H', -R + c, 'L', -R, -H + c, 'Z'), 'tone1', 'line'),
    sh(path('M', -R, -c, 'H', R, 'M', -R, -H + c, 'H', R), 'fine'),
  ];
  const step = detail === 'full' ? 15 : 22.5;
  const ribs: string[] = [];
  for (let a = -90 + step; a < 90 - 0.01; a += step) ribs.push(path('M', R * Math.sin(deg(a)), -H + c + 2.5, 'V', -c - 2.5));
  out.push(sh(ribs.join(' '), 'fine'));
  if (hidden) out.push(sh(path('M', -dims.threadMaj, -1.5, 'V', -H + 1.5, 'M', dims.threadMaj, -1.5, 'V', -H + 1.5), 'hidden'));
  out.push(sh(path('M', R, -c, 'V', -H + c), 'shade'));
  return {
    shapes: out,
    box: { x0: -R, y0: -H, x1: R, y1: 0 },
    anchors: { minX: { x: -R, y: -H / 2 }, maxX: { x: R, y: -H / 2 } },
  };
}

/** 5 · טבעת לבנה – a flat white ring. */
export function ring(): Part {
  const { ringR: R, ringH: H } = dims;
  return {
    shapes: [sh(roundRect(-R, -H, R, 0, 1.5), 'fill', 'line')],
    box: { x0: -R, y0: -H, x1: R, y1: 0 },
    anchors: { minX: { x: -R, y: -H / 2 }, maxX: { x: R, y: -H / 2 } },
  };
}

/** 6 · תפס סגירה – split collar with a bolted lug. */
export function clamp(detail: Detail = 'full'): Part {
  const { clampR: R, clampH: H } = dims;
  const out: Shape[] = [
    sh(path('M', R - 2, -H + 1.5, 'H', R + 7.5, 'Q', R + 9, -H + 1.5, R + 9, -H + 3, 'V', -3, 'Q', R + 9, -1.5, R + 7.5, -1.5, 'H', R - 2, 'Z'), 'fill', 'line'),
  ];
  const hx = R + 4.6;
  const hy = -H / 2;
  out.push(sh(poly(Array.from({ length: 6 }, (_, i) => ({ x: hx + 2.6 * Math.cos(deg(60 * i)), y: hy + 2.6 * Math.sin(deg(60 * i)) }))), 'tone2', 'fine'));
  out.push(sh(roundRect(-R, -H, R, 0, 2), 'fill', 'line'));
  if (detail === 'full') out.push(sh(path('M', -R, -2.5, 'H', R, 'M', -R, -H + 2.5, 'H', R), 'fine'));
  out.push(sh(path('M', R, -H + 2, 'V', -2), 'shade'));
  return {
    shapes: out,
    box: { x0: -R, y0: -H, x1: R + 9, y1: 0 },
    anchors: { minX: { x: -R, y: -H / 2 }, maxX: { x: R + 9, y: -H / 2 } },
  };
}

/** Zigzag break line across a hex bar at y. */
function breakEdge(y: number, rc: number): Pt[] {
  const a = 2;
  return [
    { x: -rc, y },
    { x: -rc / 2, y: y - a },
    { x: rc / 2, y: y + a },
    { x: rc, y },
  ];
}

function prismSegment(top: number, bottom: number, rc: number, { breakTop = false, breakBottom = false, detail = 'full' as Detail } = {}): Shape[] {
  const h = rc / 2;
  const flat = (y: number): Pt[] => [{ x: -rc, y }, { x: -h, y }, { x: h, y }, { x: rc, y }];
  const tE = breakTop ? breakEdge(top, rc) : flat(top);
  const bE = breakBottom ? breakEdge(bottom, rc) : flat(bottom);
  const face = (i: number, paint: Paint) => sh(poly([tE[i], tE[i + 1], bE[i + 1], bE[i]]), paint);
  const out: Shape[] = [face(0, 'tone1'), face(1, 'fill'), face(2, 'tone2')];
  out.push(sh(poly([...tE, ...bE.slice().reverse()]), 'line'));
  out.push(sh(path('M', tE[1].x, tE[1].y, 'L', bE[1].x, bE[1].y, 'M', tE[2].x, tE[2].y, 'L', bE[2].x, bE[2].y), detail === 'card' ? 'fine' : 'line'));
  if (detail === 'full' && bottom - top > 24) {
    const x = -rc * 0.78; // a streak of reflected light on the lit face
    out.push(sh(path('M', x, top + 7, 'L', x, bottom - 7), 'fine'));
  }
  out.push(sh(path('M', rc, tE[3].y, 'L', rc, bE[3].y), 'shade'));
  return out;
}

/** Spigot ends of the riser (exploded view only), with a thread hint. */
function spigot(top: number, bottom: number, detail: Detail): Shape[] {
  const r = 12;
  const out: Shape[] = [
    sh(path('M', -r, top + 1, 'L', -r + 1, top, 'H', r - 1, 'L', r, top + 1, 'V', bottom - 1, 'L', r - 1, bottom, 'H', -r + 1, 'L', -r, bottom - 1, 'Z'), 'fill', 'line'),
  ];
  const step = detail === 'full' ? 2.4 : 3.4;
  const lines: string[] = [];
  for (let y = top + 2.6; y < bottom - 1; y += step) lines.push(path('M', -r, y, 'L', r, y - 1.2));
  out.push(sh(lines.join(' '), 'fine'));
  return out;
}

/**
 * 7 · מגבה משושה שחור UV 3/4״ – the long hex riser. Seat = its foot.
 * `breakAt` (distance from the foot) interrupts it with a conventional
 * break, honest about a riser much longer than drawn.
 */
export function riser(len: number, { ends = false, breakAt = 0, detail = 'full' as Detail } = {}): Part {
  const rc = dims.riserR;
  const out: Shape[] = [];
  if (ends) {
    out.push(...spigot(-len - 9, -len + 0.5, detail));
    out.push(...spigot(-0.5, 9, detail));
  }
  if (breakAt > 0) {
    const gap = 5;
    out.push(...prismSegment(-len, -breakAt - gap / 2, rc, { breakBottom: true, detail }));
    out.push(...prismSegment(-breakAt + gap / 2, 0, rc, { breakTop: true, detail }));
  } else {
    out.push(...prismSegment(-len, 0, rc, { detail }));
  }
  const y = -len * (breakAt > 0 ? 0.78 : 0.6);
  return {
    shapes: out,
    box: { x0: -rc, y0: ends ? -len - 9 : -len, x1: rc, y1: ends ? 9 : 0 },
    anchors: { minX: { x: -rc, y }, maxX: { x: rc, y } },
  };
}

/* ─── 8 · ממטיר AR044 – impact sprinkler ─── */

/** Trajectory angle of the nozzle, degrees above horizontal, thrown toward −x (forward in RTL). */
const NOZZLE_DEG = 25;

export type SprinklerPart = Part & { nozzle: Pt; dir: Pt };

export function sprinkler(detail: Detail = 'full'): SprinklerPart {
  const out: Shape[] = [];
  const a = deg(NOZZLE_DEG);
  const d = { x: -Math.cos(a), y: -Math.sin(a) }; // along the barrel, toward the nozzle
  const up = { x: Math.sin(a), y: -Math.cos(a) }; // the barrel's upper side
  const at = (o: Pt, t: number, r: number): Pt => ({ x: o.x + t * d.x + r * up.x, y: o.y + t * d.y + r * up.y });

  // bearing nut on the riser thread, washer, bearing sleeve
  out.push(...hexPrism(-12, 0, 16.5, { ch: 1.6, detail }));
  out.push(sh(roundRect(-12, -14.5, 12, -12, 1), 'fill', 'line'));
  out.push(sh(path('M', -8.5, -14.5, 'V', -26.5, 'H', 8.5, 'V', -14.5, 'Z'), 'fill', 'line'));
  if (detail === 'full') out.push(sh(path('M', -8.5, -20.5, 'H', 8.5, 'M', 6.8, -15.5, 'V', -25.5), 'fine'));

  // arm post, behind body and arm
  out.push(sh(path('M', -3, -50, 'V', -98, 'H', 3, 'V', -50, 'Z'), 'fill', 'line'));

  // body: a casting that turns the flow from the bearing into the barrel
  const B0 = { x: 0, y: -44 };
  const rb = 7.4;
  const lb = 40;
  const ln = 13;
  const B1 = at(B0, lb, 0);
  const T = at(B0, lb + ln, 0);
  const upper0 = at(B0, 0, rb);
  const upper1 = at(B0, lb, rb);
  const lower1 = at(B0, lb, -rb);
  const lower0 = at(B0, 0, -rb);
  const tMeet = (-11 - lower0.x) / d.x;
  const meet = { x: -11, y: lower0.y + tMeet * d.y };
  out.push(
    sh(
      path(
        'M', -11, -26.5,
        'V', meet.y + 2.6,
        'Q', -11, meet.y, -11 + 2.6 * d.x, meet.y + 2.6 * d.y,
        'L', lower1.x, lower1.y,
        'L', upper1.x, upper1.y,
        'L', upper0.x, upper0.y,
        'C', upper0.x - 5 * d.x, upper0.y - 5 * d.y, 11, -49.5, 11, -44.5,
        'V', -26.5,
        'Z',
      ),
      'fill', 'line',
    ),
  );
  if (detail === 'full') {
    const s0 = at(B0, 13, rb * 0.5);
    const s1 = at(B0, lb - 7, rb * 0.5);
    const u0 = at(B0, 13, -rb * 0.55);
    const u1 = at(B0, lb - 7, -rb * 0.55);
    out.push(sh(path('M', s0.x, s0.y, 'L', s1.x, s1.y, 'M', u0.x, u0.y, 'L', u1.x, u1.y), 'fine'));
  }
  out.push(sh(path('M', 11, -44.5, 'V', -26.5), 'shade'));
  // collar where the nozzle screws in
  out.push(sh(poly([at(B0, lb - 6, -8.3), at(B0, lb - 6, 8.3), at(B0, lb, 8.3), at(B0, lb, -8.3)]), 'tone1', 'line'));
  // nozzle: tapered, stepped down, with its orifice
  out.push(sh(poly([at(B1, 0, -6), at(B1, 0, 6), at(B1, ln, 4.3), at(B1, ln, -4.3)]), 'fill', 'line'));
  const orifice = Array.from({ length: 28 }, (_, i) => {
    const th = (i / 28) * Math.PI * 2;
    return at(T, 1.4 * Math.cos(th), 4.3 * Math.sin(th));
  });
  out.push(sh(poly(orifice), 'tone2', 'fine'));

  // back arm and its counterweight
  out.push(sh(path('M', 7.5, -83.6, 'H', 32, 'V', -78.8, 'H', 7.5, 'Z'), 'fill', 'line'));
  out.push(sh(roundRect(28, -87.5, 45, -73.5, 3.5), 'tone1', 'line'));
  if (detail === 'full') out.push(sh(path('M', 28, -80.5, 'H', 45), 'fine'));
  out.push(sh(path('M', 45, -84.5, 'V', -76.5), 'shade'));
  // forward arm, low over the barrel, ending in the spoon: a crescent vane
  // hanging just ahead of the orifice, its concave face turned to the stream
  out.push(
    sh(
      path(
        'M', -7.5, -83.6,
        'Q', -28, -84.6, -46, -82.8,
        'C', -54, -82, -60.6, -79, -59.7, -75.2,
        'Q', -59.3, -72.6, -56.9, -72.7,
        'Q', -55.4, -72.8, -55.9, -74.5,
        'C', -56.7, -77.1, -52.7, -78.5, -46.2, -78.5,
        'Q', -28, -79.6, -7.5, -78.8,
        'Z',
      ),
      'fill', 'line',
    ),
  );
  out.push(sh(roundRect(-7.5, -86.5, 7.5, -76, 2), 'fill', 'line'));
  if (detail === 'full') out.push(sh(path('M', -7.5, -81.25, 'H', 7.5), 'fine'));

  // spring over the pivot, its cap and the top bearing
  const turns = detail === 'full' ? 7 : 5;
  const coil: Pt[] = Array.from({ length: turns + 1 }, (_, i) => ({ x: i % 2 === 0 ? -5 : 5, y: -87 - (i * 10) / turns }));
  out.push(sh(poly(coil, false), 'fine'));
  out.push(sh(roundRect(-8.5, -101, 8.5, -97, 1.5), 'fill', 'line'));
  out.push(sh(path('M', -4.2, -101, 'Q', -4.2, -106, 0, -106, 'Q', 4.2, -106, 4.2, -101, 'Z'), 'fill', 'line'));

  return {
    shapes: out,
    box: { x0: -60, y0: -106, x1: 45, y1: 0 },
    anchors: { minX: { x: -59.6, y: -76.5 }, maxX: { x: 45, y: -80.5 } },
    nozzle: T,
    dir: d,
  };
}

/* ───────────────────────────── layouts ───────────────────────────── */

export type Placed = { id: PartId | 'pipe' | 'ground'; shapes: Shape[]; dy: number };
/** A balloon: its centre in viewBox units, or `edge` – flush with inline-start at height dot.y. */
export type Callout = { n: number; dot: Pt; edge?: boolean };

/**
 * A composition: a viewBox, a frame (the pipe frame mapped into the viewBox
 * by translate + uniform scale – strokes don't scale), the parts placed in
 * the frame, and callout dots in viewBox units (rendered as HTML).
 */
export type Layout = {
  w: number;
  h: number;
  frame: { x: number; y: number; k: number };
  under: Shape[];
  parts: Placed[];
  over: Shape[];
  callouts: Callout[];
};

/** Seats of the assembled stack, pipe frame. */
function stack(riserLen: number) {
  const nippleSeat = dims.bossTop;
  const nutSeat = nippleSeat - 11;
  const ringSeat = nutSeat - dims.nutH;
  const clampSeat = ringSeat - dims.ringH;
  const riserSeat = clampSeat - dims.clampH;
  const sprinklerSeat = riserSeat - riserLen;
  return { nippleSeat, nutSeat, ringSeat, clampSeat, riserSeat, sprinklerSeat, top: sprinklerSeat - dims.sprinklerH };
}

/**
 * The jet: leaves the nozzle along its axis (past the spoon) and falls to
 * `land`; a close-in spray peels off below it.
 */
function jet(nozzle: Pt, dir: Pt, reach: number, land: Pt, detail: Detail): Shape[] {
  const p0 = { x: nozzle.x + dir.x * 1.5, y: nozzle.y + dir.y * 1.5 };
  const c = { x: nozzle.x + dir.x * reach, y: nozzle.y + dir.y * reach };
  const q = (t: number): Pt => ({
    x: (1 - t) ** 2 * p0.x + 2 * t * (1 - t) * c.x + t * t * land.x,
    y: (1 - t) ** 2 * p0.y + 2 * t * (1 - t) * c.y + t * t * land.y,
  });
  // the coherent stream: the quadratic up to `split` (de Casteljau)…
  const split = 0.62;
  const c1 = { x: p0.x + split * (c.x - p0.x), y: p0.y + split * (c.y - p0.y) };
  const e = q(split);
  const out: Shape[] = [sh(path('M', p0.x, p0.y, 'Q', c1.x, c1.y, e.x, e.y), 'jet')];
  // …then it breaks into drops, thinning out as they fall, and lands
  const drops = detail === 'full' ? [0.665, 0.715, 0.765, 0.815, 0.86, 0.9, 0.935, 0.965] : [0.67, 0.735, 0.8, 0.86, 0.915, 0.96];
  const half = Math.ceil(drops.length / 2);
  out.push(sh(drops.slice(0, half).map((t) => path('M', q(t).x, q(t).y, 'h', 0)).join(' '), 'drop'));
  out.push(sh(drops.slice(half).map((t) => path('M', q(t).x, q(t).y, 'h', 0)).join(' '), 'dropSm'));
  const sp = detail === 'full' ? 1 : 1.25;
  out.push(sh(path('M', land.x - 1.5 * sp, land.y - 2.5 * sp, 'l', -3.5 * sp, -4 * sp, 'M', land.x + 1.5 * sp, land.y - 2.5 * sp, 'l', 3.5 * sp, -4 * sp, 'M', land.x, land.y - 3 * sp, 'v', -5 * sp), 'splash'));
  return out;
}

/** Leader polyline from a part to its balloon (the balloon covers the end), with a dot on the part. */
function leader(pts: Pt[]): Shape[] {
  return [sh(poly(pts, false), 'leader'), sh(path('M', pts[0].x, pts[0].y, 'h', 0), 'dot')];
}

/**
 * 1-D label spreading: keep each label close to its anchor while holding a
 * minimum gap; stays inside [lo, hi].
 */
function spread(ys: number[], minGap: number, lo: number, hi: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((p, q) => p.y - q.y);
  const pos = order.map((o) => o.y);
  for (let iter = 0; iter < 60; iter++) {
    for (let k = 1; k < pos.length; k++) {
      if (pos[k] - pos[k - 1] < minGap) {
        const mid = (pos[k] + pos[k - 1]) / 2;
        pos[k - 1] = mid - minGap / 2;
        pos[k] = mid + minGap / 2;
      }
    }
    if (pos[0] < lo) pos[0] = lo;
    if (pos[pos.length - 1] > hi) pos[pos.length - 1] = hi;
  }
  const out = new Array<number>(ys.length);
  order.forEach((o, k) => (out[o.i] = pos[k]));
  return out;
}

type Built = { stab: Part; coup: Part; nip: Part; nt: Part; rg: Part; cl: Part; rs: Part; spr: SprinklerPart };

function build(riserLen: number, detail: Detail, opts: { exploded: boolean; breakAt: number }): Built {
  return {
    stab: stabilizer(detail),
    coup: coupling(detail),
    nip: nipple({ lower: opts.exploded, detail }),
    nt: nut({ hidden: opts.exploded, detail }),
    rg: ring(),
    cl: clamp(detail),
    rs: riser(riserLen, { ends: opts.exploded, breakAt: opts.breakAt, detail }),
    spr: sprinkler(detail),
  };
}

/** Balloon pitch in drawing units: clears two 20px dots at the narrowest bench width. */
const PITCH = 40;

/**
 * Assembled station.
 *
 * With labels it is a parts drawing: balloons in one column at inline-start
 * (right), evenly pitched. Parts with room (stabilizer, coupling, riser,
 * sprinkler) take horizontal leaders; the tight cluster above the coupling
 * (thread, nut, ring, clamp) leaves on short stubs and fans up in order, so
 * no two leaders can cross.
 *
 * Without labels it is a 4:3 product-card composition: riser shortened with
 * a break, scaled to fit, the jet landing on the ground line.
 */
export function assembledLayout({ labels }: { labels: boolean }): Layout {
  const detail: Detail = labels ? 'full' : 'card';
  const riserLen = labels ? 160 : 96;
  const st = stack(riserLen);
  const b = build(riserLen, detail, { exploded: false, breakAt: labels ? 0 : riserLen * 0.5 });

  const w = labels ? 460 : 480;
  const h = labels ? 490 : 360;
  const pipeLeft = labels ? 168 : 222;
  const pipeRight = labels ? 98 : 150;
  const contentTop = st.top;
  const contentBottom = dims.ground + 17;
  const k = labels ? 1 : (h - 56) / (contentBottom - contentTop);
  const fx = labels ? 248 : 300;
  const fy = (labels ? 26 : 34) - contentTop * k;
  const toFrameX = (X: number) => (X - fx) / k;

  const nozzle = { x: b.spr.nozzle.x, y: b.spr.nozzle.y + st.sprinklerSeat };
  const land = { x: toFrameX(labels ? 26 : 24), y: dims.ground };

  const parts: Placed[] = [
    { id: 'ground', shapes: ground(land.x - 12 / k, toFrameX(labels ? w - 10 : w), dims.ground, [-88, 96]), dy: 0 },
    { id: 'pipe', shapes: pipe(pipeLeft, pipeRight, detail), dy: 0 },
    { id: 'stabilizer', shapes: b.stab.shapes, dy: 0 },
    { id: 'coupling', shapes: b.coup.shapes, dy: 0 },
    { id: 'thread', shapes: b.nip.shapes, dy: st.nippleSeat },
    { id: 'nut', shapes: b.nt.shapes, dy: st.nutSeat },
    { id: 'ring', shapes: b.rg.shapes, dy: st.ringSeat },
    { id: 'clamp', shapes: b.cl.shapes, dy: st.clampSeat },
    { id: 'riser', shapes: b.rs.shapes, dy: st.riserSeat },
    { id: 'sprinkler', shapes: b.spr.shapes, dy: st.sprinklerSeat },
  ];

  const under: Shape[] = [
    sh(path('M', 0, contentTop - 12, 'V', dims.ground + 10), 'center'),
    sh(path('M', -pipeLeft - 14, 0, 'H', pipeRight + 14), 'center'),
  ];
  const over: Shape[] = jet(nozzle, b.spr.dir, labels ? 160 : 190, land, detail);

  const callouts: Callout[] = [];
  if (labels) {
    const E = (p: Part, dy: number): Pt => ({ x: p.anchors.maxX.x, y: p.anchors.maxX.y + dy });
    // balloons sit flush with inline-start (the legend's dot column below):
    // leaders run to the edge under the balloon; a shoulder clears the
    // widest balloon (20px at the narrowest bench width)
    const edge = toFrameX(w);
    const shoulder = toFrameX(w - 36);
    const y2 = E(b.coup, 0).y; // the coupling's clamp lug sets the pitch origin
    const slot = (i: number) => y2 - i * PITCH; // i = 1 → thread … 5 → riser
    const stub = dims.clampR + 9 + 8; // clears the clamp's lug
    const plan: Array<{ from: Pt; y: number; fan: boolean }> = [
      { from: E(b.stab, 0), y: E(b.stab, 0).y, fan: false },
      { from: E(b.coup, 0), y: y2, fan: false },
      { from: E(b.nip, st.nippleSeat), y: slot(1), fan: true },
      { from: E(b.nt, st.nutSeat), y: slot(2), fan: true },
      { from: E(b.rg, st.ringSeat), y: slot(3), fan: true },
      { from: E(b.cl, st.clampSeat), y: slot(4), fan: true },
      { from: { x: dims.riserR, y: slot(5) }, y: slot(5), fan: false },
      { from: E(b.spr, st.sprinklerSeat), y: E(b.spr, st.sprinklerSeat).y, fan: false },
    ];
    plan.forEach((c, i) => {
      const pts = c.fan
        ? [c.from, { x: stub, y: c.from.y }, { x: shoulder, y: c.y }, { x: edge, y: c.y }]
        : [c.from, { x: edge, y: c.y }];
      over.push(...leader(pts));
      callouts.push({ n: i + 1, dot: { x: w, y: fy + c.y * k }, edge: true });
    });
  }

  return { w, h, frame: { x: fx, y: fy, k }, under, parts, over, callouts };
}

/**
 * Exploded storyboard: the same parts pulled apart along the assembly axis,
 * bottom-up in the published installation order. Balloons + labels sit at
 * inline-end (left) – number first, then the name, reading away from the
 * drawing – leaders leave each part horizontally and fan to the column.
 */
export function explodedLayout({ labels = true }: { labels?: boolean } = {}): Layout {
  const detail: Detail = 'full';
  const riserLen = 104;
  const gap = 24;
  const b = build(riserLen, detail, { exploded: true, breakAt: riserLen * 0.5 });

  // the stabilizer stays on the ground; the pipe with its coupling lifts off
  // the cradle; then each part floats `gap` above the one below it
  const lift = 34;
  const nipSeat = -lift + dims.bossTop - gap - 12;
  const nutSeat = nipSeat - 22 - gap;
  const ringSeat = nutSeat - dims.nutH - gap;
  const clampSeat = ringSeat - dims.ringH - gap;
  const riserSeat = clampSeat - dims.clampH - gap - 9;
  const sprSeat = riserSeat - riserLen - 9 - gap;
  const top = sprSeat - dims.sprinklerH;
  const bottom = dims.ground + 17;

  const w = 400;
  const fx = 300;
  const fy = 26 - top;
  const h = Math.round(fy + bottom + 18);

  const parts: Placed[] = [
    { id: 'ground', shapes: ground(-104, 100, dims.ground, [-84, 92]), dy: 0 },
    { id: 'stabilizer', shapes: b.stab.shapes, dy: 0 },
    { id: 'pipe', shapes: pipe(80, 84, detail), dy: -lift },
    { id: 'coupling', shapes: b.coup.shapes, dy: -lift },
    { id: 'thread', shapes: b.nip.shapes, dy: nipSeat },
    { id: 'nut', shapes: b.nt.shapes, dy: nutSeat },
    { id: 'ring', shapes: b.rg.shapes, dy: ringSeat },
    { id: 'clamp', shapes: b.cl.shapes, dy: clampSeat },
    { id: 'riser', shapes: b.rs.shapes, dy: riserSeat },
    { id: 'sprinkler', shapes: b.spr.shapes, dy: sprSeat },
  ];

  const under: Shape[] = [
    sh(path('M', 0, top - 16, 'V', dims.ground + 8), 'axis'),
    sh(path('M', -96, -lift, 'H', 98), 'center'),
  ];

  // each part drops onto the one installed before it: a chevron mid-gap
  const gaps: Array<[number, number]> = [
    [-lift + dims.bandR, dims.stabTop], // coupling → stabilizer
    [nipSeat + 12, -lift + dims.bossTop], // thread → coupling
    [nutSeat, nipSeat - 22], // nut → thread
    [ringSeat, nutSeat - dims.nutH], // ring → nut
    [clampSeat, ringSeat - dims.ringH], // clamp → ring
    [riserSeat + 9, clampSeat - dims.clampH], // riser → clamp
    [sprSeat, riserSeat - riserLen - 9], // sprinkler → riser
  ];
  const chevrons = gaps
    .map(([above, below]) => {
      const y = (above + below) / 2;
      return path('M', -3.4, y - 1.7, 'L', 0, y + 1.7, 'L', 3.4, y - 1.7);
    })
    .join(' ');

  const over: Shape[] = [sh(chevrons, 'cue')];
  const callouts: Callout[] = [];
  if (labels) {
    const S = (p: Part, dy: number): Pt => ({ x: p.anchors.minX.x, y: p.anchors.minX.y + dy });
    const anchors: Pt[] = [
      S(b.stab, 0),
      S(b.coup, -lift),
      S(b.nip, nipSeat),
      S(b.nt, nutSeat),
      S(b.rg, ringSeat),
      S(b.cl, clampSeat),
      S(b.rs, riserSeat),
      S(b.spr, sprSeat),
    ];
    const dotX = 156 - fx;
    const slots = spread(
      anchors.map((p) => p.y),
      66,
      top + 30,
      dims.ground - 6,
    );
    anchors.forEach((p, i) => {
      const y = slots[i];
      const pts =
        Math.abs(p.y - y) < 0.5
          ? [p, { x: dotX, y }]
          : [p, { x: Math.min(-100, p.x - 10), y: p.y }, { x: dotX + 16, y }, { x: dotX, y }];
      over.push(...leader(pts));
      callouts.push({ n: i + 1, dot: { x: fx + dotX, y: fy + y } });
    });
  }

  return { w, h, frame: { x: fx, y: fy, k: 1 }, under, parts, over, callouts };
}

/* ───────────────────────────── content ───────────────────────────── */

/** Rich text: plain Hebrew runs and numbers/codes (rendered through <Num>). */
export type Text = ReadonlyArray<string | { num: string }>;

/** Published parts, in installation order. `short` + `spec` label the exploded view. */
export const ashushitParts: ReadonlyArray<{ n: number; id: PartId; name: Text; short: Text; spec?: Text }> = [
  { n: 1, id: 'stabilizer', name: ['מייצב'], short: ['מייצב'] },
  {
    n: 2,
    id: 'coupling',
    name: ['מחבר עם שני אטמים וארבעה תפסים'],
    short: ['מחבר'],
    spec: [{ num: '2' }, ' אטמים · ', { num: '4' }, ' תפסים'],
  },
  { n: 3, id: 'thread', name: ['הברגה ', { num: '3/4' }, '״'], short: ['הברגה'], spec: [{ num: '3/4' }, '״'] },
  { n: 4, id: 'nut', name: ['אום אפור'], short: ['אום אפור'] },
  { n: 5, id: 'ring', name: ['טבעת לבנה'], short: ['טבעת לבנה'] },
  { n: 6, id: 'clamp', name: ['תפס סגירה'], short: ['תפס סגירה'] },
  {
    n: 7,
    id: 'riser',
    name: ['מגבה משושה שחור UV ', { num: '3/4' }, '״'],
    short: ['מגבה משושה'],
    spec: ['שחור · UV · ', { num: '3/4' }, '״'],
  },
  { n: 8, id: 'sprinkler', name: ['ממטיר ', { num: 'AR044' }], short: ['ממטיר'], spec: [{ num: 'AR044' }] },
];
