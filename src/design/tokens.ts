/**
 * העונה שלך – design tokens. Single source of truth.
 *
 * `npm run tokens` (scripts/build-tokens.ts) compiles this file into
 * src/styles/tokens.css (Tailwind v4 @theme + semantic surface variables).
 * /style-tile renders its documentation from these same objects, so what the
 * style tile shows is exactly what ships. JS consumers (GSAP, three.js shaders,
 * charts) import from here too – never hard-code a hex or a duration.
 *
 * Keep this file dependency-free: the build script imports it directly.
 */

/* ───────────────────────────── Palette ───────────────────────────── */

export const palette = {
  soil: { hex: '#1D1813', he: 'אדמה', en: 'Soil', role: 'רקע קולנועי, טקסט ראשי' },
  loam: { hex: '#3A2E22', he: 'רגב', en: 'Loam', role: 'משטחים על אדמה, קווי מתאר' },
  paper: { hex: '#F5F1E8', he: 'נייר', en: 'Paper', role: 'רקע האפליקציה, טקסט על אדמה' },
  field: { hex: '#2E6B3A', he: 'שדה', en: 'Field Green', role: 'קישורים, שלב ההגנה, חופה מלאה' },
  sprout: { hex: '#B7E04A', he: 'נבט', en: 'Sprout', role: 'צבע ההדגשה הראשי · כפתור פעולה על אדמה' },
  water: { hex: '#3FA9F5', he: 'מים', en: 'Water Blue', role: 'השקיה, ורק השקיה' },
  harvest: { hex: '#E2483A', he: 'קטיף', en: 'Harvest Red', role: 'פרי, שגיאה, שלב הקטיף' },
  wheat: { hex: '#E6C66E', he: 'חיטה', en: 'Wheat', role: 'שלב האריזה, קרטון' },
} as const;

export type PaletteKey = keyof typeof palette;

/**
 * Usage proportions – how much of a typical screen each colour may occupy.
 * Sprout is an accent, not a fill: if it covers more than ~5% it stops
 * meaning "act here".
 */
export const proportions: Array<{ key: PaletteKey; share: number }> = [
  { key: 'paper', share: 52 },
  { key: 'soil', share: 24 },
  { key: 'loam', share: 9 },
  { key: 'field', share: 6 },
  { key: 'sprout', share: 4 },
  { key: 'water', share: 3 },
  { key: 'wheat', share: 1 },
  { key: 'harvest', share: 1 },
];

/**
 * NDVI ramp – the data motif. Anchors sit where real readings sit: bare soil
 * ≈ 0.1, sparse cover ≈ 0.35, active growth ≈ 0.6, dense canopy ≈ 0.85
 * (1.0 is never reached in a field). Flat colour outside the anchors.
 * Interpolated in OKLCH so the mid-tones stay luminous instead of muddy.
 */
export const ndvi = {
  stops: [
    { at: 0.1, hex: palette.harvest.hex, label: 'אדמה חשופה' },
    { at: 0.35, hex: palette.wheat.hex, label: 'צמחייה דלילה' },
    { at: 0.6, hex: palette.sprout.hex, label: 'צמיחה פעילה' },
    { at: 0.85, hex: palette.field.hex, label: 'חופה מלאה' },
  ],
  ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
} as const;

/** The season spine – five stages, one colour each, used everywhere. */
export const stages = [
  { id: 'sow', he: 'זריעה', en: 'Sow', color: 'sprout', dept: 'זרעים ושתילים' },
  // Department names are proper nouns, verbatim from hamashbir.co.il
  // (running text keeps the Academy spelling השקיה).
  { id: 'irrigate', he: 'השקיה', en: 'Irrigate', color: 'water', dept: 'השקייה ותשתיות' },
  { id: 'protect', he: 'הגנה', en: 'Protect', color: 'field', dept: 'הדברה ודשנים' },
  { id: 'harvest', he: 'קטיף', en: 'Harvest', color: 'harvest', dept: 'ציוד טכני' },
  { id: 'pack', he: 'אריזה', en: 'Pack', color: 'wheat', dept: 'אריזות וקרטונים' },
] as const satisfies ReadonlyArray<{
  id: string;
  he: string;
  en: string;
  color: PaletteKey;
  dept: string;
}>;

