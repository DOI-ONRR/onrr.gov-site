// Shared preview state. The `apollo-auth` plugin captures the Directus preview
// token (from `?token=` on the route), persists it in this same `useState` key,
// and attaches it as an `Authorization: Bearer` header. Components read `isPreview`
// here to request draft-inclusive content — so what we're *authenticated* for and
// what we *ask* for stay consistent.
//
// `statuses` is the value to pass to collection queries' `status: { _in: $statuses }`
// filter: published-only on the live site, published + draft while previewing.
export const usePreview = () => {
  const token = useState('preview-token', () => null)
  const isPreview = computed(() => !!token.value)
  const statuses = computed(() => (isPreview.value ? ['published', 'draft'] : ['published']))
  return { token, isPreview, statuses }
}
