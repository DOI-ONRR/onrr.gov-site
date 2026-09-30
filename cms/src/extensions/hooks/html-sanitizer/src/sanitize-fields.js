import { sanitize } from './policy.js'

// Field interfaces whose value is an HTML string.
export const HTML_INTERFACES = ['input-rich-text-html', 'onrr-wysiwyg']

// Markup that only an attack (or a paste gone badly wrong) would contain; used
// to decide whether a sanitized change is worth a warning in the logs.
const SUSPICIOUS = /<\s*(script|iframe|object|embed|form|svg|math|style)\b|\son[a-z]+\s*=|(javascript|vbscript|data)\s*:/i

// Sanitize the HTML fields present in a create/update payload, in place.
// `fields` is the Set of HTML field names for the collection. Returns the
// names of fields where suspicious markup was removed.
export function sanitizePayload(payload, fields) {
  const flagged = []
  if (!payload || typeof payload !== 'object') return flagged

  for (const field of fields) {
    const value = payload[field]
    if (typeof value !== 'string') continue
    const clean = sanitize(value)
    if (clean !== value && SUSPICIOUS.test(value)) flagged.push(field)
    payload[field] = clean
  }

  return flagged
}