export type StageId = (typeof stages)[number]['id'];

/* ─────────────────────── Semantic surfaces ─────────────────────── */

/**
 * Every component reads semantic variables only. A `data-surface` attribute
 * swaps the whole set locally (nested surfaces just work, because custom
 * properties inherit). Sun mode overrides every surface at once.
 * All text pairs below are ≥ 4.5:1, all `lineStrong` pairs ≥ 3:1 – see the
 * contrast matrix on /style-tile.
 */
export const surfaces = {
  paper: {
    canvas: '#F5F1E8',
    surface: '#FBF9F4',
    sunken: '#ECE6D9',
    input: '#FFFDF9',
    ink: '#1D1813',
    ink2: '#5E5246',
    ink3: '#6B5F52',
    line: 'rgb(29 24 19 / 0.12)',
    lineStrong: '#857868',
    tintHover: 'rgb(29 24 19 / 0.05)',
    tintPress: 'rgb(29 24 19 / 0.09)',
    focus: '#1D1813',
    link: '#2E6B3A',
    sproutInk: '#2E6B3A',
    waterInk: '#0F65A6',
    harvestInk: '#B42E22',
    wheatInk: '#7A5A10',
    cta: '#1D1813',
    ctaInk: '#F5F1E8',
    bud: '#B7E04A',
    budInk: '#1D1813',
    inverse: '#1D1813',
    inverseInk: '#F5F1E8',
    elevRaised: '0 1px 0 rgb(29 24 19 / 0.04), 0 1px 2px rgb(29 24 19 / 0.06), 0 6px 16px -6px rgb(29 24 19 / 0.12)',
    elevFloat: '0 2px 4px rgb(29 24 19 / 0.06), 0 16px 40px -12px rgb(29 24 19 / 0.28)',
    elevOverlay: '0 32px 80px -24px rgb(29 24 19 / 0.45)',
    elevInset: 'inset 0 1px 2px rgb(29 24 19 / 0.08)',
  },
  soil: {
    canvas: '#1D1813',
    surface: '#261F19',
    sunken: '#15110D',
    input: '#2A221B',
    ink: '#F5F1E8',
    ink2: '#CFC6B6',
    ink3: '#A99E8D',
    line: 'rgb(245 241 232 / 0.12)',
    lineStrong: '#7D7262',
    tintHover: 'rgb(245 241 232 / 0.06)',
    tintPress: 'rgb(245 241 232 / 0.11)',
    focus: '#B7E04A',
    link: '#B7E04A',
    sproutInk: '#B7E04A',
    waterInk: '#3FA9F5',
    harvestInk: '#F06A5D',
    wheatInk: '#E6C66E',
    cta: '#B7E04A',
    ctaInk: '#1D1813',
    bud: '#F5F1E8',
    budInk: '#1D1813',
    inverse: '#F5F1E8',
    inverseInk: '#1D1813',
    elevRaised: 'inset 0 1px 0 rgb(245 241 232 / 0.05), 0 1px 2px rgb(0 0 0 / 0.4)',
    elevFloat: 'inset 0 1px 0 rgb(245 241 232 / 0.06), 0 18px 44px -12px rgb(0 0 0 / 0.7)',
    elevOverlay: '0 32px 80px -24px rgb(0 0 0 / 0.8)',
    elevInset: 'inset 0 1px 2px rgb(0 0 0 / 0.35)',
  },
  /** מצב שמש – outdoor, noon, gloves. Max contrast, no shadows, 2px lines. */
  sun: {
    canvas: '#FFFFFF',
    surface: '#FFFFFF',
    sunken: '#F1F1F1',
    input: '#FFFFFF',
    ink: '#000000',
    ink2: '#1D1813',
    ink3: '#3A2E22',
    line: '#000000',
    lineStrong: '#000000',
    tintHover: 'rgb(0 0 0 / 0.06)',
    tintPress: 'rgb(0 0 0 / 0.12)',
    focus: '#000000',
    link: '#000000',
    sproutInk: '#245C30',
    waterInk: '#004F8C',
    harvestInk: '#9E1B12',
    wheatInk: '#634700',
    cta: '#000000',
    ctaInk: '#FFFFFF',
    bud: '#B7E04A',
    budInk: '#000000',
    inverse: '#000000',
    inverseInk: '#FFFFFF',
    elevRaised: '0 0 0 2px #000000',
    elevFloat: '0 0 0 2px #000000',
    elevOverlay: '0 0 0 3px #000000',
    elevInset: 'inset 0 0 0 2px #000000',
  },
} as const;

