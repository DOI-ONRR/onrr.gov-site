import { describe, it, expect } from 'vitest'
import { sanitizePayload } from '../sanitize-fields.js'

const fields = (...names) => new Set(names)

describe('sanitizePayload', () => {
  it('sanitizes only the configured HTML fields', () => {
    const payload = {
      block_content_html: '<p>ok</p><img src=x onerror=alert(1)>',
      title: '<img src=x onerror=alert(1)>',
    }
    const flagged = sanitizePayload(payload, fields('block_content_html'))
    expect(payload.block_content_html).toBe('<p>ok</p><img src="x" />')
    expect(payload.title).toBe('<img src=x onerror=alert(1)>')
    expect(flagged).toEqual(['block_content_html'])
  })

  it('sanitizes and flags every HTML field in the payload', () => {
    const payload = { description: '<p onclick="x()">a</p>', contact: '<a href="javascript:x()">b</a>' }
    expect(sanitizePayload(payload, fields('description', 'contact'))).toEqual(['description', 'contact'])
    expect(payload).toEqual({ description: '<p>a</p>', contact: '<a>b</a>' })
  })

  it('ignores fields absent from a partial update', () => {
    const payload = { status: 'published' }
    expect(sanitizePayload(payload, fields('content'))).toEqual([])
    expect(payload).toEqual({ status: 'published' })
  })

  it('does not flag harmless normalisation', () => {
    const payload = { content: '<p>a<br>b</p>' }
    expect(sanitizePayload(payload, fields('content'))).toEqual([])
    expect(payload.content).toBe('<p>a<br />b</p>')
  })

  it('handles null values and non-object payloads', () => {
    const payload = { content: null }
    expect(sanitizePayload(payload, fields('content'))).toEqual([])
    expect(payload.content).toBe(null)
    expect(sanitizePayload(null, fields('content'))).toEqual([])
  })
})
