/**
 * עשושית – geometry for the technical line illustration. Pure data, no React.
 *
 * Drawn from Hamashbir's own installation guide („עשושית הוראות הרכבה”,
 * hamashbir.co.il › השקייה ותשתיות) and its parts sheet. The station is a tee
 * (מצמד עשושית) bolted to a stabiliser bar; the PE 50 lateral enters each of
 * its two mouths through a compression set – grey nut, white grip ring and
 * the closing hoop, all concentric with the pipe – and the four latches
 * (תפסנים) hook over the hoop's flange. The riser screws straight into the
 * boss's internal 3/4″ thread; the sprinkler screws into the riser.
 *
 * Drawing units ≈ millimetres (riser shortened with a break). SVG axes: y
 * grows downward. Pipe frame: origin on the pipe axis at the station's
 * vertical axis. Vertical parts (riser, sprinkler, key) are drawn in their
 * own frame around x = 0 with their seat at y = 0 and placed with an offset,
 * so the assembled view and the exploded storyboard share the very same
 * parts.
 *
 * Projection: an elevation turned a few degrees about the vertical axis
 * (x' = x − K·z, z toward the viewer). Rings around the pipe read as shallow
 * arcs – front halves bulge toward −x – and faces that point +x are visible,
 * as thin toned crescents. Light comes from the upper left: faces turned
 * right are toned and carry the heavier shade line, as in a patent drawing.
 *
 * The drawing is composed for RTL: the station stands toward inline-start
 * (right), the jet throws forward toward inline-end (left), and in the
 * exploded view the pipe arrives from inline-start and moves forward (left)
 * into the coupler.
 */

export type Pt = { x: number; y: number };

/**
 * Paint roles. Ashushit.module.css maps each to a class: body fills are
 * opaque (they hide the dot grid and anything behind), tones are
 * currentColor mixed into the body fill, strokes never scale.
 */
export type Paint =
  | 'fill' // opaque body
  | 'tone1' // light shade (grey nut, lit faces)
  | 'tone2' // mid shade (faces turned away)
  | 'tone3' // dark
  | 'water' // water
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
  | 'cue' // assembly-motion cues on the exploded view (chevrons, turn arrows)
  | 'leader'; // callout leader

/** The water jet's pieces, so a client island can animate them (see AshushitJet). */
export type JetRole = 'stream' | 'drop' | 'splash';

export type Shape = { d: string; paint: Paint[]; jet?: JetRole };

/** 'card' thins the detail (fewer ribs, coarser threads, no hidden lines) for small drawings. */
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
    'M',
    x0 + r,
    y0,
    'H',
    x1 - r,
    'Q',
    x1,
    y0,
    x1,
    y0 + r,
    'V',
    y1 - r,
    'Q',
    x1,
    y1,
    x1 - r,
    y1,
    'H',
    x0 + r,
    'Q',
    x0,
    y1,
    x0,
    y1 - r,
    'V',
    y0 + r,
    'Q',
    x0,
    y0,
    x0 + r,
    y0,
    'Z',
  );
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return path('M', cx - rx, cy, 'A', rx, ry, 0, 1, 0, cx + rx, cy, 'A', rx, ry, 0, 1, 0, cx - rx, cy, 'Z');
}

function poly(pts: Pt[], close = true) {
  return path(...pts.flatMap((p, i) => [i === 0 ? 'M' : 'L', p.x, p.y]), ...(close ? ['Z'] : []));
}

/* ───────────────────────────── dimensions ───────────────────────────── */

/** Sine of the turn: how far a ring's front bulges, and how far depth shifts x. */
const K = 0.12;

export const dims = {
  pipeR: 25, // PE 50 × 4 lateral
  // מצמד עשושית: body tube, cones, bells, mouth lips (|x|)
  tubeR: 34,
  tubeX: 70,
  bellR: 42,
  bellX: 78,
  lipR: 44,
  lipX: 96,
  mouthX: 100,
  // riser boss with its internal 3/4″ thread (3/4″ BSP ≈ 26.4 mm)
  bossR: 19,
  bossTop: -62,
  threadMaj: 13.2,
  threadMin: 11.4,
  threadDepth: 22,
  pitch: 3.6, // drawn coarser than the real 1.81 mm so it reads
  /** the stop (מעצור): the pipe goes ≈ 5 cm into the mouth */
  stop: 50,
  finZ: 40,
  latchZ: 48,
  // Π legs that drop into the stabiliser's box
  legHalf: 22,
  legTop: 30,
  legBottom: 54,
  // closing hoop (serrated flange + threaded neck), grip ring, grey nut –
  // positions are distances u outward from the mouth face
  flangeR: 46,
  flangeW: 11,
  neckR: 36,
  neckW: 29,
  ringR: 30,
  ringU: 40,
  ringW: 12,
  nutR: 45,
  nutU: 20,
  nutW: 44,
  // מייצב: a long bar across the pipe, seen end-on
  ground: 80,
  plateTop: 64,
  plateHalf: 58,
  plateTopHalf: 50,
  barHalf: 220,
  boxHalf: 30,
  boxTop: 42,
  boxDepth: 36,
  // riser and sprinkler
  riserR: 15, // across-corner radius of the hex riser
  socketR: 18,
  socketH: 20,
  maleLen: 16,
  sprinklerH: 106,
} as const;

/** Outward span [u0, u1] from a mouth face at x = m on side s, as a sorted x range. */
function span(m: number, s: 1 | -1, u0: number, u1: number): [number, number] {
  const a = m + s * u0;
  const b = m + s * u1;
  return a < b ? [a, b] : [b, a];
}

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

/**
 * Solid of revolution about the pipe axis, x0 < x1. The −x end shows the
 * front half of its rim. With `face`, the +x end face is visible: the
 * silhouette takes the back half of its rim and the face is a toned
 * crescent behind its front edge. Without it the +x end is a plain front
 * arc – for ends another part covers.
 */
function cylX(x0: number, x1: number, r: number, { body = 'fill' as Paint, face = false } = {}): Shape[] {
  const outline = path(
    'M',
    x0,
    -r,
    'H',
    x1,
    'A',
    K * r,
    r,
    0,
    0,
    face ? 1 : 0,
    x1,
    r,
    'H',
    x0,
    'A',
    K * r,
    r,
    0,
    0,
    1,
    x0,
    -r,
    'Z',
  );
  const out: Shape[] = [sh(outline, body)];
  if (face) out.push(sh(ellipse(x1, 0, K * r, r), 'tone2'));
  out.push(sh(outline, 'line'));
  if (face) out.push(sh(ringArc(x1, r), 'fine'));
  return out;
}

