// Google Tag Manager bootstrap (client-only — GTM needs the browser).
//
// The container ID comes from runtimeConfig.public.gtmId (NUXT_PUBLIC_GTM_ID), read at
// runtime so each environment supplies its own and dev/local run with analytics OFF.
// When no ID is set this plugin is a no-op, so nothing loads and dataLayer stays absent.
//
// Page views: this is a single-page app, so we own page-view tracking via a `page_view`
// dataLayer event. Nuxt's router afterEach fires for the initial (hydrated) route as well
// as every in-app navigation, so one handler covers both. Each event carries a
// `navigation_type`: `initial` for the first (landing) view, `spa` for in-app navigations.
// In GTM, trigger the pageview tag on this `page_view` custom event (not the native All
// Pages trigger). If this container is shared with a non-SPA app whose Google Tag already
// sends an automatic pageview on load, condition the trigger on `navigation_type` equals
// `spa` so the landing page isn't counted twice. Custom events go through useAnalytics().
export default defineNuxtPlugin((nuxtApp) => {
  const { gtmId } = useRuntimeConfig().public
  if (!gtmId) return // analytics disabled (no container configured for this env)

  // Standard GTM snippet.
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(script)

  // Page view on the initial (hydrated) route and every in-app navigation. The first fire
  // is the landing view (navigation_type: 'initial'); the rest are SPA navigations ('spa').
  // `page:finish` fires after the new page has rendered, but useHead/unhead flushes the
  // <title> to the DOM on a later animation frame — so we wait two frames before reading
  // document.title, otherwise a SPA navigation records the *previous* page's title.
  const router = useRouter()
  let firstView = true
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.dataLayer.push({
        event: 'page_view',
        page_path: router.currentRoute.value.fullPath,
        page_title: document.title,
        navigation_type: firstView ? 'initial' : 'spa',
      })
      firstView = false
    }))
  })

  // File downloads anywhere on the site (PDFs, CSVs, spreadsheets, …). One delegated click
  // listener covers every page — including links inside CMS WYSIWYG content (press releases,
  // reporter letters, /document/<name>.pdf) that no component instruments. Emits a `file_download`
  // event with GA4's standard params so it slots straight into GA4's file-download reporting.
  //
  // This deliberately does NOT fire for dataset downloads: those URLs are extension-less
  // (/charts/<ds>/export, /items/<t>?export=csv, /assets/<id>?download, blob:) and carry no
  // download attribute, so they never match here and stay owned by dataset_download. We also
  // don't match on the `?download` query (that's the curated-file dataset card) to keep it that way.
  const FILE_EXTENSIONS = new Set([
    'pdf', 'csv', 'xls', 'xlsx', 'xlsm', 'doc', 'docx', 'ppt', 'pptx',
    'txt', 'rtf', 'zip', '7z', 'gz', 'xml', 'json',
  ])
  document.addEventListener(
    'click',
    (e) => {
      // Ignore modified clicks handled by the browser's own open-in-new-tab/save behavior path;
      // we still track plain left-clicks, which is where downloads overwhelmingly happen.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target?.closest?.('a[href]')
      if (!a) return
      let url
      try { url = new URL(a.href, location.href) } catch { return }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return // skip mailto:/tel:/blob:/data:

      const segment = decodeURIComponent(url.pathname.split('/').pop() || '')
      const ext = segment.includes('.') ? segment.split('.').pop().toLowerCase() : ''
      const isDoc = url.pathname.startsWith('/document/') // CMS document endpoint
      const isFile = FILE_EXTENSIONS.has(ext) || isDoc || a.hasAttribute('download')
      if (!isFile) return

      window.dataLayer.push({
        event: 'file_download',
        file_name: segment || url.pathname,
        file_extension: ext,
        link_url: url.href,
        link_text: (a.textContent || '').trim().slice(0, 100),
        page_path: router.currentRoute.value.fullPath,
      })
    },
    true, // capture: run before any content handler that might stopPropagation
  )
})
