/** Colour maths for documentation: WCAG 2 contrast and OKLCH readouts. */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export type Grade = 'AAA' | 'AA' | 'AA18' | 'fail';

/** Grade for normal text (AA ≥ 4.5, AAA ≥ 7); AA18 = large/bold text or UI only (≥ 3). */
export function grade(ratio: number): Grade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA18';
  return 'fail';
}

/** sRGB hex → OKLCH (L 0–1, C, H degrees). */
export function toOklch(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

export function oklchString(hex: string) {
  const { L, C, H } = toOklch(hex);
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;
}

export function rgbString(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => Math.round(c * 255));
  return `${r} ${g} ${b}`;
}

/* ── OKLab mixing (used for NDVI ramp sampling) ── */

const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
}

function fromOklab([L, A, B]: readonly [number, number, number]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    '#' +
    rgb
      .map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** Mix two hex colours in OKLab, t ∈ [0, 1]. */
export function mixOklab(a: string, b: string, t: number) {
  const x = toOklab(a);
  const y = toOklab(b);
  return fromOklab([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/**
 * Mix two hex colours in OKLCH along the shorter hue arc — the same space as
 * CSS `linear-gradient(in oklch, …)`, so sampled tiles match the CSS ramp.
 */
export function mixOklch(a: string, b: string, t: number) {
  const [L1, A1, B1] = toOklab(a);
  const [L2, A2, B2] = toOklab(b);
  const C1 = Math.hypot(A1, B1);
  const C2 = Math.hypot(A2, B2);
  const H1 = Math.atan2(B1, A1);
  let H2 = Math.atan2(B2, A2);
  let dH = H2 - H1;
  if (dH > Math.PI) dH -= 2 * Math.PI;
  if (dH < -Math.PI) dH += 2 * Math.PI;
  H2 = H1 + dH * t;
  const L = L1 + (L2 - L1) * t;
  const C = C1 + (C2 - C1) * t;
  return fromOklab([L, C * Math.cos(H2), C * Math.sin(H2)]);
}

/** Sample a ramp of { at, hex } stops at value v (flat outside the end stops), in OKLCH. */
export function sampleRamp(stops: ReadonlyArray<{ at: number; hex: string }>, v: number) {
  if (v <= stops[0].at) return stops[0].hex.toUpperCase();
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i].at) {
      const a = stops[i - 1];
      const b = stops[i];
      return mixOklch(a.hex, b.hex, (v - a.at) / (b.at - a.at));
    }
  }
  return stops[stops.length - 1].hex.toUpperCase();
}