/**
 * Lines along the pipe axis on a ring's visible face, at angles a (degrees
 * from the axis plane; positive = below, the shadow side), trimmed to the
 * front arcs at both ends.
 */
function axialLines(x0: number, x1: number, r: number, angles: number[], inset = 0) {
  return angles
    .map((a) => {
      const y = r * Math.sin(deg(a));
      return path('M', ringArcX(x0, r, y) + inset, y, 'H', ringArcX(x1, r, y) - inset);
    })
    .join(' ');
}

/**
 * Hex prism in elevation, seen across the corners: three faces, the middle
 * one square to the viewer. `ch` chamfers an end like a nut – the shallow
 * arc on every face is the signature of a well-drawn nut.
 */
function hexPrism(top: number, bottom: number, rc: number, { ch = 0, detail = 'full' as Detail } = {}): Shape[] {
  const h = rc / 2;
  const q = rc * 0.75; // projected centre of a side face
  const tTop = top + ch;
  const tBot = bottom - ch;
  const faceFill = (xa: number, xb: number, xm: number) =>
    path(
      'M',
      xa,
      tTop,
      ...(ch ? ['Q', xm, top - ch, xb, tTop] : ['L', xb, top]),
      'L',
      xb,
      tBot,
      ...(ch ? ['Q', xm, bottom + ch, xa, tBot] : ['L', xa, bottom]),
      'Z',
    );
  const out: Shape[] = [
    sh(faceFill(-rc, -h, -q), 'tone1'),
    sh(faceFill(-h, h, 0), 'fill'),
    sh(faceFill(h, rc, q), 'tone2'),
  ];
  const e = (rc - q) * 0.2;
  out.push(
    sh(
      ch
        ? path(
            'M',
            -rc,
            tTop,
            'Q',
            -rc + e,
            top,
            -q,
            top,
            'H',
            q,
            'Q',
            rc - e,
            top,
            rc,
            tTop,
            'V',
            tBot,
            'Q',
            rc - e,
            bottom,
            q,
            bottom,
            'H',
            -q,
            'Q',
            -rc + e,
            bottom,
            -rc,
            tBot,
            'Z',
          )
        : path('M', -rc, top, 'H', rc, 'V', bottom, 'H', -rc, 'Z'),
      'line',
    ),
  );
  out.push(sh(path('M', -h, tTop, 'V', tBot, 'M', h, tTop, 'V', tBot), detail === 'card' ? 'fine' : 'line'));
  if (ch) {
    const arcs = (y0: number, y1: number, apex: number) =>
      path(
        'M',
        -h,
        y1,
        'Q',
        0,
        2 * apex - y1,
        h,
        y1,
        'M',
        -q,
        y0,
        'Q',
        -h - (q - h) * 0.3,
        y0,
        -h,
        y1,
        'M',
        q,
        y0,
        'Q',
        h + (q - h) * 0.3,
        y0,
        h,
        y1,
      );
    out.push(sh(arcs(top, tTop, top) + ' ' + arcs(bottom, tBot, bottom), 'fine'));
  }
  out.push(sh(path('M', rc, tTop, 'V', tBot), 'shade'));
  return out;
}

