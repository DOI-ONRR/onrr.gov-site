import DOMPurify from 'dompurify'

// Every v-html in the app goes through this (as this.$sanitizeHtml in
// templates): CMS content is HTML written by editors, and DOMPurify removes
// anything that can run script - <script>, event-handler attributes,
// javascript: URLs, iframes, SVG/MathML - before it reaches the DOM.
//
// Mirrors the allow-list the CMS applies on save
// (cms/src/extensions/hooks/html-sanitizer/src/policy.js) and the Nuxt app
// uses (frontend-nuxt/app/utils/sanitizePolicy.js).
const CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'option'],
}

export function sanitizeHtml(html) {
  if (html == null || html === '') return ''
  if (typeof html !== 'string') html = String(html)
  // DOMPurify returns its input unchanged in browsers it can't protect (IE);
  // render nothing rather than unsanitized markup.
  if (!DOMPurify.isSupported) return ''
  return DOMPurify.sanitize(html, CONFIG)
}

export default {
  install(Vue) {
    Vue.prototype.$sanitizeHtml = sanitizeHtml
  },
}
