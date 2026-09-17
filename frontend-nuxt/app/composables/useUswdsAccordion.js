// Wire USWDS accordion behavior onto accordion markup that was injected as raw HTML — e.g. a CMS
// WYSIWYG field rendered with `v-html` — where USWDS's own JS never binds. We deliberately don't
// load USWDS's uncompiled JS (see plugins/uswds-nav.client.js); this reimplements the accordion
// interaction with one delegated click listener, matching USWDS semantics:
//   - a `.usa-accordion__button` toggles the panel named by its `aria-controls`;
//   - opening in a single-select accordion collapses the accordion's other panels; an accordion
//     marked `.usa-accordion--multiselectable` (or `[data-allow-multiple]`) allows several open.
//
// Call `enhance(rootEl)` after the content mounts and again whenever it changes (v-html swap).
// The click listener is delegated to `rootEl`, so it survives content re-renders; `enhance` also
// normalizes each panel's visibility to its button's `aria-expanded` so the initial state is
// correct even when the authored markup omitted `hidden`.
export function useUswdsAccordion() {
  const contentFor = (button) => {
    const id = button.getAttribute('aria-controls')
    return id ? button.ownerDocument.getElementById(id) : null
  }

  const setExpanded = (button, open) => {
    button.setAttribute('aria-expanded', String(open))
    const content = contentFor(button)
    if (content) content.hidden = !open
  }

  // The buttons that belong to THIS accordion — not ones nested inside a child accordion.
  const buttonsOf = (accordion) =>
    [...accordion.querySelectorAll('.usa-accordion__button')].filter((b) => b.closest('.usa-accordion') === accordion)

  const onClick = (e) => {
    const button = e.target.closest?.('.usa-accordion__button')
    if (!button || !e.currentTarget.contains(button)) return
    e.preventDefault()
    const willOpen = button.getAttribute('aria-expanded') !== 'true'
    const accordion = button.closest('.usa-accordion')
    const multiselectable =
      accordion?.classList.contains('usa-accordion--multiselectable') || accordion?.hasAttribute('data-allow-multiple')
    if (willOpen && !multiselectable && accordion) {
      for (const other of buttonsOf(accordion)) if (other !== button) setExpanded(other, false)
    }
    setExpanded(button, willOpen)
  }

  const enhance = (root) => {
    if (!root) return
    if (!root.__uswdsAccordionBound) {
      root.addEventListener('click', onClick)
      root.__uswdsAccordionBound = true
    }
    // Sync every panel to its button's state (default collapsed when aria-expanded is absent).
    for (const button of root.querySelectorAll('.usa-accordion__button')) {
      setExpanded(button, button.getAttribute('aria-expanded') === 'true')
    }
  }

  return { enhance }
}