/**
 * External 3/4″ thread on a vertical part between `top` and `bottom` (top <
 * bottom): sawtooth flanks offset by half a pitch and joined by slanted
 * crest lines – the detailed convention, coarsened so it survives small sizes.
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

/** Hidden internal 3/4″ thread: major-diameter flanks and the bore floor, from `top` down `depth`. */
function hiddenThread(top: number, depth: number): Shape {
  const R = dims.threadMaj;
  return sh(
    path('M', -R, top, 'V', top + depth, 'M', R, top, 'V', top + depth, 'M', -R, top + depth, 'H', R),
    'hidden',
  );
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

function prismSegment(
  top: number,
  bottom: number,
  rc: number,
  { breakTop = false, breakBottom = false, detail = 'full' as Detail } = {},
): Shape[] {
  const h = rc / 2;
  const flat = (y: number): Pt[] => [
    { x: -rc, y },
    { x: -h, y },
    { x: h, y },
    { x: rc, y },
  ];
  const tE = breakTop ? breakEdge(top, rc) : flat(top);
  const bE = breakBottom ? breakEdge(bottom, rc) : flat(bottom);
  const face = (i: number, paint: Paint) => sh(poly([tE[i], tE[i + 1], bE[i + 1], bE[i]]), paint);
  const out: Shape[] = [face(0, 'tone1'), face(1, 'fill'), face(2, 'tone2')];
  out.push(sh(poly([...tE, ...bE.slice().reverse()]), 'line'));
  out.push(
    sh(
      path('M', tE[1].x, tE[1].y, 'L', bE[1].x, bE[1].y, 'M', tE[2].x, tE[2].y, 'L', bE[2].x, bE[2].y),
      detail === 'card' ? 'fine' : 'line',
    ),
  );
  if (detail === 'full' && bottom - top > 24) {
    const x = -rc * 0.78; // a streak of reflected light on the lit face
    out.push(sh(path('M', x, top + 7, 'L', x, bottom - 7), 'fine'));
  }
  out.push(sh(path('M', rc, tE[3].y, 'L', rc, bE[3].y), 'shade'));
  return out;
}

/* ───────────────────────────── scene ───────────────────────────── */

export function ground(x0: number, x1: number, y: number, hatch: [number, number] | null): Shape[] {
  const out: Shape[] = [sh(path('M', x0, y, 'H', x1), 'line')];
  if (hatch) {
    const segs: string[] = [];
    for (let x = hatch[0]; x <= hatch[1]; x += 7) segs.push(path('M', x, y + 2, 'l', -5, 5));
    out.push(sh(segs.join(' '), 'fine'));
  }
  return out;
}

/* ───────────────────────────── the parts ───────────────────────────── */

/**
 * 1 · מייצב – a long moulded bar laid across the pipe, the coupler bolted
 * into the box at its middle. Seen end-on: the lit near end, and its long
 * side receding toward +x (toned). Pipe frame.
 */
export function stabilizer(detail: Detail = 'full'): Shape[] {
  const { ground: g, plateTop: t, plateHalf: w, plateTopHalf: wt, barHalf, boxHalf: bw, boxTop: bt, boxDepth } = dims;
  const full = detail === 'full';
  const s = K * barHalf; // near end shifts −x, far end +x
  const sb = K * boxDepth;
  const out: Shape[] = [];
  // the long side, receding into the page; its moulded edge runs along it
  out.push(
    sh(
      poly([
        { x: w - s, y: g },
        { x: w + s, y: g },
        { x: wt + s, y: t },
        { x: wt - s, y: t },
      ]),
      'tone1',
      'line',
    ),
  );
  if (full) out.push(sh(path('M', w - s - 1.6, t + 5, 'H', w + s - 1.6), 'fine'));
  out.push(sh(path('M', w + s, g, 'L', wt + s, t), 'shade'));
  // the near end, a low moulded section with a lip along its top
  out.push(
    sh(
      path(
        'M',
        -w - s,
        g,
        'H',
        w - s,
        'L',
        wt - s + 1.2,
        t + 1.6,
        'Q',
        wt - s,
        t,
        wt - s - 1.6,
        t,
        'H',
        -wt - s + 1.6,
        'Q',
        -wt - s,
        t,
        -wt - s - 1.2,
        t + 1.6,
        'Z',
      ),
      'fill',
      'line',
    ),
  );
  if (full) out.push(sh(path('M', -w - s + 5, t + 5, 'H', w - s - 5), 'fine'));
  // the box at the middle of the bar, holding the coupler's legs
  out.push(
    sh(
      poly([
        { x: bw - sb, y: t },
        { x: bw + sb, y: t },
        { x: bw + sb, y: bt + 1 },
        { x: bw - sb, y: bt },
      ]),
      'tone2',
      'line',
    ),
  );
  out.push(sh(roundRect(-bw - sb, bt, bw - sb, t, 1.5), 'fill', 'line'));
  out.push(sh(path('M', bw + sb, bt + 1, 'V', t), 'shade'));
  // the 2 bolts through the box, heads toward the viewer
  const cy = (bt + t) / 2 + 1;
  for (const cx of [-14 - sb, 14 - sb]) {
    const r = full ? 4.8 : 5.4;
    out.push(
      sh(
        poly(
          Array.from({ length: 6 }, (_, i) => ({
            x: cx + r * Math.cos(deg(60 * i)),
            y: cy + r * Math.sin(deg(60 * i)),
          })),
        ),
        'tone2',
        'line',
      ),
    );
    if (full) out.push(sh(path('M', cx - r / 2, cy, 'H', cx + r / 2), 'fine'));
  }
  return out;
}

/** The Π legs under the coupler, drawn before the stabiliser so its box hides their foot. */
export function couplerLegs(): Shape[] {
  const sl = K * 20;
  const { legHalf: lh, legTop, legBottom } = dims;
  return [
    sh(roundRect(-lh - sl, legTop, lh - sl, legBottom, 2), 'tone1', 'line'),
    sh(path('M', -7 - sl, dims.tubeR + 2, 'V', dims.boxTop), 'fine'),
  ];
}

/**
 * 2 · מצמד עשושית מורכב – the tee: a body tube with a bell mouth at each end
 * (2 seals, stops inside), a moulded rib along its side carrying the latch
 * pivots, and the riser boss on top with its internal 3/4″ thread (hidden).
 * Pipe frame. The latches are drawn separately, after the compression sets.
 */
export function coupler(detail: Detail = 'full'): Shape[] {
  const { tubeR: rt, tubeX: xt, bellR: rb, bellX: xb, lipR: rl, lipX: xl, mouthX: xm, bossR: rs, bossTop: bt } = dims;
  const full = detail === 'full';
  const out: Shape[] = [];
  const body = path(
    'M',
    -xm,
    -rl,
    'H',
    -xl,
    'V',
    -rb,
    'H',
    -xb,
    'L',
    -xt,
    -rt,
    'H',
    xt,
    'L',
    xb,
    -rb,
    'H',
    xl,
    'V',
    -rl,
    'H',
    xm,
    'A',
    K * rl,
    rl,
    0,
    0,
    0,
    xm,
    rl,
    'H',
    xl,
    'V',
    rb,
    'H',
    xb,
    'L',
    xt,
    rt,
    'H',
    -xt,
    'L',
    -xb,
    rb,
    'H',
    -xl,
    'V',
    rl,
    'H',
    -xm,
    'A',
    K * rl,
    rl,
    0,
    0,
    1,
    -xm,
    -rl,
    'Z',
  );
  out.push(sh(body, 'fill', 'line'));
  // turned edges: the mouth lips, and the cones into the bells
  out.push(sh([ringArc(-xl, rl), ringArc(xl, rl)].join(' '), 'line'));
  out.push(sh([ringArc(-xb, rb), ringArc(xb, rb), ringArc(-xt, rt), ringArc(xt, rt)].join(' '), 'fine'));
  // shading on the lower half
  out.push(sh(axialLines(-xt, xt, rt, full ? [50, 68] : [60], 2), 'fine'));
  if (full) out.push(sh([axialLines(-xl, -xb, rb, [62], 1), axialLines(xb, xl, rb, [62], 1)].join(' '), 'fine'));
  out.push(sh(path('M', -xt, rt, 'H', xt, 'M', -xl, rb, 'H', -xb, 'M', xb, rb, 'H', xl), 'shade'));
  // the side rib that carries the latch pivots, seen edge-on
  const sf = K * dims.finZ;
  out.push(
    sh(
      full
        ? path('M', -74 - sf, -2, 'H', 74 - sf, 'M', -74 - sf, 2, 'H', 74 - sf)
        : path('M', -74 - sf, 0, 'H', 74 - sf),
      'fine',
    ),
  );
  // the boss, filleted into the tube
  const f = 3;
  const boss = [
    'M',
    -rs - f,
    -rt,
    'Q',
    -rs,
    -rt,
    -rs,
    -rt - f,
    'V',
    bt + 1.5,
    'L',
    -rs + 1.5,
    bt,
    'H',
    rs - 1.5,
    'L',
    rs,
    bt + 1.5,
    'V',
    -rt - f,
    'Q',
    rs,
    -rt,
    rs + f,
    -rt,
  ] as const;
  out.push(sh(path(...boss, 'V', -rt + 5, 'H', -rs - f, 'Z'), 'fill'));
  out.push(sh(path(...boss), 'line'));
  // where boss and tube meet: the front half of the saddle curve
  const dip = Math.sqrt(rt * rt - rs * rs);
  out.push(sh(path('M', -rs, -rt, 'Q', -4 * K * rs, -2 * dip + rt, rs, -rt), 'fine'));
  out.push(sh(path('M', -rs + 1.5, bt + 1.5, 'H', rs - 1.5), 'fine'));
  out.push(sh(path('M', rs, -rt - f, 'V', bt + 1.5), 'shade'));
  if (full) out.push(hiddenThread(bt, dims.threadDepth));
  return out;
}

/**
 * The four latches (תפסנים): two per mouth, pivoting on the side rib, their
 * hooks closing behind the hoop's flange. Only the near pair shows: a lever
 * seen edge-on, the press pad (pressed to release the pipe) at its inner end.
 */
export function latch(side: 1 | -1, detail: Detail = 'full'): Shape[] {
  const s = K * dims.latchZ;
  const X = (u: number) => side * u - s;
  const d = path(
    'M',
    X(58),
    -6.5,
    'H',
    X(66),
    'Q',
    X(68),
    -6.5,
    X(68),
    -4.5,
    'V',
    -3.5,
    'H',
    X(108),
    'V',
    -5.5,
    'H',
    X(115.5),
    'Q',
    X(118),
    -5.5,
    X(118),
    -3,
    'V',
    3,
    'Q',
    X(118),
    5.5,
    X(115.5),
    5.5,
    'H',
    X(108),
    'V',
    3.5,
    'H',
    X(68),
    'V',
    4.5,
    'Q',
    X(68),
    6.5,
    X(66),
    6.5,
    'H',
    X(58),
    'Q',
    X(56),
    6.5,
    X(56),
    4.5,
    'V',
    -4.5,
    'Q',
    X(56),
    -6.5,
    X(58),
    -6.5,
    'Z',
  );
  const out: Shape[] = [sh(d, 'fill', 'line'), sh(ellipse(X(76), 0, 3, 3), 'tone2', 'fine')];
  if (detail === 'full')
    out.push(sh(path('M', X(60.5), -3.5, 'V', 3.5, 'M', X(63.5), -3.5, 'V', 3.5, 'M', X(111), -5.5, 'V', 5.5), 'fine'));
  return out;
}

/**
 * 6 · חישוק עגול סוגר – the closing hoop: a serrated flange the latches
 * catch and the key turns, and a threaded neck the grey nut screws onto.
 * `m` is the mouth face it seats against; `neck` overrides the drawn part
 * of the neck (the rest hides inside the nut).
 */
export function hoop(m: number, side: 1 | -1, detail: Detail = 'full', neck?: [number, number]) {
  const { flangeR: rf, flangeW: wf, neckR: rn, neckW: wn } = dims;
  const full = detail === 'full';
  const [f0, f1] = span(m, side, 0, wf);
  const flange: Shape[] = cylX(f0, f1, rf, { face: full });
  flange.push(
    sh(axialLines(f0, f1, rf, full ? [-68, -50, -32, -15, 0, 15, 32, 50, 68] : [-48, -16, 16, 48], 1.2), 'fine'),
  );
  flange.push(sh(path('M', f0, rf, 'H', f1), 'shade'));
  const [n0, n1] = neck ?? span(m, side, wf, wf + wn);
  const neckShapes: Shape[] = cylX(n0, n1, rn, { face: full });
  const p = full ? dims.pitch : dims.pitch * 1.5;
  const crests: string[] = [];
  for (let x = n0 + 2; x + p / 2 < n1 - 1; x += p) {
    crests.push(path('M', x, -rn, 'Q', x + p / 4 - 2 * K * rn, 0, x + p / 2, rn));
  }
  neckShapes.push(sh(crests.join(' '), 'fine'));
  return { flange, neck: neckShapes };
}

/** 5 · טבעת לבנה – the white grip ring, crowned with slots on one edge. */
export function ring(x0: number, detail: Detail = 'full'): Shape[] {
  const { ringR: r, ringW: w } = dims;
  const out = cylX(x0, x0 + w, r, { face: detail === 'full' });
  out.push(sh(axialLines(x0 + w * 0.5, x0 + w, r, [-58, -34, -11, 11, 34, 58], 0.6), 'fine'));
  return out;
}

/** The white ring inside the nut, as a hidden outline. */
export function ringHidden(x0: number): Shape {
  const { ringR: r, ringW: w } = dims;
  return sh(
    path('M', x0, -r, 'H', x0 + w, 'M', x0, r, 'H', x0 + w) + ' ' + ringArc(x0, r) + ' ' + ringArc(x0 + w, r),
    'hidden',
  );
}

/** 4 · אום אפור – the grey compression nut: chamfered both ends, grip lobes. x0 < x1. */
export function nut(x0: number, detail: Detail = 'full'): Shape[] {
  const r = dims.nutR;
  const x1 = x0 + dims.nutW;
  const full = detail === 'full';
  const c = 2.5;
  const rc = r - c;
  const outline = path(
    'M',
    x0 + c,
    -r,
    'H',
    x1 - c,
    'L',
    x1,
    -rc,
    'A',
    K * rc,
    rc,
    0,
    0,
    full ? 1 : 0,
    x1,
    rc,
    'L',
    x1 - c,
    r,
    'H',
    x0 + c,
    'L',
    x0,
    rc,
    'A',
    K * rc,
    rc,
    0,
    0,
    1,
    x0,
    -rc,
    'Z',
  );
  const out: Shape[] = [sh(outline, 'tone1')];
  if (full) out.push(sh(ellipse(x1, 0, K * rc, rc), 'tone2'));
  out.push(sh(outline, 'line'));
  if (full) out.push(sh(ringArc(x1, rc), 'fine'));
  out.push(sh([ringArc(x0 + c, r), ringArc(x1 - c, r)].join(' '), 'fine'));
  out.push(sh(axialLines(x0 + c, x1 - c, r, full ? [-66, -42, -18, 18, 42, 66] : [-50, -15, 15, 50], 1.5), 'fine'));
  out.push(sh(path('M', x0 + c, r, 'H', x1 - c), 'shade'));
  return out;
}

/**
 * 3 · צינור פוליאתילן 50 מ״מ – a straight run of the lateral. `chamfer`
 * bevels the −x end (the pipe arrives with one); `mark` draws a witness ring.
 */
export function pipe(
  x0: number,
  x1: number,
  detail: Detail = 'full',
  { chamfer = false, mark }: { chamfer?: boolean; mark?: number } = {},
): Shape[] {
  const R = dims.pipeR;
  const c = chamfer ? 3 : 0;
  const out: Shape[] = [];
  if (chamfer) {
    const d = path(
      'M',
      x0 + c,
      -R,
      'H',
      x1,
      'A',
      K * R,
      R,
      0,
      0,
      0,
      x1,
      R,
      'H',
      x0 + c,
      'L',
      x0,
      R - c,
      'A',
      K * (R - c),
      R - c,
      0,
      0,
      1,
      x0,
      -(R - c),
      'Z',
    );
    out.push(sh(d, 'fill', 'line'), sh(ringArc(x0 + c, R), 'fine'));
  } else {
    out.push(...cylX(x0, x1, R));
  }
  out.push(sh(axialLines(x0 + c, x1, R, detail === 'full' ? [48, 66] : [58], 2), 'fine'));
  if (mark !== undefined) out.push(sh(ringArc(mark, R), 'line'));
  out.push(sh(path('M', x0 + c, R, 'H', x1), 'shade'));
  return out;
}

/** The pipe's end inside the coupler, pushed home to the stop: hidden lines. */
function pipeInside(side: 1 | -1): Shape {
  const R = dims.pipeR;
  const [x0, x1] = span(0, side, dims.stop, dims.mouthX - 2);
  return sh(path('M', x0, -R, 'H', x1, 'M', x0, R, 'H', x1) + ' ' + ringArc(side * dims.stop, R), 'hidden');
}

/**
 * 7 · זקף משושה UV שחור 3/4″ – the long hex riser. Seat (y = 0) = its foot on
 * the boss. `male` draws the thread below the seat (exploded view – in the
 * assembled view it is inside the boss). The top is a hex socket that takes
 * the sprinkler; `breakAt` (distance from the foot) interrupts the bar with
 * a conventional break, honest about a riser much longer than drawn.
 */
export function riser(
  len: number,
  { breakAt = 0, male = false, hiddenSocket = false, detail = 'full' as Detail } = {},
) {
  const rc = dims.riserR;
  const bodyTop = -(len - dims.socketH);
  const out: Shape[] = [];
  if (male) out.push(...thread(0, dims.maleLen, detail));
  if (breakAt > 0) {
    const gap = 5;
    out.push(...prismSegment(bodyTop, -breakAt - gap / 2, rc, { breakBottom: true, detail }));
    out.push(...prismSegment(-breakAt + gap / 2, 0, rc, { breakTop: true, detail }));
  } else {
    out.push(...prismSegment(bodyTop, 0, rc, { detail }));
  }
  out.push(...hexPrism(-len, bodyTop, dims.socketR, { ch: 1.6, detail }));
  if (hiddenSocket && detail === 'full') out.push(hiddenThread(-len, 14));
  const y = -len * (breakAt > 0 ? 0.74 : 0.6);
  return { shapes: out, anchor: { x: rc, y } };
}

/* ─── 8 · ממטיר AR044 – impact sprinkler ─── */

/** Trajectory angle of the nozzle, degrees above horizontal, thrown toward −x (forward in RTL). */
const NOZZLE_DEG = 25;

/**
 * Seat (y = 0) = the underside of its hex base; `male` draws the 3/4″ thread
 * below it that screws into the riser's socket.
 */
export function sprinkler(detail: Detail = 'full', { male = false } = {}) {
  const out: Shape[] = [];
  const a = deg(NOZZLE_DEG);
  const d = { x: -Math.cos(a), y: -Math.sin(a) }; // along the barrel, toward the nozzle
  const up = { x: Math.sin(a), y: -Math.cos(a) }; // the barrel's upper side
  const at = (o: Pt, t: number, r: number): Pt => ({ x: o.x + t * d.x + r * up.x, y: o.y + t * d.y + r * up.y });

  if (male) out.push(...thread(0, 14, detail));
  // hex base (wrench flats), bearing washer, bearing sleeve
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
        'M',
        -11,
        -26.5,
        'V',
        meet.y + 2.6,
        'Q',
        -11,
        meet.y,
        -11 + 2.6 * d.x,
        meet.y + 2.6 * d.y,
        'L',
        lower1.x,
        lower1.y,
        'L',
        upper1.x,
        upper1.y,
        'L',
        upper0.x,
        upper0.y,
        'C',
        upper0.x - 5 * d.x,
        upper0.y - 5 * d.y,
        11,
        -49.5,
        11,
        -44.5,
        'V',
        -26.5,
        'Z',
      ),
      'fill',
      'line',
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
        'M',
        -7.5,
        -83.6,
        'Q',
        -28,
        -84.6,
        -46,
        -82.8,
        'C',
        -54,
        -82,
        -60.6,
        -79,
        -59.7,
        -75.2,
        'Q',
        -59.3,
        -72.6,
        -56.9,
        -72.7,
        'Q',
        -55.4,
        -72.8,
        -55.9,
        -74.5,
        'C',
        -56.7,
        -77.1,
        -52.7,
        -78.5,
        -46.2,
        -78.5,
        'Q',
        -28,
        -79.6,
        -7.5,
        -78.8,
        'Z',
      ),
      'fill',
      'line',
    ),
  );
  out.push(sh(roundRect(-7.5, -86.5, 7.5, -76, 2), 'fill', 'line'));
  if (detail === 'full') out.push(sh(path('M', -7.5, -81.25, 'H', 7.5), 'fine'));

  // spring over the pivot, its cap and the top bearing
  const turns = detail === 'full' ? 7 : 5;
  const coil: Pt[] = Array.from({ length: turns + 1 }, (_, i) => ({
    x: i % 2 === 0 ? -5 : 5,
    y: -87 - (i * 10) / turns,
  }));
  out.push(sh(poly(coil, false), 'fine'));
  out.push(sh(roundRect(-8.5, -101, 8.5, -97, 1.5), 'fill', 'line'));
  out.push(sh(path('M', -4.2, -101, 'Q', -4.2, -106, 0, -106, 'Q', 4.2, -106, 4.2, -101, 'Z'), 'fill', 'line'));

  return { shapes: out, anchor: { x: 45, y: -80.5 }, nozzle: T, dir: d };
}

