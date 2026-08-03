// Mobile-nav drawer controller (USWDS mobile menu).
//
// We intentionally do NOT initialize USWDS's own header JS (`@uswds/uswds` usa-header):
// it's uncompiled CommonJS *and* it binds click handlers to `button.usa-nav__link` —
// the desktop megamenu triggers that NavigationMenu.vue manages with its own Vue
// state — so it would double-toggle and break the megamenu. This controls only the
// drawer chrome (`.usa-menu-btn`, `.usa-nav__close`, `.usa-overlay`), leaving the nav
// buttons to Vue. Uses delegated document listeners so it's robust across route
// changes (the nav lives in the persistent layout).
export default defineNuxtPlugin(() => {
  const NAV = '.usa-nav'
  const OPENER = '.usa-menu-btn'
  const CLOSER = '.usa-nav__close, .usa-overlay'

  const getNav = () => document.querySelector(NAV)
  const isOpen = () => getNav()?.classList.contains('is-visible') ?? false

  const setOpen = (open) => {
    const nav = getNav()
    if (!nav) return
    nav.classList.toggle('is-visible', open)
    document.querySelector('.usa-overlay')?.classList.toggle('is-visible', open)
    document.body.classList.toggle('usa-js-mobile-nav--active', open)

    const btn = document.querySelector(OPENER)
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false')
      btn.textContent = open ? 'Close' : 'Menu'
    }
    // Move focus into the drawer on open, back to the toggle on close.
    if (open) nav.querySelector('.usa-nav__close, a, button')?.focus()
    else btn?.focus()
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest(OPENER)) {
      e.preventDefault()
      setOpen(!isOpen())
    } else if (e.target.closest(CLOSER)) {
      e.preventDefault()
      setOpen(false)
    } else if (isOpen() && e.target.closest(`${NAV} a`)) {
      // A real link inside the open drawer was clicked — let it navigate, just close.
      // (Targets anchors only, so megamenu <button> toggles are left to Vue.)
      setOpen(false)
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false)
  })
})
