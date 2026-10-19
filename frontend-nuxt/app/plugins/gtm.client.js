// Google Tag Manager bootstrap (client-only — GTM needs the browser).
//
// The container ID comes from runtimeConfig.public.gtmId (NUXT_PUBLIC_GTM_ID), read at
// runtime so each environment supplies its own and dev/local run with analytics OFF.
// When no ID is set this plugin is a no-op, so nothing loads and dataLayer stays absent.
//
// Page views: this is a single-page app, so we own page-view tracking via a `page_view`
// dataLayer event. Nuxt's router afterEach fires for the initial (hydrated) route as well
// as every in-app navigation, so one handler covers both. In GTM, trigger the pageview tag
// on this `page_view` custom event (not the native All Pages trigger) to avoid double
// counting. Custom events are pushed via the useAnalytics() composable.
export default defineNuxtPlugin(() => {
  const { gtmId } = useRuntimeConfig().public
  if (!gtmId) return // analytics disabled (no container configured for this env)

  // Standard GTM snippet.
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(script)

  // SPA page views on route change (the initial load is handled by the container itself).
  // Wait a tick so the new page's <title> (set via useHead) is in place before we read it.
  useRouter().afterEach(async (to) => {
    await nextTick()
    window.dataLayer.push({
      event: 'page_view',
      page_path: to.fullPath,
      page_title: document.title,
    })
  })
})
