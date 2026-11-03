/*
  Lazy, client-only Highcharts loader. Centralizes module registration so every chart in
  the app shares one baseline — notably the accessibility module — and any new chart gets
  it for free rather than re-wiring the module imports per component.

  Highcharts stays out of SSR and the initial bundle: this is only ever awaited from
  client-side code (onMounted / a client-guarded buildChart), and it returns null on the
  server. The core import + accessibility registration are memoized in one shared promise,
  so multiple chart components on a page trigger the load exactly once.

  v12 ESM modules self-register against the default Highcharts instance when imported for
  their side effect — no factory call like `Accessibility(Highcharts)`. The module is
  resolved before the promise settles, so callers always have it registered before the
  first `Highcharts.chart(...)`.
*/

let loadPromise = null

export function useHighcharts({ exporting = false } = {}) {
  if (import.meta.server) return Promise.resolve(null)

  if (!loadPromise) {
    loadPromise = (async () => {
      const Highcharts = (await import('highcharts')).default
      // Loaded for ALL charts: adds keyboard navigation + screen-reader regions and clears
      // Highcharts' "missing accessibility module" console warning.
      await import('highcharts/modules/accessibility')
      return Highcharts
    })()
  }

  if (!exporting) return loadPromise

  // Exporting is opt-in (only ChartCard's export menu needs it). The dynamic import is
  // cached by the bundler, so requesting it again is a no-op; a failure leaves the chart
  // rendering without the menu.
  return loadPromise.then(async (Highcharts) => {
    try {
      await import('highcharts/modules/exporting')
    } catch {
      // Exporting module unavailable — chart still renders without the menu.
    }
    return Highcharts
  })
}
