/**
 * Hebrew typesetting characters, written as escapes so they stay visible in
 * source (a literal U+00A0 and a plain space look identical in an editor).
 * Import these instead of declaring local copies – `npm run lint:rtl` flags
 * any local `const NB`.
 */

/** No-break space: before an en dash, between a number and its Hebrew unit. */
export const NB = '\u00a0';

/** Narrow no-break space: keeps ₪ attached to its amount. */
export const NNBSP = '\u202f';

/**
 * Word joiner (zero width, silent for screen readers): forbids a line break
 * where there is no space to protect, e.g. between an inline-block token or
 * formula and the comma after it, so the comma never opens a line.
 */
export const WJ = '\u2060';
