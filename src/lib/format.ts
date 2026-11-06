/**
 * Hebrew (he-IL) number formatting. Always render the result inside <Num>
 * (a <bdi>) so digits never reorder inside RTL text.
 */
const cache = new Map<string, Intl.NumberFormat>();

function nf(min: number, max: number) {
  const key = `${min}:${max}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('he-IL', { minimumFractionDigits: min, maximumFractionDigits: max });
    cache.set(key, f);
  }
  return f;
}

/** 32000 → "32,000" · formatNumber(3.25, 1) → "3.3" */
export function formatNumber(n: number, digits?: number) {
  return digits == null ? nf(0, 2).format(n) : nf(digits, digits).format(n);
}

/** 18420 → "₪ 18,420.00" (narrow no-break space keeps the sign attached). */
export function formatMoney(n: number, { decimals = 2 }: { decimals?: number } = {}) {
  return `₪ ${formatNumber(n, decimals)}`;
}

/** 6 Nov 2026 → "06.11.2026" — the Israeli numeric date. */
export function formatDate(d: Date) {
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}
