<script setup>
import MastHead from '~/components/MastHead.vue';
// The mobile nav drawer (open/close, overlay, Esc, aria/button-text sync) is handled
// by the `uswds-nav.client.js` plugin via delegated listeners — route-safe and scoped
// to the drawer controls so it never touches the Vue-managed megamenu buttons.

// Sticky nav bar: the header is sticky and offset up by the masthead's height so the
// masthead scrolls away and the nav row pins at the top (see _uswds-overrides.scss).
// Two CSS variables are published on :root so they cascade to the whole app:
//   --onrr-masthead-height  the masthead's measured height (the header's negative top).
//   --onrr-sticky-offset    how much of the header stays visible once pinned — the nav
//                           row at desktop (masthead scrolled off), the whole header on
//                           mobile (top:0). Sticky descendants like the topic-page "On
//                           this page" rail offset their own `top` by this so they clear
//                           the pinned bar instead of tucking under it.
// Kept current as the layout reflows (font load, resize, breakpoint change).
const headerEl = ref(null);
let resizeObserver = null;

function updateStickyVars() {
  const header = headerEl.value;
  if (!header) return;
  const mastheadHeight = header.querySelector('.masthead')?.offsetHeight ?? 0;
  // Desktop pins the nav row only (masthead offset off-screen); mobile pins the whole header.
  const isDesktop = window.matchMedia('(min-width: 64em)').matches;
  const stickyOffset = isDesktop ? Math.max(0, header.offsetHeight - mastheadHeight) : header.offsetHeight;
  const root = document.documentElement.style;
  root.setProperty('--onrr-masthead-height', `${mastheadHeight}px`);
  root.setProperty('--onrr-sticky-offset', `${stickyOffset}px`);
}

onMounted(() => {
  if (!headerEl.value || typeof ResizeObserver === 'undefined') return;
  updateStickyVars();
  resizeObserver = new ResizeObserver(updateStickyVars);
  resizeObserver.observe(headerEl.value);
  // A width change that crosses the 64em breakpoint flips which part pins but may not
  // change the header's height, so recompute on resize too.
  window.addEventListener('resize', updateStickyVars);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updateStickyVars);
});
</script>

<template>
  <div class="onrr-app">
    <GovBanner />
    <header ref="headerEl" class="usa-header usa-header--extended">
      <MastHead />
      <NavigationMenu />
    </header>

    <div class="usa-overlay"></div>

    <main id="main-content">
      <slot />
    </main>

    <SiteFooter />
  </div>

  <FeedbackButton />
</template>

<style lang="scss" scoped>
.onrr-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  // Contain full-bleed sections (e.g. JourneyLandingView's related band uses a 100vw
  // breakout) so their viewport width can't trigger a horizontal scrollbar. `clip`
  // (not `hidden`) avoids creating a scroll container, so sticky/absolute descendants
  // (TopicView rail, mobile nav drawer) are unaffected.
  overflow-x: clip;
}

#main-content {
  flex: 1;
}

.usa-logo__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.usa-logo__img {
  height: 8rem;
  width: auto;
}

.usa-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-search {
  flex-shrink: 0;
}
</style>
