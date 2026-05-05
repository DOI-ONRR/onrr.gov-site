import http from 'node:http'
import { handlers, setState, resetState } from './handlers.js'

const PORT = process.env.MOCK_API_PORT || 4000

function matchHandler(query) {
  for (const handler of handlers) {
    if (handler.match(query)) {
      return handler.resolve
    }
  }
  return null
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/graphql') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { query } = JSON.parse(body)
        const resolve = matchHandler(query)

        if (resolve) {
          const data = resolve(query)
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify({ data }))
        } else {
          // Return empty data for unhandled queries
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify({ data: {} }))
        }
      } catch (error) {
        console.error('Mock API error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ errors: [{ message: error.message }] }))
      }
    })
    return
  }

  // Control endpoint: set mock state for a specific test
  if (req.method === 'POST' && req.url === '/__mock/state') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      const { key, value } = JSON.parse(body)
      setState(key, value)
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({ ok: true }))
    })
    return
  }

  // Control endpoint: reset mock state between tests
  if (req.method === 'POST' && req.url === '/__mock/reset') {
    resetState()
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`)
})