/**
 * מפתח עשושית – the flat key that turns the closing hoop (step 03). Drawn
 * face-on, turned into the picture plane the way assembly sheets show a
 * tool: jaw mouth at (0, 0) opening toward +y, handle toward −y.
 */
export function key(detail: Detail = 'full'): Shape[] {
  const out: Shape[] = [
    sh(
      path(
        'M',
        13,
        0,
        'H',
        27.5,
        'A',
        30,
        30,
        0,
        0,
        0,
        11,
        -40,
        'L',
        9,
        -128,
        'Q',
        9,
        -137,
        0,
        -137,
        'Q',
        -9,
        -137,
        -9,
        -128,
        'L',
        -11,
        -40,
        'A',
        30,
        30,
        0,
        0,
        0,
        -27.5,
        0,
        'H',
        -13,
        'V',
        -9,
        'A',
        13,
        13,
        0,
        0,
        1,
        13,
        -9,
        'Z',
      ),
      'tone1',
      'line',
    ),
  ];
  if (detail === 'full') out.push(sh(path('M', 0, -46, 'V', -124), 'fine'));
  return out;
}

/* ───────────────────────────── annotations ───────────────────────────── */

/** A chevron at (x, y) pointing down (into the part below) or left (forward, into the coupler). */
function chevron(x: number, y: number, dir: 'down' | 'left') {
  return dir === 'down'
    ? path('M', x - 3.4, y - 1.7, 'L', x, y + 1.7, 'L', x + 3.4, y - 1.7)
    : path('M', x + 1.7, y - 3.4, 'L', x - 1.7, y, 'L', x + 1.7, y + 3.4);
}

