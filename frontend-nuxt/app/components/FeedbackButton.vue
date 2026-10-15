<template>
  <button
    type="button"
    class="usa-button usa-button--outline feedback-button"
    :style="{ bottom }"
  >
    Is this page helpful?
  </button>
</template>

<script setup>
// Floating "Is this page helpful?" control. Fixed 2rem from the right and bottom of the
// viewport, except that once the footer scrolls into view the button rises to sit 2rem
// above the footer's top edge (so it never overlaps the footer). No click handler yet.

const GAP_REM = 2

// Inline `bottom` overrides the CSS default once mounted; the SCSS keeps a sane
// server-rendered / no-JS value.
const bottom = ref(`${GAP_REM}rem`)

let footerEl = null
let ticking = false

function remToPx(rem) {
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return rem * root
}

function reposition() {
  ticking = false
  const gap = remToPx(GAP_REM)
  footerEl = footerEl || document.querySelector('footer.usa-footer')
  if (!footerEl) {
    bottom.value = `${gap}px`
    return
  }
  // How far the footer's top edge is above the bottom of the viewport. <= 0 while the
  // footer is still below the fold, so the button rests at its default 2rem offset.
  const intrusion = window.innerHeight - footerEl.getBoundingClientRect().top
  bottom.value = `${gap + Math.max(0, intrusion)}px`
}

function onScrollOrResize() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(reposition)
}

const route = useRoute()
watch(() => route.path, () => {
  // The footer's position changes with the new page's height; recompute once it's laid out.
  footerEl = null
  nextTick(() => requestAnimationFrame(reposition))
})

onMounted(() => {
  reposition()
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollOrResize)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>

<style lang="scss" scoped>
.feedback-button {
  position: fixed;
  right: 2rem;
  bottom: 2rem; // default; overridden inline once mounted (and for the footer-in-view case)
  // Above page content, but below the mobile nav drawer overlay (z-index 400) so it
  // tucks behind the open mobile menu.
  z-index: 100;
  margin: 0;
  background-color: #ffffff;
}
</style>
