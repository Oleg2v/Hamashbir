/**
 * Aerial photography for the style tile: placeholders from free libraries,
 * credited on the page. Stage 1 replaces them with Sentinel-2 satellite tiles
 * and drone photos of the client's own farms (and a real Arava net house).
 *
 * Files live in public/images/aerial/: downloaded once, re-encoded to sRGB
 * progressive JPEG (mozjpeg q76–80, metadata stripped), at most 2400px wide,
 * 1,237,291 bytes for all three. next/image serves responsive WebP from them.
 *
 * Licences: the Unsplash License and the Pexels License both allow free
 * commercial use without required attribution. We credit anyway.
 */

export type PhotoSource = 'Unsplash' | 'Pexels';

export type AerialPhoto = {
  id: 'desert-edge' | 'orchard' | 'covered';
  src: string;
  /** real pixel size of the file in public/ */
  width: number;
  height: number;
  /** Hebrew description of what is in the frame */
  alt: string;
  title: string;
  /** why this frame fits the brief, one sentence */
  why: string;
  /** where it was taken, in Hebrew; omitted when the source does not say */
  place?: string;
  view: 'רחפן' | 'מטוס';
  photographer: string;
  source: PhotoSource;
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  /** what we changed after download */
  edit: string;
  /** focal point (object-position, % of the frame) used by every crop */
  focus: { x: number; y: number };
};

const UNSPLASH_LICENCE = { licence: 'Unsplash License', licenceUrl: 'https://unsplash.com/license' } as const;
const PEXELS_LICENCE = { licence: 'Pexels License', licenceUrl: 'https://www.pexels.com/license/' } as const;

export const desertEdge: AerialPhoto = {
  id: 'desert-edge',
  src: '/images/aerial/desert-edge-marrakesh.jpg',
  width: 2400,
  height: 1200,
  alt: 'צילום אוויר מגובה רב: מדבר חשוף בגווני חול, חצוי בערוצי ניקוז ובשבילים, נפגש באלכסון ברצועה של חלקות מעובדות ירוקות – מטעים, שורות וערוגות. בפינה התחתונה ערוץ נחל יבש וכהה.',
  title: 'שולי המדבר',
  why: 'חלקות מושקות לצד קרקע מדברית חשופה: גבול המים הוא גבול השדה. תמונה חלופית ממרוקו, לדפוס המוכר מהערבה.',
  place: 'מרקש, מרוקו',
  view: 'מטוס',
  photographer: 'Bernd Dittrich',
  source: 'Unsplash',
  sourceUrl: 'https://unsplash.com/photos/aerial-view-of-cultivated-fields-next-to-arid-land-Bv20r1rsuuk',
  ...UNSPLASH_LICENCE,
  edit: 'חיתוך ליחס 2:1 סביב קו המים',
  focus: { x: 50, y: 50 },
};

export const orchard: AerialPhoto = {
  id: 'orchard',
  src: '/images/aerial/orchard-ram-on.jpg',
  width: 1600,
  height: 1200,
  alt: 'צילום רחפן אנכי: בחצי השמאלי שדה חרוש בחום כהה עם תלמים ישרים ודקים; בחצי הימני מטע צעיר בשורות ישרות של עצים ירוקים; דרך עפר צרה ומתפתלת מפרידה ביניהם.',
  title: 'מטע מול שדה חרוש',
  why: 'שורות עצים, תלמים ודרך עפר אחת: הדפוס שחקלאי מזהה מיד, כי כך נראה המשק שלו במפה.',
  place: 'רם און, חבל תענך',
  view: 'רחפן',
  photographer: 'Oren Beitan',
  source: 'Pexels',
  sourceUrl: 'https://www.pexels.com/photo/birds-eye-view-of-rural-field-7106972/',
  ...PEXELS_LICENCE,
  edit: 'הקטנה בלבד',
  focus: { x: 50, y: 50 },
};

export const covered: AerialPhoto = {
  id: 'covered',
  src: '/images/aerial/covered-rows.jpg',
  width: 1600,
  height: 820,
  alt: 'צילום רחפן אנכי: עשרות מנהרות גידול ארוכות מכוסות יריעה לבנה, בשורות צפופות עם צללים קצרים בקצותיהן; מימין להן דרך עפר בהירה ושדה פתוח בירוק ובצהוב.',
  title: 'גידול מכוסה',
  why: 'מנהרות בשורות צפופות לצד שדה פתוח – הכי קרוב לבית רשת מלמעלה שיש בספריות הפתוחות. בשלב הבא: בית רשת אמיתי בערבה.',
  view: 'רחפן',
  photographer: 'Bernd Dittrich',
  source: 'Unsplash',
  sourceUrl: 'https://unsplash.com/photos/_HYeW1IQeTY',
  ...UNSPLASH_LICENCE,
  edit: 'חיתוך שמוציא מהפריים רוכב אופניים בדרך',
  focus: { x: 100, y: 50 },
};

export const aerialPhotos = [desertEdge, orchard, covered] as const;

/**
 * The NDVI stand-in. An RGB photo has no near-infrared band, so the tile
 * computes the excess-green index ExG = 2G − R − B per pixel (an SVG
 * feColorMatrix) and maps value = k · ExG + c through the NDVI ramp.
 * k and c were fitted on these three photos so bare soil lands near 0.1
 * and dense canopy near 0.85 (measured ExG: soil and desert −0.07…0.03,
 * crowns 0.15…0.31). The product reads real NDVI from Sentinel-2.
 */
export const ndviProxy = { k: 4, c: 0.16 } as const;

/**
 * Survey overlay on the orchard frame, in the file's own pixel space
 * (1600 × 1200). Measured on the image: the dirt track that separates the
 * two parcels, and the tree rows ~67px apart. At an assumed ~6 m between
 * rows that is ≈ 0.09 m per pixel, so the scale is approximate and says so.
 */
export const orchardSurvey = {
  /** centre line of the dirt track, top to bottom */
  boundary: [
    [805, 0],
    [808, 100],
    [816, 300],
    [823, 500],
    [819, 600],
    [811, 700],
    [805, 900],
    [800, 1100],
    [798, 1200],
  ],
  /** survey vertices on the boundary (its two ends in frame and the bend) */
  vertices: [
    [808, 100],
    [823, 500],
    [800, 1100],
  ],
  metresPerPx: 6 / 67,
  /** map grid every 40 m */
  gridM: 40,
  scaleBarM: 20,
  rowSpacingM: 6,
  /** mean of the NDVI stand-in over each side of the track (computed on the file);
   *  lettered in reading order, so א is the parcel on the right */
  parcels: [
    { id: 'א', name: 'מטע צעיר', index: 0.53, at: { x: 64, y: 58 } },
    { id: 'ב', name: 'שדה חרוש', index: 0.16, at: { x: 18, y: 16 } },
  ],
  coords: '32.53°N 35.26°E',
} as const;
