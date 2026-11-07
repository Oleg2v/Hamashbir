# העונה שלך — design-system conventions

Read this before touching UI code. The style tile (`/style-tile`) is the
living version of this document.

## Source of truth

- `src/design/tokens.ts` holds every token (palette, surfaces, type scale,
  space, radii, elevation, motion). `npm run tokens` compiles it into
  `src/styles/tokens.css` (Tailwind v4 `@theme` + runtime CSS variables).
  Never edit `tokens.css` by hand; never hard-code a hex, size or duration.
- JS that needs a token (GSAP, three.js, charts) imports from `@/design/tokens`.
- `src/styles/components.css` holds the component primitives (`.btn`,
  `.field`, `.chip`, `.card`, `.table`, `.toast`). React wrappers live in
  `src/components/ui/*`.

## The closed scales

Tailwind's defaults are reset for colour, type size, radius, shadow and easing
(only the values below exist). Spacing keeps Tailwind's 0.25rem multiplier —
that _is_ the 4px grid; weights, line-height and blur keep their defaults.
The bare `transition` utilities default to `--dur-fast` + `ease-out-quint`.

| Kind                                      | Utilities                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type                                      | `text-micro` `text-caption` `text-body` `text-lead` `text-title` `text-h3` `text-h2` `text-h1` `text-display` (fluid `clamp()`, line-height built in) — plus `text-poster`, the single hero headline per page, deliberately outside the nine-step UI scale                                                  |
| Fonts                                     | `font-display` (Suez One — `text-title` (25px) and larger only, never body text; the one exception is the wordmark, 20–24px), `font-sans` (Assistant), `font-mono` / `.num` (IBM Plex Mono)                                                                                                                 |
| Semantic colour                           | `bg-canvas` `bg-surface` `bg-sunken` `bg-input` `text-ink` `text-ink-2` `text-ink-3` `border-line` `border-line-strong` `bg-tint-hover` `bg-tint-press` `text-link` `text-sprout-ink` `text-water-ink` `text-harvest-ink` `text-wheat-ink` `bg-cta` `text-cta-ink` `bg-bud` `bg-inverse` `text-inverse-ink` |
| Raw brand colour (fills, data marks only) | `soil` `loam` `paper` `field` `sprout` `water` `harvest` `wheat` `white` `black`                                                                                                                                                                                                                            |
| Radius                                    | `rounded-none` `-xs` (4) `-sm` (8) `-md` (12) `-lg` (20) `-xl` (32) `-full`                                                                                                                                                                                                                                 |
| Shadow                                    | `shadow-raised` `shadow-float` `shadow-overlay` `shadow-inset` `shadow-glow-sprout` `shadow-glow-water`                                                                                                                                                                                                     |
| Easing                                    | `ease-out-quint` (UI default) `ease-out-expo` `ease-in-out-quart` `ease-in-quint` (exits) `ease-growth` `ease-spring`                                                                                                                                                                                       |
| Duration                                  | `duration-(--dur-instant \| fast \| base \| slow \| grow \| season)` — 80/160/240/400/720/1200 ms: six durations, plus the spring's own pace, `--dur-spring` (800 ms), used with `ease-spring` only                                                                                                         |
| Space                                     | Tailwind integer steps only (`p-1` = 4px … `p-40` = 160px). Layout vars: `--page-margin`, `--gutter`, `--section-y`, `--target`, `--target-lg`                                                                                                                                                              |

Use `.wrap` for the page container (max 1440px, responsive margins).

## Heading hierarchy

| Level      | Element | Style                                                                                  |
| ---------- | ------- | -------------------------------------------------------------------------------------- |
| Page       | `h1`    | `text-poster` (hero) or `text-display`                                                 |
| Section    | `h2`    | Suez `text-h2` (via `<Section>`)                                                       |
| Block      | `h3`    | Suez `text-h3` (via `<Block>`; its note sits under the title, controls go in `action`) |
| Statement  | `h4`    | `font-display text-title` — principles, decisions, pull-quotes                         |
| Card title | `h4`    | `font-sans text-lead font-extrabold`                                                   |

Nothing inside a block is set larger than the block title, except type
specimens. Anything that reads as a heading is marked up as one.

## Shared helpers

