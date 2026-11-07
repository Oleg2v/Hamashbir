import type { NextConfig } from 'next';
import { deviceSizes, imageSizes } from './src/lib/image-widths';

const dev = process.env.NODE_ENV !== 'production';

/**
 * A static export (out/), served on Cloudflare by an assets-only Worker
 * (wrangler.jsonc). What a server would otherwise do lives in public/:
 * _headers (noindex, nosniff, caching) and _redirects (/ → /style-tile).
 * Images are pre-cut to every srcset width (npm run images) and picked by a
 * custom loader, so next/image stays responsive without an optimiser.
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // the /lab bench (page.dev.tsx) exists in `next dev` only
  pageExtensions: dev ? ['dev.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    deviceSizes,
    imageSizes,
  },
};

export default nextConfig;
