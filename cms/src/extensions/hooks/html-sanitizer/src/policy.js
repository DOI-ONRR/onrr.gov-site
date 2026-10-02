import sanitizeHtml from 'sanitize-html'

// HTML allow-list for CMS rich-text content. Everything not listed here is
// removed: <script>, <iframe>, <object>, <form>, <style>, SVG/MathML, on*
// event-handler attributes, and javascript:/data: URLs.
//
// Derived from a survey of all rich-text content on prod
// (2026-09-30): no scripts, iframes, handlers or script URLs were in use;
// style, data-*, target, aria-* and <video>/<source> are.
//
// KEEP IN SYNC with frontend-nuxt/app/utils/sanitizeHtml.js — the test in
// policy.test.js fails if the two allow-lists drift apart.
export const SANITIZE_OPTIONS = {
  allowedTags: [
    'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
    'blockquote', 'br', 'button', 'caption', 'cite', 'code', 'col', 'colgroup', 'dd',
    'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
    'font', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
    'img', 'ins', 'kbd', 'li', 'main', 'mark', 'nav', 'ol', 'p', 'picture',
    'pre', 'q', 's', 'samp', 'section', 'small', 'source', 'span', 'strong',
    'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
    'time', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'style', 'title', 'lang', 'dir', 'role', 'tabindex', 'hidden', 'aria-*', 'data-*', 'align'],
    a: ['href', 'target', 'rel', 'name', 'download', 'hreflang', 'type'],
    // USWDS accordion toggles (aria-expanded / aria-controls come from '*').
    // No form attributes, and <form> itself is not allowed, so it can't submit.
    button: ['type'],
    img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
    video: ['src', 'poster', 'controls', 'width', 'height', 'preload', 'muted', 'loop', 'playsinline', 'autoplay'],
    audio: ['src', 'controls', 'preload', 'muted', 'loop'],
    source: ['src', 'srcset', 'sizes', 'type', 'media'],
    track: ['src', 'kind', 'srclang', 'label', 'default'],
    table: ['summary', 'width', 'border', 'cellpadding', 'cellspacing'],
    td: ['colspan', 'rowspan', 'headers', 'scope', 'valign', 'width', 'height'],
    th: ['colspan', 'rowspan', 'headers', 'scope', 'valign', 'width', 'height', 'abbr'],
    col: ['span', 'width'],
    colgroup: ['span', 'width'],
    ol: ['start', 'type', 'reversed'],
    li: ['value'],
    font: ['color', 'face', 'size'],
    time: ['datetime'],
    blockquote: ['cite'],
    q: ['cite'],
    del: ['cite', 'datetime'],
    ins: ['cite', 'datetime'],
    details: ['open'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite', 'poster'],
  allowProtocolRelative: true,
  // Pass style attributes through as-is: parsing them needs postcss, which only
  // works in Node, and the Nuxt app sanitizes in the browser too. Inline CSS
  // cannot run script in any supported browser.
  parseStyleAttributes: false,
  // Void elements, written as <x /> with no closing tag.
  selfClosing: ['img', 'br', 'hr', 'wbr', 'source', 'track', 'col'],
  // Keep these when written with no value (e.g. a collapsed accordion panel's
  // bare `hidden`, a link's bare `download`); sanitize-html drops empty
  // non-boolean attributes otherwise.
  allowedEmptyAttributes: ['alt', 'hidden', 'download'],
  // Drop a disallowed tag but keep its text, except for these, whose contents
  // are dropped along with them.
  disallowedTagsMode: 'discard',
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed', 'template', 'title', 'svg', 'math'],
}

export function sanitize(html) {
  if (typeof html !== 'string' || html === '') return html
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}