export type SurfaceKey = keyof typeof surfaces;
export type SemanticKey = keyof (typeof surfaces)['paper'];

/** Ergonomics that change in sun mode. */
export const ergonomics = {
  default: { target: 44, targetLg: 56, borderWidth: 1, focusWidth: 3, focusOffset: 2 },
  sun: { target: 56, targetLg: 64, borderWidth: 2, focusWidth: 4, focusOffset: 3 },
} as const;

/* ───────────────────────────── Typography ───────────────────────────── */

export const fonts = {
  display: {
    family: 'Suez One',
    variable: '--font-suez',
    fallback: "'Frank Ruhl Libre', 'David Libre', serif",
    role: 'כותרות בלבד · משלב title ומעלה (25px+) · לעולם לא בגוף טקסט',
  },
  sans: {
    family: 'Assistant',
    variable: '--font-assistant',
    fallback: "'Rubik', 'Segoe UI', system-ui, sans-serif",
    role: 'ממשק וגוף טקסט · 400 / 600 / 700 / 800',
  },
  mono: {
    family: 'IBM Plex Mono',
    variable: '--font-plex-mono',
    fallback: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
    role: 'כמויות, דונמים, מחירים, קואורדינטות, מק״טים',
  },
} as const;

/**
 * Fluid type scale. Min side: 16px × 1.25 (major third) at a 360px viewport.
 * Max side: 18px × 1.414 (augmented fourth) at 1440px. The two smallest steps
 * are floored for legibility in the field. Every step keeps max/min ≤ 2.5, so
 * 200% browser zoom still enlarges text (WCAG 1.4.4).
 */
export const typeViewport = { min: 360, max: 1440 } as const;

export const typeScale = [
  { step: -2, name: 'micro', min: 13, max: 14, leading: 1.45, tracking: '0', use: 'קרדיטים, הערות משפטיות' },
  { step: -1, name: 'caption', min: 14, max: 16, leading: 1.5, tracking: '0', use: 'תוויות, צ׳יפים, מטא' },
  { step: 0, name: 'body', min: 16, max: 18, leading: 1.6, tracking: '0', use: 'גוף טקסט, שדות קלט' },
  { step: 1, name: 'lead', min: 20, max: 25, leading: 1.45, tracking: '0', use: 'פתיח, כפתור גדול' },
  { step: 2, name: 'title', min: 25, max: 36, leading: 1.2, tracking: '0', use: 'כותרת כרטיס' },
  { step: 3, name: 'h3', min: 31, max: 51, leading: 1.08, tracking: '-0.005em', use: 'כותרת משנה' },
  { step: 4, name: 'h2', min: 39, max: 72, leading: 1.02, tracking: '-0.01em', use: 'כותרת מקטע' },
  { step: 5, name: 'h1', min: 49, max: 102, leading: 0.98, tracking: '-0.015em', use: 'כותרת עמוד' },
  { step: 6, name: 'display', min: 61, max: 144, leading: 0.94, tracking: '-0.02em', use: 'מסך הפתיחה · רגע החתימה' },
] as const;

export type TypeStepName = (typeof typeScale)[number]['name'];

/**
 * Poster: the one hero headline per page. Deliberately outside the nine-step
 * UI scale (which stays closed); still ≤ 2.5× min→max so zoom keeps working.
 */
