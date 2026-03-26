import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const apiUrl = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8056'

  const query = `
    query GetPublishedPages {
      pages(
        filter: { status: { _eq: "published" } }
        limit: -1
      ) {
        url
        date_updated
      }
    }
  `

  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const { data } = await response.json()

  return data?.pages
    ?.filter(page => page.url)
    .map(page => ({
      loc: page.url,
      lastmod: page.date_updated || undefined,
    })) || []
})
