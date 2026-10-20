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

// The dataset dimension used across all dataset-preview analytics: the page's last path segment
// (e.g. "monthly-disbursements"). One definition so dataset_filter and dataset_download always
// carry the same value and join into a per-dataset funnel.
export const datasetSlugOf = (route) => route.path.split('/').filter(Boolean).at(-1) || route.path

// Emit a `dataset_download` event. A download is the headline conversion on a dataset page; both
// the Download-section cards (DatasetDownloads) and the in-table "Download CSV" button in each
// preview route through here so they report identically. Safe anywhere (no-op without analytics).
export function trackDatasetDownload(route, downloadType, fileFormat = 'csv') {
  useAnalytics().trackEvent('dataset_download', {
    dataset: datasetSlugOf(route),
    download_type: downloadType, // full_csv | curated | filtered_csv | preview_csv
    file_format: String(fileFormat || 'csv').toLowerCase(),
    page_path: route.fullPath,
  })
}

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
//
// This is also the single choke point every dataset preview routes filter changes through, so it
// doubles as the analytics hook: a settled filter change emits one debounced `dataset_filter`
// event (burst of toggles → one event). The URL write stays immediate; only the event is
// debounced. We report which filters are in use (the active param keys), not their values, to
// keep the GA4 dimension low-cardinality. A pure query update keeps the same page mounted, so no
// page_view fires for it (see gtm.client.js) — these events are the only signal of filtering.
export function useUrlFilterSync(source, ready, paramKeys) {
  const route = useRoute()
  const router = useRouter()
  if (!import.meta.client) return

  const { trackEvent } = useAnalytics()
  let eventTimer = null
  function queueFilterEvent(q) {
    clearTimeout(eventTimer)
    eventTimer = setTimeout(() => {
      // `q` already omits defaults, so its keys are exactly the active (non-default) filters.
      const keys = Object.keys(q).filter((k) => k !== 'period').sort()
      trackEvent('dataset_filter', {
        dataset: datasetSlugOf(route),
        filter_period: q.period, // undefined for datasets without a period grain
        filters_used: keys.join(','),
        filter_count: keys.length,
        page_path: route.fullPath,
      })
    }, 800)
  }
  onScopeDispose(() => clearTimeout(eventTimer))

  watch(
    source,
    (q) => {
      if (!ready.value) return
      const merged = { ...route.query }
      for (const k of paramKeys) delete merged[k]
      Object.assign(merged, q)
      router.replace({ query: merged })
      queueFilterEvent(q)
    },
    { flush: 'post' },
  )
}