export const posterType = { name: 'poster', min: 128, max: 220, leading: 0.9, tracking: '-0.025em' } as const;

/** Sun mode: nothing smaller than 15px under a noon sky. */
export const sunTypeFloor: Partial<Record<TypeStepName, [number, number]>> = {
  micro: [15, 15],
  caption: [16, 17],
  body: [18, 19],
  lead: [21, 25],
};

const round = (n: number, d = 4) => Number(n.toFixed(d));

/** Utopia-style clamp(): rem intercept + vw slope, so zoom still works. */
export function fluidClamp(
  minPx: number,
  maxPx: number,
  vmin: number = typeViewport.min,
  vmax: number = typeViewport.max,
): string {
  if (minPx === maxPx) return `${round(minPx / 16)}rem`;
  const slope = (maxPx - minPx) / (vmax - vmin);
  const intercept = minPx - slope * vmin;
  return `clamp(${round(minPx / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(maxPx / 16)}rem)`;
}

/* ───────────────────────────── Space & shape ───────────────────────────── */

/** 4px grid. Key = Tailwind multiplier (p-6 = 24px), value = px. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
} as const;

export const layout = {
  maxWidth: 1440,
  /** [min-width breakpoint px, page margin px, gutter px, columns] */
  grid: [
    { from: 0, margin: 16, gutter: 16, columns: 4, label: 'נייד' },
    { from: 640, margin: 24, gutter: 16, columns: 8, label: 'טאבלט' },
    { from: 1024, margin: 48, gutter: 24, columns: 12, label: 'דסקטופ' },
    { from: 1280, margin: 64, gutter: 24, columns: 12, label: 'רחב' },
  ],
  section: { mobile: 80, tablet: 112, desktop: 128 },
} as const;

export const radii = {
  none: { px: 0, use: 'שורות טבלה, תמונות אוויר' },
  xs: { px: 4, use: 'תגיות, קוד' },
  sm: { px: 8, use: 'תפריטים, תאים' },
  md: { px: 12, use: 'שדות קלט' },
  lg: { px: 20, use: 'כרטיסים, טוסטים' },
  xl: { px: 32, use: 'גיליונות, מודאלים' },
  full: { px: 9999, use: 'כפתורים, צ׳יפים' },
} as const;

export const elevations = [
  { name: 'raised', varName: 'elevRaised', he: 'מורם', use: 'כרטיסים, שורות פעילות' },
  { name: 'float', varName: 'elevFloat', he: 'צף', use: 'תפריטים, טוסטים, מגנטי' },
  { name: 'overlay', varName: 'elevOverlay', he: 'שכבה', use: 'מודאלים, גיליונות' },
  { name: 'inset', varName: 'elevInset', he: 'שקוע', use: 'שדות קלט, תאים שקועים' },
] as const;

/** Emissive glows – light as information (water = blue light). */
export const glows = {
  sprout: '0 0 0 1px rgb(183 224 74 / 0.55), 0 0 28px 2px rgb(183 224 74 / 0.32)',
  water: '0 0 0 1px rgb(63 169 245 / 0.55), 0 0 28px 2px rgb(63 169 245 / 0.42)',
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  header: 200,
  overlay: 300,
  toast: 400,
  badge: 500,
  skip: 600,
} as const;

/* ───────────────────────────── Motion ───────────────────────────── */

/** Durations in ms. Organic but precise: nothing UI-level exceeds 400ms. */
export const durations = {
  instant: { ms: 80, use: 'לחיצה, החלפת מצב' },
  fast: { ms: 160, use: 'ריחוף, צבע, יציאה' },
  base: { ms: 240, use: 'מעברי ממשק' },
  slow: { ms: 400, use: 'פאנלים, מילוי CTA' },
  grow: { ms: 720, use: 'חשיפה, צמיחת נתונים' },
  season: { ms: 1200, use: 'פרילואדר, רגעי חתימה' },
} as const;

export type DurationKey = keyof typeof durations;

type Bezier = readonly [number, number, number, number];

