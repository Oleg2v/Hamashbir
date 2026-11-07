/**
 * Pre-cuts every photo in public/images to WebP at each next/image candidate
 * width (src/lib/image-widths.ts), so the static export serves responsive
 * images without a server-side optimiser. Skips files that are up to date.
 *
 *   npm run images
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { allWidths, variantPath, webpQuality } from '../src/lib/image-widths';

const root = join(__dirname, '..');
const dirs = ['public/images/aerial'];

async function main() {
  let made = 0;
  let kept = 0;
  for (const dir of dirs) {
    const abs = join(root, dir);
    mkdirSync(join(abs, '_w'), { recursive: true });
    for (const name of readdirSync(abs)) {
      if (!/\.(jpe?g|png)$/i.test(name)) continue;
      const src = join(abs, name);
      const srcTime = statSync(src).mtimeMs;
      const meta = await sharp(src).metadata();
      for (const w of allWidths) {
        const out = join(root, 'public', variantPath(`/${dir.replace(/^public\//, '')}/${name}`, w));
        try {
          if (statSync(out).mtimeMs >= srcTime) {
            kept++;
            continue;
          }
        } catch {
          /* missing: cut it */
        }
        await sharp(src)
          .resize({ width: Math.min(w, meta.width ?? w), withoutEnlargement: true })
          .webp({ quality: webpQuality, effort: 5 })
          .toFile(out);
        made++;
      }
    }
  }
  console.log(`images: ${made} cut, ${kept} up to date`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
