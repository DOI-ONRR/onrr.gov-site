import getGlossaryTerms from '@/graphql/queries/collections/glossary_terms/getGlossaryTerms.gql'

/*
  Glossary tooltips for CMS content. Editors tag a word in the WYSIWYG as
  `<span class="term" data-term="trust-land">Trust land</span>`; `data-term` is a glossary
  slug (falls back to the span's own text). This composable fetches glossary_terms, maps
  them by slug, and — via enhance(rootEl) — resolves each tagged span to its definition and
  wires an accessible hover/focus tooltip. The definition lives only in glossary_terms, so
  editing it once updates every usage.
*/

// Same slug scheme as glossary.vue, so data-term slugs and the bare-text fallback line up.
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// One shared tooltip element + a single Esc handler, created lazily on the client.
let tipEl = null
function ensureTooltip() {
  if (tipEl || !import.meta.client) return tipEl
  tipEl = document.createElement('div')
  tipEl.className = 'glossary-tooltip'
  tipEl.setAttribute('role', 'tooltip')
  document.body.appendChild(tipEl)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTip()
  })
  return tipEl
}

function showTip(el, entry) {
  const tip = ensureTooltip()
  if (!tip) return
  // Definition only — the user is already hovering the term, so repeating it is redundant.
  tip.textContent = entry.definition || ''
  tip.classList.add('is-visible')

  const r = el.getBoundingClientRect()
  const top = r.bottom + window.scrollY + 6
  const maxLeft = window.scrollX + document.documentElement.clientWidth - 335
  const left = Math.max(8, Math.min(r.left + window.scrollX, maxLeft))
  tip.style.top = `${top}px`
  tip.style.left = `${left}px`
}

function hideTip() {
  if (tipEl) tipEl.classList.remove('is-visible')
}

export function useGlossary() {
  const { data } = useAsyncQuery(getGlossaryTerms)

  const bySlug = computed(() => {
    const map = new Map()
    for (const t of data.value?.glossary_terms ?? []) {
      if (t?.term) map.set(slugify(t.term), t)
    }
    return map
  })

  // Roots we've been asked to enhance, so we can re-wire them once the terms load.
  const roots = new Set()

  // Resolve + wire every <span class="term"> inside `root` that maps to a known term.
  // Idempotent: a span is only wired once (data-glossary-ready), so it's safe to call
  // again after the content re-renders or after the glossary data arrives.
  function wire(root) {
    if (!root || !import.meta.client) return
    ensureTooltip()
    root.querySelectorAll('span.term').forEach((el) => {
      if (el.dataset.glossaryReady) return
      const slug = el.dataset.term || slugify(el.textContent || '')
      // Prefer the canonical glossary definition; fall back to an inline data-def for terms
      // not (yet) in the glossary so nothing silently breaks.
      const entry =
        bySlug.value.get(slug) ||
        (el.dataset.def ? { term: el.textContent, definition: el.dataset.def } : null)
      if (!entry) return // not resolvable yet: leave for a later pass / plain styled text

      el.dataset.glossaryReady = '1'
      el.setAttribute('tabindex', '0')
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', `Definition: ${entry.term}`)

      const show = () => showTip(el, entry)
      el.addEventListener('mouseenter', show)
      el.addEventListener('mouseleave', hideTip)
      el.addEventListener('focus', show)
      el.addEventListener('blur', hideTip)
    })
  }

  function enhance(root) {
    if (!root || !import.meta.client) return
    roots.add(root)
    wire(root)
  }

  // Terms load asynchronously (useAsyncQuery isn't awaited here), so enhance() can run
  // before the glossary resolves and wire nothing. Re-wire tracked roots whenever the
  // term map becomes available or changes.
  watch(bySlug, () => {
    for (const root of roots) {
      if (root?.isConnected) wire(root)
    }
  })

  return { enhance }
}
