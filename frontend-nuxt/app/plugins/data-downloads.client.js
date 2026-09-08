import { hasDataset, runDataDownload } from '~/composables/useDataDownloads'

/*
  Intercept CMS content links of the form `#download/<slug>` and run the self-contained
  XLSX download for that dataset. Only preventDefault for known slugs (stops the link's
  default navigation, including any target="_blank" the WYSIWYG added); unknown links are
  left alone.
*/
export default defineNuxtPlugin(() => {
  const apiUrl = useRuntimeConfig().public.apiUrl
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href*="#download/"]')
    if (!a) return
    const m = (a.getAttribute('href') || '').match(/#download\/([a-z0-9-]+)/i)
    if (!m || !hasDataset(m[1])) return
    e.preventDefault()
    runDataDownload(m[1], apiUrl)
  })
})
