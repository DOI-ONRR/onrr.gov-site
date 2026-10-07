<template>
  <!-- Site search is the federal Search.gov affiliate service (as in the legacy site):
       a native GET form to https://search.usa.gov/search with a fixed affiliate and a
       `query` field. No app-side search logic — Search.gov crawls the public site
       (robots.txt + sitemap) and renders its own results page. -->
  <form
    class="usa-search usa-search--small"
    role="search"
    action="https://search.usa.gov/search"
    accept-charset="UTF-8"
    method="get"
  >
    <input type="hidden" name="affiliate" value="onrr.gov">
    <label class="usa-sr-only" :for="inputId">Search ONRR.gov</label>
    <input
      :id="inputId"
      class="usa-input"
      type="search"
      name="query"
      autocomplete="off"
      placeholder="Search"
    >
    <button class="usa-button" type="submit">
      <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
      </svg>
      <span class="usa-sr-only">Search</span>
    </button>
  </form>
</template>

<script setup>
// Unique per instance so the desktop and mobile copies don't share an id (label `for`).
defineProps({
  inputId: { type: String, default: 'search-field' },
})
</script>

<style lang="scss" scoped>
  // The submit button renders an inline magnifier (white on the primary button) rather
  // than depending on a USWDS icon-sprite asset being copied into the build.
  .search-icon {
    width: 1.2rem;
    height: 1.2rem;
    fill: #fff;
  }
</style>
