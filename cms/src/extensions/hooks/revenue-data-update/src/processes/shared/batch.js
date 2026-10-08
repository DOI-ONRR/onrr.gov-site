/**
 * Helpers for keeping a long data load from monopolizing the Node event loop.
 *
 * A revenue data update runs inside a Directus create hook (within the request lifecycle),
 * so a long synchronous burst stalls the event loop past Directus's pressure-limiter
 * threshold (~500ms by default) and the instance starts shedding requests with
 * 503 "Under pressure". Yielding periodically lets the loop breathe so the limiter samples
 * a recovered loop; chunking keeps bulk inserts off a single huge statement.
 */

/**
 * Hand control back to the event loop (macrotask), so pending I/O and timers can run.
 * `await yieldToEventLoop()` inside a tight synchronous loop every N iterations.
 *
 * @returns {Promise<void>}
 */
export function yieldToEventLoop() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Split an array into fixed-size chunks (the last may be smaller). Used to bulk-insert in
 * batches rather than one row at a time or one giant statement.
 *
 * @template T
 * @param {T[]} items
 * @param {number} size - Chunk size (must be > 0).
 * @returns {T[][]}
 */
export function chunk(items, size) {
  if (size <= 0) throw new Error('chunk size must be greater than 0');
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
