import { ndviProxy } from '@/data/imagery';
import { hexToRgb, sampleRamp } from '@/design/color';
import { ndvi, palette } from '@/design/tokens';

/**
 * The two photo treatments as SVG filters, built from tokens at render time
 * (no colour is written by hand). CSS applies them to the next/image <img>
 * with `filter: url(#…)`; the filters work in sRGB so the tables map the
 * pixel values exactly as written.
 *
 * - soil grade: luminance with levels → a two-stop table from Soil to Paper.
 * - NDVI stand-in: ExG = 2G − R − B, scaled by ndviProxy, through the NDVI
 *   ramp sampled in OKLCH (the same sampler as the palette's heat map).
 */
export const FILTER_ID = { soil: 'st-img-soil', ndvi: 'st-img-ndvi' } as const;

/** Levels for the soil grade: luminance below `black` is all Soil, above `white` all Paper. */
export const soilGrade = { black: 0.05, white: 0.85 } as const;

/** Rec. 709 luma weights. */
const LUMA = [0.2126, 0.7152, 0.0722] as const;
const RAMP_SAMPLES = 33;

const n4 = (v: number) => String(Number(v.toFixed(4)));

/** Three identical colour rows (one value per channel) plus an untouched alpha row. */
function greyMatrix(row: readonly number[]) {
  const r = row.map(n4).join(' ');
  return `${r} ${r} ${r} 0 0 0 1 0`;
}

function soilMatrix() {
  const s = 1 / (soilGrade.white - soilGrade.black);
  return greyMatrix([LUMA[0] * s, LUMA[1] * s, LUMA[2] * s, 0, -soilGrade.black * s]);
}

function ndviMatrix() {
  const { k, c } = ndviProxy;
  return greyMatrix([-k, 2 * k, -k, 0, c]);
}

/** feFuncR/G/B tables: the ramp sampled at 33 evenly spaced values from 0 to 1. */
function rampTables() {
  const rgb = Array.from({ length: RAMP_SAMPLES }, (_, i) => hexToRgb(sampleRamp(ndvi.stops, i / (RAMP_SAMPLES - 1))));
  return [0, 1, 2].map((ch) => rgb.map((c) => n4(c[ch])).join(' '));
}

export function ImageFilters() {
  const soil = hexToRgb(palette.soil.hex);
  const paper = hexToRgb(palette.paper.hex);
  const [rampR, rampG, rampB] = rampTables();
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute overflow-hidden"
    >
      <filter id={FILTER_ID.soil} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={soilMatrix()} />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={`${n4(soil[0])} ${n4(paper[0])}`} />
          <feFuncG type="table" tableValues={`${n4(soil[1])} ${n4(paper[1])}`} />
          <feFuncB type="table" tableValues={`${n4(soil[2])} ${n4(paper[2])}`} />
        </feComponentTransfer>
      </filter>
      <filter id={FILTER_ID.ndvi} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={ndviMatrix()} />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={rampR} />
          <feFuncG type="table" tableValues={rampG} />
          <feFuncB type="table" tableValues={rampB} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
