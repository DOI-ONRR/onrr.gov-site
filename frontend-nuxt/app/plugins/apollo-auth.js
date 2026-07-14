// Forward the Directus preview token as an `Authorization: Bearer` header on
// GraphQL requests, so the CMS returns draft content for previewers. Without a
// token the request stays anonymous → public policy → published only.
//
// Token lifecycle:
//   - Seeded from a persisted **session cookie** first (so a reload / new tab
//     stays in preview), then from `?token=` on the route (a fresh arrival, which
//     wins). Because the cookie rides along on the SSR request, the server renders
//     drafts on reload with no flash of published content.
//   - Held in a shared `useState('preview-token')` (see usePreview) so all
//     consumers agree within a render, and mirrored back to the cookie by a single
//     watcher below — that same watcher clears the cookie when the "Exit preview"
//     button sets the token to null.
//
// @nuxtjs/apollo requires that Nuxt composables are NOT called inside the
// `apollo:auth` hook (they throw during SSR), so we resolve the refs outside the
// hook and read only `.value` inside it.
export default defineNuxtPlugin((nuxtApp) => {
  const { token } = usePreview()
  const cookie = useCookie('preview_token', { sameSite: 'lax', path: '/' }) // session cookie (no maxAge)
  const router = useRouter()

  // Seed from the persisted cookie, unless SSR already hydrated a token.
  if (cookie.value && !token.value) token.value = cookie.value

  // A fresh `?token=` arrival wins and keeps applying as the editor navigates.
  const capture = (route) => {
    const t = route?.query?.token
    if (t) token.value = Array.isArray(t) ? t[0] : String(t)
  }
  capture(router.currentRoute.value)
  router.afterEach((to) => capture(to))

  // Single source of write-through: persist the token to the cookie, and clear
  // the cookie when preview is exited (token → null).
  watch(token, (value) => { cookie.value = value || null }, { immediate: true })

  nuxtApp.hook('apollo:auth', ({ token: authToken }) => {
    if (token.value) authToken.value = token.value
  })
})