/**
 * Screwing in, seen from the front: the near side of a part turning
 * clockwise (as seen from above) travels right to left – the front half of
 * a flat ellipse with an arrowhead at its left end.
 */
function turnArrow(cx: number, cy: number, rx: number, ry: number) {
  const a0 = deg(24);
  const a1 = deg(150);
  const p0 = { x: cx + rx * Math.cos(a0), y: cy + ry * Math.sin(a0) };
  const p1 = { x: cx + rx * Math.cos(a1), y: cy + ry * Math.sin(a1) };
  const tx = -rx * Math.sin(a1);
  const ty = ry * Math.cos(a1);
  const tl = Math.hypot(tx, ty);
  const ux = tx / tl;
  const uy = ty / tl;
  const head = (spread: number) => {
    const c = Math.cos(deg(spread));
    const s = Math.sin(deg(spread));
    return { x: p1.x - 4.5 * (ux * c - uy * s), y: p1.y - 4.5 * (uy * c + ux * s) };
  };
  const h1 = head(32);
  const h2 = head(-32);
  return path('M', p0.x, p0.y, 'A', rx, ry, 0, 0, 1, p1.x, p1.y, 'M', h1.x, h1.y, 'L', p1.x, p1.y, 'L', h2.x, h2.y);
}

/** A dimension line between x0 and x1 at height y, with arrowheads and extension lines from `from`. */
function dimension(x0: number, x1: number, y: number, from: number) {
  const a = 3.2;
  return path(
    'M',
    x0,
    from,
    'V',
    y + 4,
    'M',
    x1,
    from,
    'V',
    y + 4,
    'M',
    x0,
    y,
    'H',
    x1,
    'M',
    x0 + a,
    y - a * 0.6,
    'L',
    x0,
    y,
    'L',
    x0 + a,
    y + a * 0.6,
    'M',
    x1 - a,
    y - a * 0.6,
    'L',
    x1,
    y,
    'L',
    x1 - a,
    y + a * 0.6,
  );
}

