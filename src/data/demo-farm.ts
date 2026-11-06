/**
 * The one demo farm of the style tile. נתוני דמו — every figure here is
 * illustrative, and every screen that prints one carries a DemoTag.
 *
 * Persona: a pepper grower in an insect-proof net house in the Arava,
 * 3 km from the Ein Tamar branch. Every number on /style-tile that talks
 * about "the season" is derived from this module, so the page tells one
 * consistent story. (Stage 2 replaces this with crops.json coefficients.)
 */

export const demoFarm = {
  crop: 'פלפל',
  method: 'בית רשת',
  region: 'ערבה',
  area: 40, // דונם
  branch: { name: 'עין תמר', km: 3 },
  /** ~3 km south of the Ein Tamar branch (30.942°N 35.372°E). */
  coords: { lat: 30.92, lon: 35.37 },
} as const;

/** Demo per-dunam coefficients (נתוני דמו). */
export const coefficients = {
  plantsPerDunam: 2400, // שתילים — double rows on 1.6 m beds
  dripMetersPerDunam: 1250, // מ׳ שלוחת טפטוף — two laterals per bed
  yieldKgPerDunam: 8000, // ק״ג — net-house pepper, export grade
  cartonKg: 5, // the common Arava export carton
} as const;

const area = demoFarm.area;

/** Derived season quantities for the whole farm. */
export const season = {
  seedlings: coefficients.plantsPerDunam * area, // 96,000
  dripMeters: coefficients.dripMetersPerDunam * area, // 50,000
  yieldKg: coefficients.yieldKgPerDunam * area, // 320,000
  cartons: (coefficients.yieldKgPerDunam * area) / coefficients.cartonKg, // 64,000
} as const;

/** Demo unit prices, ₪ before VAT (מחירי דמו). */
export const prices = {
  seedling: 0.42,
  dripMeter: 0.36,
  carton: 1.3,
} as const;

export type PlanLine = {
  id: string;
  stage: 'sow' | 'irrigate' | 'protect' | 'harvest' | 'pack';
  /** Stage label for this crop: pepper is transplanted, so stage 1 reads שתילה. */
  stageLabel: string;
  /** Planned week — null for crop protection: timing is the agronomist's call. */
  week: number | null;
  product: string;
  qty: number | null;
  unit: string;
  unitPrice: number | null;
  stock: 'in' | 'low' | 'out' | 'gated';
};

/** Stage-1-to-5 plan lines for the demo farm (the PlanTable shows these). */
export const planLines: PlanLine[] = [
  {
    id: 'seedlings',
    stage: 'sow',
    stageLabel: 'שתילה',
    week: 1,
    product: 'שתילי פלפל, מגש 128',
    qty: season.seedlings,
    unit: 'שתילים',
    unitPrice: prices.seedling,
    stock: 'in',
  },
  {
    id: 'drip',
    stage: 'irrigate',
    stageLabel: 'השקיה',
    week: 1,
    product: 'שלוחת טפטוף 16 מ״מ',
    qty: season.dripMeters,
    unit: 'מ׳',
    unitPrice: prices.dripMeter,
    stock: 'in',
  },
  {
    id: 'fungicide',
    stage: 'protect',
    stageLabel: 'הגנה',
    week: null,
    product: 'קוטל פטריות – לפי המלצת אגרונום',
    qty: null,
    unit: '',
    unitPrice: null,
    stock: 'gated',
  },
  {
    id: 'cartons',
    stage: 'pack',
    stageLabel: 'אריזה',
    week: 14,
    product: `קרטון ייצוא לפלפל, ${coefficients.cartonKg} ק״ג`,
    qty: season.cartons,
    unit: 'קרטונים',
    unitPrice: prices.carton,
    stock: 'low',
  },
];

export const lineTotal = (l: PlanLine) => (l.qty != null && l.unitPrice != null ? l.qty * l.unitPrice : null);

export const pricedTotal = planLines.reduce((sum, l) => sum + (lineTotal(l) ?? 0), 0);

/** Other Hamashbir branches as seen from the demo farm (straight-line km, rounded). */
export const nearbyBranches = [
  { name: 'עין תמר', km: 3, stock: 'in' as const },
  { name: 'צופר', km: 45, stock: 'low' as const },
  { name: 'פארן', km: 65, stock: 'out' as const },
];

/** The brief's example stat: in stock at 14 of the network's points. */
export const dripAvailability = { branchesWithStock: 14, networkPoints: 21 } as const;
