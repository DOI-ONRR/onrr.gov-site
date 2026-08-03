<script setup>
import MastHead from '~/components/MastHead.vue';
// The mobile nav drawer (open/close, overlay, Esc, aria/button-text sync) is handled
// by the `uswds-nav.client.js` plugin via delegated listeners — route-safe and scoped
// to the drawer controls so it never touches the Vue-managed megamenu buttons.
</script>

<template>
  <div class="onrr-app">
    <GovBanner />
    <header class="usa-header usa-header--extended">
      <MastHead />
      <NavigationMenu />
    </header>

    <div class="usa-overlay"></div>

    <main id="main-content">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<style lang="scss" scoped>
.onrr-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
