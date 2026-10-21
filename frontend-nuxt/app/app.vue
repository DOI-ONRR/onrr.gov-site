<script setup>
// Global document-title template. Pages set their own title via useHead/useSeoMeta; this
// appends the org suffix, and supplies the full org name when a page sets no title (home,
// error page). Drives the browser tab, search/social titles, and the analytics page_title.
useHead({
  titleTemplate: (title) => (title ? `${title} | ONRR` : 'Office of Natural Resources Revenue (ONRR)'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