/* ───────────────────────────── layouts ───────────────────────────── */

export type Placed = { id: string; shapes: Shape[]; dx?: number; dy?: number; rotate?: number };

/**
 * An overlay pinned to the drawing, in viewBox units: a part balloon (its
 * number), a step tag (01–05), or a note (a short dimension label).
 * `edge` pins a balloon flush with inline-start at height `at.y`.
 */
export type Callout =
  | { kind: 'part'; n: number; at: Pt; edge?: boolean }
  | { kind: 'step'; n: number; at: Pt }
  | { kind: 'note'; id: 'insert'; at: Pt };

/**
 * A composition: a viewBox, a frame (the pipe frame mapped into the viewBox
 * by translate + uniform scale – strokes don't scale), the parts placed in
 * the frame, and callouts in viewBox units (rendered as HTML).
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

/**
 * The jet: leaves the nozzle along its axis (past the spoon) and falls to
 * `land`. The coherent stream breaks into single drops (one path each, so
 * they can be animated in turn) and lands with a small splash.
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
  const out: Shape[] = [{ d: path('M', p0.x, p0.y, 'Q', c1.x, c1.y, e.x, e.y), paint: ['jet'], jet: 'stream' }];
  // …then it breaks into drops, thinning out as they fall, and lands
  const drops =
    detail === 'full' ? [0.665, 0.715, 0.765, 0.815, 0.86, 0.9, 0.935, 0.965] : [0.67, 0.735, 0.8, 0.86, 0.915, 0.96];
  const half = Math.ceil(drops.length / 2);
  drops.forEach((t, i) =>
    out.push({ d: path('M', q(t).x, q(t).y, 'h', 0), paint: [i < half ? 'drop' : 'dropSm'], jet: 'drop' }),
  );
  const sp = detail === 'full' ? 1 : 1.25;
  out.push({
    d: path(
      'M',
      land.x - 1.5 * sp,
      land.y - 2.5 * sp,
      'l',
      -3.5 * sp,
      -4 * sp,
      'M',
      land.x + 1.5 * sp,
      land.y - 2.5 * sp,
      'l',
      3.5 * sp,
      -4 * sp,
      'M',
      land.x,
      land.y - 3 * sp,
      'v',
      -5 * sp,
    ),
    paint: ['splash'],
    jet: 'splash',
  });
  return out;
}

/** Leader polyline from a part to its balloon (the balloon covers the end), with a dot on the part. */
function leader(pts: Pt[]): Shape[] {
  return [sh(poly(pts, false), 'leader'), sh(path('M', pts[0].x, pts[0].y, 'h', 0), 'dot')];
}

/** Compression sets at both mouths, painted outboard → inboard on the left and inboard → outboard on the right. */
function compressionSets(detail: Detail, pipeLeft: number, pipeRight: number) {
  const { mouthX: m, nutU, nutW, ringU, flangeW } = dims;
  const full = detail === 'full';
  const nutL = -m - nutU - nutW;
  const nutR = m + nutU;
  const hoopL = hoop(-m, -1, detail, [-m - nutU, -m - flangeW]);
  const hoopR = hoop(m, 1, detail);
  const left: Placed[] = [
    { id: 'pipe-left', shapes: pipe(-pipeLeft, nutL, detail) },
    { id: 'nut-left', shapes: nut(nutL, detail) },
    { id: 'hoop-left', shapes: [...hoopL.neck, ...hoopL.flange] },
  ];
  const right: Placed[] = [
    { id: 'hoop-right', shapes: [...hoopR.flange, ...hoopR.neck] },
    { id: 'nut-right', shapes: nut(nutR, detail) },
    { id: 'pipe-right', shapes: pipe(nutR + nutW, pipeRight, detail) },
  ];
  const hidden: Shape[] = full
    ? [pipeInside(-1), pipeInside(1), ringHidden(-m - ringU - dims.ringW), ringHidden(m + ringU)]
    : [];
  return { left, right, hidden };
}

