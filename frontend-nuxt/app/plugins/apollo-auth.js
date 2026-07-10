// Forward the Directus preview token (?token=...) as an `Authorization: Bearer`
// header on GraphQL requests, so the CMS returns draft content for previewers.
// Without a token the request stays anonymous → public policy → published only.
//
// The token is stored in a shared `useState('preview-token')` ref so components
// (via usePreview()) read the SAME value that gets sent as the auth header — that
// keeps "am I authenticated for drafts" and "am I requesting drafts" in sync. It
// also persists preview mode across navigation: once an editor arrives with a
// token it keeps applying even after internal links drop it from the URL.
//
// @nuxtjs/apollo requires that Nuxt composables are NOT called inside the
// `apollo:auth` hook (they throw during SSR), so we resolve the ref outside the
// hook and read only `.value` inside it.
export default defineNuxtPlugin((nuxtApp) => {
  const token = useState('preview-token', () => null)
  const router = useRouter()

  const capture = (route) => {
    const t = route?.query?.token
    if (t) token.value = Array.isArray(t) ? t[0] : String(t)
  }

  capture(router.currentRoute.value)       // initial load (SSR request URL + hydration)
  router.afterEach((to) => capture(to))    // keep it as the editor navigates

  nuxtApp.hook('apollo:auth', ({ token: authToken }) => {
    if (token.value) authToken.value = token.value
  })
})
