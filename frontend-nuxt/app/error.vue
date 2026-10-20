<script setup>
// Nuxt renders this for any fatal error thrown during routing/rendering:
//   - 404 → the catch-all throws it for an unknown URL (no CMS page, no fallback)
//   - 503 → a page throws it (via throwOnCmsError) when a CMS query fails (outage), so an
//           outage reads as "try again" instead of a misleading 404 or a blank page
//   - anything else → a generic "something went wrong"
// Wrapped in the default layout so the masthead, nav, and footer stay in place. The body
// is self-contained (no CMS fetch), so it renders even when the API is unreachable — the
// layout's own menu queries just fail to empty rather than crashing the error page.
const props = defineProps({
  error: { type: Object, default: () => ({}) },
})

const route = useRoute()

const code = computed(() => props.error?.statusCode)
const is404 = computed(() => code.value === 404)
const is503 = computed(() => code.value === 503)

// Report 404s to analytics — the single best signal for broken internal links, dead CMS slugs,
// and bad inbound links. Client-only (dataLayer lives in the browser); the attempted URL comes
// from window.location so it's accurate even on a hard SSR-thrown 404. Only 404s, not outages.
const { trackEvent } = useAnalytics()
onMounted(() => {
  if (!is404.value) return
  trackEvent('page_not_found', {
    page_path: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
  })
})

const heading = computed(() => {
  if (is404.value) return 'Page not found'
  if (is503.value) return 'Service temporarily unavailable'
  return 'Something went wrong'
})

// clearError resets Nuxt's error state and navigates; a plain link would leave the error
// view mounted. reloadNuxtApp does a full reload so SSR re-runs and the CMS is re-queried.
function goHome() {
  clearError({ redirect: '/' })
}
function retry() {
  reloadNuxtApp({ path: route.fullPath })
}
</script>

<template>
  <NuxtLayout>
    <section class="grid-container usa-section">
      <div class="grid-row">
        <div class="grid-col-12 tablet:grid-col-8">
          <p class="error-eyebrow margin-top-4">Error {{ error?.statusCode || '' }}</p>
          <h1 class="margin-top-1">{{ heading }}</h1>

          <p v-if="is404" class="usa-intro">
            We can’t find the page you’re looking for. It may have been moved or removed,
            or the web address may have been mistyped.
          </p>
          <p v-else-if="is503" class="usa-intro">
            We’re having trouble loading this page right now. This is usually temporary —
            please try again in a few minutes.
          </p>
          <p v-else class="usa-intro">
            An unexpected error occurred. Please try again in a moment, or head back to the
            homepage.
          </p>

          <ul class="usa-button-group margin-top-3">
            <li v-if="!is404" class="usa-button-group__item">
              <button type="button" class="usa-button" @click="retry">Try again</button>
            </li>
            <li class="usa-button-group__item">
              <button
                type="button"
                class="usa-button"
                :class="{ 'usa-button--outline': !is404 }"
                @click="goHome"
              >
                Go to the homepage
              </button>
            </li>
          </ul>

          <template v-if="is404">
            <h2 class="margin-top-5 font-heading-md">Search ONRR.gov</h2>
            <p class="margin-top-05">Try searching for what you need.</p>
            <SiteSearchForm input-id="error-search" />
          </template>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
  .error-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0;
  }
</style>
