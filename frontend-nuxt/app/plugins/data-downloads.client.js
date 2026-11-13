/*
  Intercept CMS content links of the form `#download/<slug>` and send the browser to the
  server-generated pricing XLSX (the `pricing-exports` Directus endpoint). The workbook is now
  built server-side; this plugin just retargets the authored link so existing footnote content
  needs no edits.

  Only preventDefault for known slugs (stops the link's default navigation, including any
  target="_blank" the WYSIWYG added); unknown `#download/...` links are left alone. Keep SLUGS in
  sync with the endpoint's datasets.js (cms/src/extensions/endpoints/pricing-exports).
*/
const SLUGS = new Set(['nymex', 'index-zones', 'major-portion', 'ibmp'])

export default defineNuxtPlugin(() => {
  const apiUrl = useRuntimeConfig().public.apiUrl
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href*="#download/"]')
    if (!a) return
    const m = (a.getAttribute('href') || '').match(/#download\/([a-z0-9-]+)/i)
    if (!m) return
    const slug = m[1].toLowerCase()
    if (!SLUGS.has(slug)) return
    e.preventDefault()
    window.location.href = `${apiUrl}/pricing-exports/${slug}.xlsx`
  })
})
