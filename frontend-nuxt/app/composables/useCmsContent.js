export function useCmsContent() {
  const { apiUrl } = useRuntimeConfig().public

  function resolveImages(html) {
    if (!html) return html
    return html.replace(/(<img\s[^>]*src=["'])\/(?!\/)/g, `$1${apiUrl}/`)
  }

  return { resolveImages }
}
