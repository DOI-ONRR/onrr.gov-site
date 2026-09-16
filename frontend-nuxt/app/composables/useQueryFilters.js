// Deep-linkable filters for dataset preview pages.
//
// The pattern (see any *Preview.vue): a preview reads its filter values from the URL query on
// load and reflects filter changes back into the URL (two-way), so a filtered view is
// shareable/bookmarkable. Query-param names match the pivot endpoint's own names
// (period, fromYear, toYear, the grain-appropriate land/region/type selects, products,
// breakout, groupBy …); multi-selects are comma-separated. Range is always fromYear/toYear
// (the monthly endpoint call converts those to Jan 1 … Dec 31 boundaries internally).
//
// This composable provides the shared helpers plus the write-back sync. Each preview supplies:
//   - a `urlQuery` source (getter/computed) that yields the param->string map for the current
//     filters, omitting anything at its default (so a default view yields a clean URL), and
//   - an `applyQueryToFilters()` it calls in its own one-shot seed (after seeding defaults,
//     before `ready` flips true) so the query overrides defaults BEFORE the first pivot fetch.

// Read a single query value (Vue Router gives string | string[] | undefined).
export const queryStr = (v) => (Array.isArray(v) ? v[0] : v)

// Read a comma-separated (or repeated) multi-select query value as a trimmed string[] (or null
// when the param is absent).
export const queryList = (v) =>
  v == null ? null : String(Array.isArray(v) ? v.join(',') : v).split(',').map((s) => s.trim()).filter(Boolean)

// Map an endpoint period slug to the in-app period label.
export const PERIOD_FROM_PARAM = { monthly: 'Monthly', 'calendar-year': 'Calendar Year', 'fiscal-year': 'Fiscal Year' }

// Reflect a preview's `urlQuery` into the URL once `ready`, client-side, via router.replace (no
// history spam). `paramKeys` are the query keys this page owns — they're cleared before ours are
// re-applied, so returning a filter to its default drops it from the URL while any unrelated
// params are preserved.
export function useUrlFilterSync(source, ready, paramKeys) {
  const route = useRoute()
  const router = useRouter()
  if (!import.meta.client) return
  watch(
    source,
    (q) => {
      if (!ready.value) return
      const merged = { ...route.query }
      for (const k of paramKeys) delete merged[k]
      Object.assign(merged, q)
      router.replace({ query: merged })
    },
    { flush: 'post' },
  )
}
