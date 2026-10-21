// Custom event tracking via the GTM dataLayer.
//
// Safe to call anywhere: on the server, or when analytics is disabled (no NUXT_PUBLIC_GTM_ID,
// so gtm.client.js never created window.dataLayer), every call is a no-op. In GTM, build a
// Custom Event trigger on the event name to turn these into tags.
//
//   const { trackEvent } = useAnalytics()
//   trackEvent('feedback_submit', { feedback_helpful: 'Yes' })
export function useAnalytics() {
  function push(payload) {
    if (import.meta.client && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload)
    }
  }

  function trackEvent(event, params = {}) {
    if (!event) return
    push({ event, ...params })
  }

  return { trackEvent, push }
}
