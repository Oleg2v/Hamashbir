/**
 * Hebrew typesetting characters, written as escapes so they stay visible in
 * source (a literal U+00A0 and a plain space look identical in an editor).
 * Import these instead of declaring local copies – `npm run lint:rtl` flags
 * any local `const NB`.
 */

/** No-break space: before an en dash, between a number and its Hebrew unit. */
export const NB = ' ';

/** Narrow no-break space: keeps ₪ attached to its amount. */
export const NNBSP = ' ';