/**
 * Assembled station, inline on its lateral – the pipe enters one mouth and
 * leaves through the other, a compression set closing each.
 *
 * With labels it is a parts drawing: the compression set's balloons sit in a
 * row above it, each leader rising from its part (the white ring's from its
 * hidden outline inside the nut), so no two leaders can cross; riser,
 * sprinkler, pipe and stabiliser take balloons flush with inline-start.
 *
 * Without labels it is a 4:3 product-card composition: riser shortened with
 * a break, scaled to fit, the jet landing on the ground line.
 */
export function assembledLayout({ labels }: { labels: boolean }): Layout {
  const detail: Detail = labels ? 'full' : 'card';
  // the card keeps the product's silhouette: a tall riser over a small tee
  const riserLen = labels ? 180 : 160;
  const riserSeat = dims.bossTop;
  const sprinklerSeat = riserSeat - riserLen;
  const contentTop = sprinklerSeat - dims.sprinklerH;
  const contentBottom = dims.ground + 8;

  const w = labels ? 520 : 480;
  const h = labels ? 490 : 360;
  const k = labels ? 1 : (h - 56) / (contentBottom - contentTop);
  const fx = labels ? 232 : 300;
  const fy = (labels ? 30 : 34) - contentTop * k;
  const toFrameX = (X: number) => (X - fx) / k;

  const rs = riser(riserLen, { breakAt: labels ? riserLen * 0.42 : riserLen * 0.5, hiddenSocket: true, detail });
  const spr = sprinkler(detail);
  const sets = compressionSets(detail, -toFrameX(0) + 8, toFrameX(w) + 8);

  const nozzle = { x: spr.nozzle.x, y: spr.nozzle.y + sprinklerSeat };
  const land = { x: toFrameX(labels ? 22 : 24), y: dims.ground };
  const sHatch = K * dims.barHalf + dims.plateHalf;

  const parts: Placed[] = [
    { id: 'ground', shapes: ground(toFrameX(0), toFrameX(w), dims.ground, [-sHatch + 4, sHatch]) },
    { id: 'legs', shapes: couplerLegs() },
    { id: 'stabilizer', shapes: stabilizer(detail) },
    ...sets.left,
    { id: 'coupler', shapes: coupler(detail) },
    ...sets.right,
    { id: 'latches', shapes: [...latch(-1, detail), ...latch(1, detail)] },
    { id: 'hidden', shapes: sets.hidden },
    { id: 'riser', shapes: rs.shapes, dy: riserSeat },
    { id: 'sprinkler', shapes: spr.shapes, dy: sprinklerSeat },
  ];

  const under: Shape[] = [sh(path('M', 0, contentTop - 12, 'V', dims.ground + 10), 'center')];
  const over: Shape[] = jet(nozzle, spr.dir, labels ? 170 : 190, land, detail);

  const callouts: Callout[] = [];
  if (labels) {
    const edge = toFrameX(w);
    const rowY = -104;
    const at = (n: number, from: Pt, to: Pt, viaEdge = false) => {
      over.push(...leader(viaEdge ? [from, { x: edge, y: to.y }] : [from, to]));
      callouts.push(
        viaEdge
          ? { kind: 'part', n, at: { x: w, y: fy + to.y * k }, edge: true }
          : { kind: 'part', n, at: { x: fx + to.x * k, y: fy + to.y * k } },
      );
    };
    const m = dims.mouthX;
    // the row above the right-hand compression set, then the edge column.
    // Pitch 46 units keeps two 24px sun-mode balloons apart in the narrowest
    // figure (≈ 296px wide); leaders fan out left to right, so none cross.
    const row = [76, 122, 168, 214];
    at(2, { x: dims.bellX + 10, y: -dims.bellR }, { x: row[0], y: rowY });
    at(6, { x: m + dims.flangeW / 2 - K * dims.flangeR * 0.3, y: -dims.flangeR }, { x: row[1], y: rowY });
    at(4, { x: m + dims.nutU + 10, y: -dims.nutR }, { x: row[2], y: rowY });
    at(5, { x: m + dims.ringU + dims.ringW / 2, y: -dims.ringR }, { x: row[3], y: rowY });
    at(3, { x: m + dims.nutU + dims.nutW + 40, y: -dims.pipeR }, { x: 0, y: rowY }, true);
    at(7, { x: rs.anchor.x, y: rs.anchor.y + riserSeat }, { x: 0, y: rs.anchor.y + riserSeat }, true);
    at(8, { x: spr.anchor.x, y: spr.anchor.y + sprinklerSeat }, { x: 0, y: spr.anchor.y + sprinklerSeat }, true);
    // the stabiliser's leader rises off its receding side into the clear
    // band between the pipe and the ground, so it never doubles the ground line
    const sideX = dims.plateHalf + K * dims.barHalf * 0.45;
    at(1, { x: sideX, y: dims.ground - 6 }, { x: 0, y: (dims.pipeR + dims.ground) / 2 + 2 }, true);
  }

  return { w, h, frame: { x: fx, y: fy, k }, under, parts, over, callouts };
}

/**
 * Exploded storyboard – the guide's five steps, on two assembly axes:
 *   01  the coupler drops onto the stabiliser, held by 2 bolts;
 *   02  grey nut, white ring and closing hoop slide onto the pipe, in order;
 *   03  the pipe pushes ≈ 5 cm into the mouth, to the stop, and the key
 *       turns the hoop closed;
 *   04  the riser screws into the coupler's boss;
 *   05  the sprinkler screws into the riser.
 * Each motion carries a cue (chevron or turn arrow) and its step tag. The
 * far mouth is left open: it takes the next length of lateral the same way.
 */