- `<NumText>` sets running text with the number rules applied (every numeric
  run in `<Num>`, no-break space before the Hebrew unit). Use it for any
  string that contains digits.
- `NB` (no-break space) and `NNBSP` (narrow no-break space, for ₪) come from
  `src/lib/typography.ts`, written as escapes. Never declare a local copy: a
  literal U+00A0 and a plain space look the same in an editor
  (`npm run lint:rtl` flags it).
- `<Verdict ok />` is the one right/wrong marker (✓ נכון / ✕ שגוי).
- `<SegmentedControl>` for single choice (native radios); `<FilterChip>` for
  independent toggles (aria-pressed).
- Demo data: `src/data/demo-farm.ts` is the only source of "the season"
  numbers (40 dunam pepper, net house, Arava, 3 km from Ein Tamar).

## Surfaces and sun mode

- Put `data-surface="soil"` (dark) or `data-surface="paper"` (light) on a
  section; every semantic colour inside re-themes. Nest freely.
- `html[data-theme="sun"]` (מצב שמש) overrides every surface: white, black
  ink, 2px lines, no shadows, 56px targets, bigger type floors. Never rely on
  a shadow or a subtle tint alone to carry meaning — sun mode removes them.
- Text colours on a surface: `ink` / `ink-2` / `ink-3` and the `*-ink`
  accents are all ≥ 4.5:1 on their own surface. Raw `sprout`, `water`,
  `wheat`, `harvest` are fills and marks, not text on paper.

## RTL and Hebrew

- `<html lang="he" dir="rtl">`. Logical properties only: `ms-/me-/ps-/pe-`,
  `start-/end-`, `text-start/end`, `border-s/e`, `rounded-s/e`, `inset-inline`.
  Never `ml/mr/pl/pr/left/right/text-left/text-right` (SVG coordinates exempt).
- Reading flow = time flow: stage 1 / week 1 / low values sit at inline-start
  (right) and progress toward inline-end (left). "Forward" arrows point left.
- Every number goes through `<Num>` (a `<bdi>`, mono, tabular). Units stay
  Hebrew and outside: `<Num>40</Num> דונם`.
- Punctuation: gershayim ״ and geresh ׳ (מ״מ, ק״מ, ג׳) for abbreviations —
  never straight quotes; quotation marks are „…” (never ״…״); en dash with
  spaces for clauses, and the space _before_ it is non-breaking
  (`&nbsp;– `) so a dash never opens a line; maqaf joins a prefix to a digit
  (ב־14, ל־5,000). No letter-spacing on Hebrew. Body line-height 1.6,
  measure 45–75 characters.
- A number and its unit or counted noun are joined by a no-break space:
  `<Num>40</Num>&nbsp;דונם`.
- A space next to an element lives inside a string literal, never as a lone
  JSX `{' '}` (or between two expressions, `{a} {b}`): after server
  rendering React puts a `<!-- -->` marker beside such a node and Chrome
  drops the space from the accessibility tree, so screen readers hear
  „בסניףעין תמר”. Write `{'… במשקל '}<Num>500</Num>`; Prettier re-wraps plain
  text back into `{' '}`, so only a literal survives. `npm run lint:rtl`
  flags it.
- Punctuation after an inline-block (a `<Token>`, a formula box) goes inside
  the box, after the isolate: `<Token after=",">in-quint</Token>`. Chrome
  allows a line break on both sides of an inline-block even beside a no-break
  space or a word joiner, so outside the box a comma or „·” can open a line.
  A number right after the token takes its space inside too, as a no-break
  space (``after={`${NB}·${NB}`}``): a lone space beside an inline-block is
  dropped from the accessibility tree.
- An inch mark stays inside the number's isolate, like `%`: `<Num>3/4״</Num>`,
  `<NumText>{'מסנן 2״'}</NumText>`. Outside it, bidi moves the mark to the
  other side of the digits (״2).
- Numbers are set in IBM Plex Mono for a functional reason: Assistant's digits
  are proportional and the font has no `tnum`, so `tabular-nums` does nothing
  there (measured: 1111 is ~8% narrower than 8888).
- Bidi: without isolation a frost alert "−2°" renders as "2°−" and a range
  "40–60" flips to "60–40". That is why every number is a `<bdi>`.
