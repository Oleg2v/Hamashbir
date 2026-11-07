import { variantPath } from './image-widths';

/**
 * next/image loader for the static export: maps each srcset candidate to the
 * WebP file scripts/build-images.ts cut for that width.
 */
export default function staticImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  return variantPath(src, width);
}