export const easings = {
  'out-quint': {
    pace: 'base' as DurationKey,
    bezier: [0.22, 1, 0.36, 1] as Bezier,
    gsap: 'power4.out',
    he: 'ברירת המחדל של הממשק',
    use: 'תגובות, ריחוף, כניסות',
  },
  'out-expo': {
    pace: 'season' as DurationKey,
    bezier: [0.16, 1, 0.3, 1] as Bezier,
    gsap: 'expo.out',
    he: 'חשיפה גדולה',
    use: 'כניסת עמוד, ספירת מספרים',
  },
  'in-out-quart': {
    pace: 'grow' as DurationKey,
    bezier: [0.76, 0, 0.24, 1] as Bezier,
    gsap: 'power3.inOut',
    he: 'תנועת מצלמה',
    use: 'מעברי עמוד, סצנות גלילה',
  },
  'in-quint': {
    pace: 'fast' as DurationKey,
    bezier: [0.64, 0, 0.78, 0] as Bezier,
    gsap: 'power4.in',
    he: 'יציאה בלבד',
    use: 'סגירת טוסט, הסתרה – תמיד קצר',
  },
  growth: {
    pace: 'grow' as DurationKey,
    bezier: [0.6, 0, 0.2, 1] as Bezier,
    gsap: 'CustomEase("growth", "M0,0 C0.6,0 0.2,1 1,1")',
    he: 'עקומת צמיחה',
    use: 'נביטה, מילוי פסים, סריקת NDVI',
  },
} as const;

export type EasingKey = keyof typeof easings | 'spring';

export const bezierCss = (b: Bezier) => `cubic-bezier(${b.join(', ')})`;

/**
 * A damped spring sampled into CSS linear(). Used only for the magnetic CTA
 * returning to rest. ζ = 0.55 → ~12% overshoot, settles inside 800ms.
 */
export function springLinear({ zeta = 0.55, durationMs = 800, samples = 40 } = {}) {
  const T = durationMs / 1000;
  const omega = 6 / (zeta * T); // settled (<0.3%) by T, so the curve lands cleanly on 1
  const omegaD = omega * Math.sqrt(1 - zeta * zeta);
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * T;
    const x =
      1 - Math.exp(-zeta * omega * t) * (Math.cos(omegaD * t) + ((zeta * omega) / omegaD) * Math.sin(omegaD * t));
    const v = i === samples ? 1 : round(x, 3);
    const pct = round((i / samples) * 100, 1);
    pts.push(i === 0 ? '0' : i === samples ? '1' : `${v} ${pct}%`);
  }
  return { css: `linear(${pts.join(', ')})`, durationMs };
}

const springSamples = springLinear();

/** GSAP CustomEase path traced from the same samples as the CSS linear(). */
function springGsapPath(samples = 40) {
  const { css } = springSamples;
  const pts = css
    .slice(7, -1)
    .split(', ')
    .map((p, i, all) => {
      const [v, pct] = p.split(' ');
      const x = pct ? parseFloat(pct) / 100 : i === 0 ? 0 : i === all.length - 1 ? 1 : i / samples;
      return `${round(x, 3)},${v}`;
    });
  return `M${pts[0]} L${pts.slice(1).join(' ')}`;
}

export const spring = {
  ...springSamples,
  pace: 'spring' as const,
  gsapPath: springGsapPath(),
  gsap: 'CustomEase("spring", spring.gsapPath)',
  he: 'קפיץ',
  use: 'חזרת CTA מגנטי למקום',
} as const;

/** Magnetic CTA tuning — what the style tile documents is what <Magnetic> runs. */
export const magnet = { strength: 0.32, max: 10, reach: 1.6 } as const;

/** Row-by-row growth: 40ms between rows, never more than 480ms in total. */
export const stagger = { stepMs: 40, maxTotalMs: 480 } as const;

export function staggerDelay(index: number, count: number) {
  const step = Math.min(stagger.stepMs, stagger.maxTotalMs / Math.max(1, count - 1));
  return Math.round(index * step);
}
