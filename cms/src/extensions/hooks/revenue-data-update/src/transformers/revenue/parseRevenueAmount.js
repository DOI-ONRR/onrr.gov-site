/**
 * Parses a revenue amount from a CSV cell into a Number.
 *
 * Revenue amounts must be plain numeric values. Thousands-separator commas and surrounding
 * whitespace are tolerated (and stripped), but a "string-formatted" amount — one carrying a
 * currency symbol, quotes, or any other non-numeric text (e.g. "$8,722.00") — is rejected by
 * throwing. The update process turns that throw into a clear failure for the whole file, instead
 * of letting parseFloat silently yield NaN (which corrupts the row or trips a cryptic
 * numeric-insert error downstream).
 *
 * A blank/empty value parses to 0 (an empty revenue cell on an otherwise-populated row).
 *
 * @param {string|number|null|undefined} raw - The raw revenue cell value.
 * @returns {number} - The parsed amount.
 * @throws {Error} - If the value is not a valid (optionally comma-grouped) number.
 */
export function parseRevenueAmount(raw) {
  const str = String(raw ?? '').trim();
  if (str === '') return 0;

  // Allow grouping commas (stripped); reject everything that isn't an optionally-signed decimal.
  const normalized = str.replace(/,/g, '');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new Error(
      `Invalid revenue amount "${raw}": amounts must be numeric (no currency symbols, quotes, or other text).`,
    );
  }
  return parseFloat(normalized);
}
