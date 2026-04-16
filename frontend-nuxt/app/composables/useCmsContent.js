export function useCmsContent() {
  const { apiUrl } = useRuntimeConfig().public

  function resolveImages(html) {
    if (!html) return html
    return html.replace(/(<img\s[^>]*src=["'])\/(?!\/)/g, `$1${apiUrl}/`)
  }

  function assetUrl(id) {
    if (!id) return null
    return `${apiUrl}/assets/${id}`
  }

  return { resolveImages, assetUrl }
}