export function explodedLayout(): Layout {
  const detail: Detail = 'full';
  const lift = 50; // the coupler, lifted off the stabiliser (step 01)
  const gap = 22;
  const riserLen = 120;
  const boss = -lift + dims.bossTop;
  const riserSeat = boss - gap - dims.maleLen;
  const sprSeat = riserSeat - riserLen - gap - 14;
  const top = sprSeat - dims.sprinklerH;
  const bottom = dims.ground + 8;

  const w = 520;
  const fx = 150;
  const fy = 26 - top;
  const h = Math.round(fy + bottom + 16);

  // the pipe and its compression set, pulled back along the pipe axis
  const m = dims.mouthX;
  const end = m + 36; // pipe end (chamfered)
  const mark = end + dims.stop; // ≈ 5 cm: where the hoop's flange will sit
  const hoopAt = mark + 18;
  const ringAt = hoopAt + dims.flangeW + dims.neckW + 18;
  const nutAt = ringAt + dims.ringW + 18;
  const hp = hoop(hoopAt, 1, detail);
  const pipeEndRight = w - fx + 8;
  const ax = -lift; // pipe axis height

  const rs = riser(riserLen, { breakAt: riserLen * 0.48, male: true, detail });
  const spr = sprinkler(detail, { male: true });

  const parts: Placed[] = [
    {
      id: 'ground',
      shapes: ground(-112, 116, dims.ground, [
        -K * dims.barHalf - dims.plateHalf + 4,
        K * dims.barHalf + dims.plateHalf,
      ]),
    },
    { id: 'stabilizer', shapes: stabilizer(detail) },
    { id: 'legs', shapes: couplerLegs(), dy: -lift },
    { id: 'coupler', shapes: [...coupler(detail), ...latch(-1, detail), ...latch(1, detail)], dy: -lift },
    { id: 'pipe-a', shapes: pipe(end, hoopAt, detail, { chamfer: true, mark }), dy: ax },
    { id: 'hoop', shapes: [...hp.flange, ...hp.neck], dy: ax },
    { id: 'pipe-b', shapes: pipe(hoopAt + dims.flangeW + dims.neckW, ringAt, detail), dy: ax },
    { id: 'ring', shapes: ring(ringAt, detail), dy: ax },
    { id: 'pipe-c', shapes: pipe(ringAt + dims.ringW, nutAt, detail), dy: ax },
    { id: 'nut', shapes: nut(nutAt, detail), dy: ax },
    { id: 'pipe-d', shapes: pipe(nutAt + dims.nutW, pipeEndRight, detail), dy: ax },
    { id: 'key', shapes: key(detail), dx: hoopAt + dims.flangeW / 2, dy: ax - dims.flangeR - 9, rotate: 24 },
    { id: 'riser', shapes: rs.shapes, dy: riserSeat },
    { id: 'sprinkler', shapes: spr.shapes, dy: sprSeat },
  ];

  const under: Shape[] = [
    sh(path('M', 0, top - 14, 'V', dims.ground + 8), 'axis'),
    sh(path('M', -m - 30, ax, 'H', pipeEndRight), 'axis'),
  ];

  const legsBottom = -lift + dims.legBottom;
  const cues = [
    chevron(-K * 20, (legsBottom + dims.boxTop) / 2, 'down'), // 01
    chevron(0, (boss + riserSeat + dims.maleLen) / 2, 'down'), // 04
    chevron(0, (riserSeat - riserLen + sprSeat + 14) / 2, 'down'), // 05
    chevron((m + end) / 2 - 2, ax, 'left'), // 03 – into the mouth
    chevron((mark + hoopAt) / 2, ax, 'left'), // 02 – slide on, in order
    chevron(hoopAt + dims.flangeW + dims.neckW + 9, ax, 'left'),
    chevron(ringAt + dims.ringW + 9, ax, 'left'),
    turnArrow(0, riserSeat + dims.maleLen * 0.45, 25, 6), // 04 – screw in
    turnArrow(0, sprSeat + 7, 25, 6), // 05 – screw in
  ];
  const over: Shape[] = [sh(cues.join(' '), 'cue')];
  // ≈ 5 cm from the chamfered end to the witness mark
  const dimY = ax + dims.pipeR + 13;
  over.push(sh(dimension(end, mark, dimY, ax + dims.pipeR + 3), 'fine'));

  const tag = (n: number, x: number, y: number): Callout => ({ kind: 'step', n, at: { x: fx + x, y: fy + y } });
  const callouts: Callout[] = [
    tag(1, 46, (legsBottom + dims.boxTop) / 2),
    tag(2, ringAt + dims.ringW + 9, ax - dims.nutR - 30),
    tag(3, (m + end) / 2 + 2, ax - dims.flangeR - 16),
    tag(4, 46, (boss + riserSeat + dims.maleLen) / 2),
    tag(5, 46, (riserSeat - riserLen + sprSeat + 14) / 2),
    { kind: 'note', id: 'insert', at: { x: fx + (end + mark) / 2, y: fy + dimY + 10 } },
  ];

  return { w, h, frame: { x: fx, y: fy, k: 1 }, under, parts, over, callouts };
}

/* ───────────────────────────── content ───────────────────────────── */

/** Rich text: plain Hebrew runs and numbers/codes (rendered through <Num>). */
export type Text = ReadonlyArray<string | { num: string }>;

const NB = ' ';

/**
 * The installed parts, numbered in the order of the client's own list
 * („מרכיבי עמדת ההשקיה”). The key (מפתח עשושית) is a tool, not an installed
 * part: it appears in the storyboard at step 03.
 */
export const ashushitParts: ReadonlyArray<{ n: number; id: string; name: Text; spec?: Text }> = [
  { n: 1, id: 'stabilizer', name: ['מייצב'] },
  {
    n: 2,
    id: 'coupler',
    name: ['מצמד עשושית'],
    spec: [{ num: '2' }, `${NB}אטמים · `, { num: '4' }, `${NB}תפסנים · הברגה פנימית `, { num: '3/4״' }, ' · מעצורים'],
  },
  { n: 3, id: 'pipe', name: ['צינור פוליאתילן ', { num: '50' }, `${NB}מ״מ`] },
  { n: 4, id: 'nut', name: ['אום אפור'] },
  { n: 5, id: 'ring', name: ['טבעת לבנה'], spec: ['בתוך האום'] },
  { n: 6, id: 'hoop', name: ['חישוק עגול סוגר'] },
  { n: 7, id: 'riser', name: ['זקף משושה UV שחור ', { num: '3/4״' }] },
  { n: 8, id: 'sprinkler', name: ['ממטיר ', { num: 'AR044' }] },
];

/** The guide's five assembly steps, in the house voice (plural imperative). */
export const ashushitSteps: ReadonlyArray<{ n: number; text: Text }> = [
  { n: 1, text: ['הרכיבו את מצמד העשושית על המייצב ב־', { num: '2' }, `${NB}ברגים.`] },
  {
    n: 2,
    text: ['השחילו על צינור הפוליאתילן, לפי הסדר: אום אפור, טבעת לבנה, חישוק עגול סוגר. הצינור מגיע עם פאזה בקצה.'],
  },
  {
    n: 3,
    text: [
      'דחפו את הצינור כ־',
      { num: '5' },
      `${NB}ס״מ פנימה, עד המעצור, וסובבו את החישוק העגול הסוגר במפתח העשושית עד לסגירה מלאה.`,
    ],
  },
  { n: 4, text: ['הבריגו את הזקף לתוך מצמד העשושית.'] },
  { n: 5, text: ['הבריגו את הממטיר לתוך הזקף.'] },
];