- **The `<Num>` positioning trap:** `<Num>` renders `<bdi dir="ltr">`, so
  logical insets, `text-start/end` and self-alignment on the `<Num>` itself
  resolve against LTR and mirror. Never put positioning or inline-alignment
  classes on `<Num>` — position a wrapper `<span>` and put `<Num>` inside.
  (The `--start/--end/--dir-sign` helpers are scoped with `:not(bdi)` so a
  number keeps the page's direction.)
- No lorem ipsum, no Latin eyebrows in product UI.
- Department names are proper nouns, verbatim from hamashbir.co.il:
  הדברה ודשנים · השקייה ותשתיות · ציוד טכני · אריזות וקרטונים · זרעים ושתילים · בתי צמיחה.
  Running text keeps the Academy spelling (השקיה).
- Forms of address: imperatives in the plural (בנו, הזמינו), possessives in
  the singular (העונה שלך, 3 ק״מ ממך) — as in the brief.
- Comparisons in words, not glyphs: „לפחות 4.5:1”, „לכל היותר 2.5” — a typed
  ≥ is mirrored by bidi in RTL and reads as ≤.
- Ranges with an en dash inside `<Num>` („13–14px”), never an arrow.
- "hero" is „מסך הפתיחה”, never „גיבור”.

## Motion

- UI responses: `ease-out-quint`, ≤ 400ms. Big reveals and count-ups:
  `ease-out-expo`. Camera/scroll scenes: `ease-in-out-quart`. Growth (bars,
  sprouts, NDVI sweeps): `ease-growth`. Exits: `ease-in-quint`, short.
- Each easing carries its product `pace` (the duration it is paired with) in
  tokens.ts; the magnetic CTA's tuning is `magnet` in tokens.ts.
- Stagger rows by 40ms, never more than 480ms in total (`staggerDelay`).
- `prefers-reduced-motion: reduce` collapses all `--dur-*` to 1ms. JS
  animation must check the media query and jump to the final state.

## Accessibility (WCAG 2.0 AA / IS 5568)

- Semantic HTML first; one h1 per page; headings in order.
- Visible focus everywhere (global `:focus-visible` ring uses `--focus`).
- Targets ≥ 44px (`--target`), 56px in sun mode.
- Colour is never the only signal — chips pair a dot with words.
- Decorative SVG: `aria-hidden`. Informative SVG: `role="img"` + Hebrew `aria-label`.
- Fixed chrome never hides focus: `scroll-padding-block-start` follows the
  header's measured height (`--header-h`, set by TileHeader, rail included),
  `scroll-padding-block-end` the larger of the toast stack
  (`--toast-stack-h`) and the demo badge (`--badge-h`), both measured by
  ToastProvider. Don't hard-code any of them. The toast stack sits above the
  badge; a live toast caps its height and scrolls inside at large text.
- The header bar is a size container (`@container/bar`): the sun toggle goes
  icon-only by the bar's own width, so 200% text switches it too, and the bar
  may wrap rather than push anything off-screen.
- In-page navigation moves focus to the target section's h2 after the jump
  (the browser's own fragment navigation would leave it on `<body>`). A
  container that holds focus is never collapsed or made `inert`.
- A restyle that changes heights above the viewport (sun mode) keeps the
  reader's place: `holdPlace()` in `src/lib/sun-mode.ts`.
- Toasts: plain ones live `toastLifetime` (6s); with an action, or an error,
  they stay until closed. All timers pause while the pointer or focus is in
  the stack. Escape closes, Alt+T focuses the newest one, and focus returns
  to the trigger, even from a follow-up toast. A phone shows one at a time.
- Stepper (`NumberField`): − and + move along the step grid, PageUp/PageDown
  ×10, no exponent notation; errors wait for blur, except out-of-range.

## Demo hygiene and safety

- Every demo quantity, coefficient or price carries `<DemoTag />`
  ("נתוני דמו") or `<DemoTag>מחירי דמו</DemoTag>`.
- Crop protection: never a pesticide name, dosage or spraying advice.
  Generic placeholders only ("קוטל פטריות – לפי המלצת אגרונום") plus
  `<AgroChip />`; ordering requires agronomist approval.
