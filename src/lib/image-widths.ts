/**
 * The candidate widths next/image may ask for, shared by next.config.ts and
 * scripts/build-images.ts. The site is a static export, so there is no image
 * optimiser at request time: every photo is pre-cut to each of these widths
 * (never upscaled – a width above the original holds the original size) and
 * src/lib/image-loader.ts points srcset at those files.
 */
export const deviceSizes = [640, 828, 1080, 1280, 1600, 1920, 2400];
export const imageSizes = [256, 384];
export const allWidths = [...imageSizes, ...deviceSizes];

/** WebP quality of the pre-cut files (next/image's default is 75). */
export const webpQuality = 74;

/** /images/aerial/x.jpg → /images/aerial/_w/x-<width>.webp */
export function variantPath(src: string, width: number) {
  const m = src.match(/^(.*)\/([^/]+)\.(?:jpe?g|png)$/i);
  return m ? `${m[1]}/_w/${m[2]}-${width}.webp` : src;
}
