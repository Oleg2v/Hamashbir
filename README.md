# העונה שלך — Hamashbir farmer's portal (pitch concept)

> **קונספט של Kikkey – לא האתר הרשמי של המשביר לחקלאי.**
> Unlisted, `noindex`. Every quantity, coefficient and price is demo data.

A Hebrew, RTL, mobile-first concept for a farmer's portal for Hamashbir
Agriculture (המשביר לחקלאי). The portal is organised around the crop and the
season — sow, irrigate, protect, harvest, pack — and every stage knows what is
in stock at the nearest branch.

## Status

| Stage | Scope                                                                                   | State          |
| ----- | --------------------------------------------------------------------------------------- | -------------- |
| 0     | Art direction — `/style-tile`                                                           | in review      |
| 1     | Signature moment — `/hero-lab` (R3F season field)                                       | waiting for OK |
| 2     | App flows (planner, catalogue, branches, account, reorder, greenhouse, demand forecast) | —              |
| 3     | Polish pass                                                                             | —              |
| 4     | QA (Lighthouse, axe, RTL) and the 30-second demo path                                   | —              |

Live (unlisted, `noindex`): **https://hamashbir.kikkey.com** → `/style-tile`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000 → /style-tile
```

## Build and deploy

The site is a static export (`out/`) served on Cloudflare by an assets-only
Worker, `hamashbir`, on the agency account, with the custom domain
`hamashbir.kikkey.com` (`wrangler.jsonc`). `public/_headers` carries the
`noindex` / `nosniff` headers and `public/_redirects` sends `/` to
`/style-tile`. Photos are pre-cut to WebP for every `srcset` width
(`npm run images`, run automatically before dev and build).

```bash
npm run build && npm run preview   # the export on http://localhost:3100, same headers and redirects as production
```

```bash
npm run qa         # against the preview: horizontal overflow, axe (WCAG A/AA) and console errors, 320–1440, normal and sun
```

```bash
npm run deploy     # build + wrangler deploy; needs CLOUDFLARE_API_TOKEN in the environment
```

```bash
npm run typecheck && npm run lint
npm run tokens     # regenerate src/styles/tokens.css from src/design/tokens.ts
```

Screenshots (Playwright, pre-installed Chromium):

```bash
node scripts/shoot.cjs --path /style-tile --out shots --sizes 1440x900,390x844 --full [--sun] [--reduced] [--axe]
```

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · React 19.
Later stages add React Three Fiber + drei, GSAP + Lenis, MapLibre GL, visx
and Zustand.

## Where things live

- `src/design/tokens.ts` — every design token (single source of truth)
- `scripts/build-tokens.ts` → `src/styles/tokens.css` (generated)
- `src/styles/components.css` — component primitives
- `src/components/ui/*` — Button, Field, NumberField, Chip, Card, Toast, Num…
- `src/app/style-tile/*` — the style tile
- `docs/design-system.md` — conventions (RTL, Hebrew typesetting, a11y, demo hygiene)

## Credits

Fonts: Suez One, Assistant, IBM Plex Mono — SIL Open Font License.
