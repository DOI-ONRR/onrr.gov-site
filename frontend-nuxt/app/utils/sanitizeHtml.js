import sanitize from 'sanitize-html'
import { SANITIZE_OPTIONS } from './sanitizePolicy'

// Every v-html in the app goes through this: CMS content is HTML written by
// editors, and anything outside the allow-list in sanitizePolicy.js (scripts,
// event handlers, javascript: URLs, iframes, ...) is removed before it reaches
// the DOM. Runs identically during SSR and in the browser, so hydration sees
// the same markup.
export function sanitizeHtml(html) {
  if (html == null || html === '') return ''
  if (typeof html !== 'string') html = String(html)
  return sanitize(html, SANITIZE_OPTIONS)
}
