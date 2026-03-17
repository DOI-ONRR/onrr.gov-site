import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const PORT = 5199

const eventsFixtures = JSON.parse(
  readFileSync(new URL('./fixtures/events.json', import.meta.url), 'utf-8'),
)
const pagesFixtures = JSON.parse(
  readFileSync(new URL('./fixtures/pages.json', import.meta.url), 'utf-8'),
)

let activeFixture = null

function handleGraphQL(body) {
  const operationName = body?.operationName || ''
  const query = body?.query || ''

  // Match by operation name first (most reliable), fall back to query content
  if (operationName === 'GetEvents' || (!operationName && query.includes('outreach_events'))) {
    return activeFixture || { data: { outreach_events: [], other_events: [] } }
  }

  if (operationName === 'GetMenuByLabel' || operationName === 'GetMenus'
    || (!operationName && query.includes('menus') && !query.includes('GetPageBySlug'))) {
    return { data: { menus: [] } }
  }

  if (operationName === 'GetPageBySlug' || (!operationName && query.includes('pages'))) {
    const slug = body?.variables?.slug
    if (slug && pagesFixtures[slug]) {
      return pagesFixtures[slug]
    }
    return pagesFixtures.home
  }

  return { data: {} }
}

const server = createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    const parsed = body ? JSON.parse(body) : {}

    if (req.url === '/__set-fixture') {
      activeFixture = parsed.fixture ? eventsFixtures[parsed.fixture] : null
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    if (req.url === '/graphql') {
      const result = handleGraphQL(parsed)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
      return
    }

    // Health check for Playwright webServer readiness
    if (req.method === 'GET') {
      res.writeHead(200)
      res.end('ok')
      return
    }

    res.writeHead(404)
    res.end()
  })
})

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`)
})
