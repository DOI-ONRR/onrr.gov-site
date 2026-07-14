// Shared preview state. The `apollo-auth` plugin seeds the Directus preview token
// (from `?token=` on the route, or a persisted session cookie), keeps it in this
// same `useState` key, mirrors it to the cookie, and attaches it as an
// `Authorization: Bearer` header. Components read `isPreview` here to request
// draft-inclusive content — so what we're *authenticated* for and what we *ask*
// for stay consistent.
//
// `token` is a `useState` ref (not `useCookie`) on purpose: `useState` is shared
// across every consumer within a single render, so auth header and requested
// statuses always agree during SSR. Persistence across reloads/new-tabs is layered
// on top by the plugin, which write-throughs this value to a session cookie — the
// cookie is sent with the SSR request, so a reload re-enters preview server-side
// with no flash of published content. Setting `token.value = null` (the
// "Exit preview" button) both drops preview here and clears the cookie via the
// plugin's watcher.
//
// `statuses` is the value to pass to collection queries' `status: { _in: $statuses }`
// filter: published-only on the live site, published + draft while previewing.
export const usePreview = () => {
  const token = useState('preview-token', () => null)
  const isPreview = computed(() => !!token.value)
  const statuses = computed(() => (isPreview.value ? ['published', 'draft'] : ['published']))
  return { token, isPreview, statuses }
}
