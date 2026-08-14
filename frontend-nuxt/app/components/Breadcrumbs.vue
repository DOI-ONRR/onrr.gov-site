<script setup>
/*
  Breadcrumbs — the page breadcrumb trail (Home › [parent] › current). Extracted from
  [...slug].vue so it can be reused both in the standard page position and inside a
  custom layout's own header (e.g. AudienceHubView's full-bleed hub-header band).

  The parent-link resolution (menu lookup, parent/grandparent URLs) stays in the page;
  this component just renders the trail from the resolved inputs.
*/
defineProps({
  page: { type: Object, default: null },
  parentLink: { type: Object, default: null },
  parentUrl: { type: String, default: null },
  parentTitle: { type: String, default: null },
})

const route = useRoute()
</script>

<template>
  <nav class="usa-breadcrumb" aria-label="Breadcrumbs">
    <ol class="usa-breadcrumb__list">
      <li class="usa-breadcrumb__list-item">
        <NuxtLink to="/" class="usa-breadcrumb__link">Home</NuxtLink>
      </li>
      <li v-if="parentLink && parentLink.url !== '/' && parentLink.url !== route.path" class="usa-breadcrumb__list-item">
        <NuxtLink :to="parentLink.url" class="usa-breadcrumb__link">
          {{ parentLink.title }}
        </NuxtLink>
      </li>
      <li v-if="parentUrl && parentUrl !== '/' && parentUrl !== parentLink?.url" class="usa-breadcrumb__list-item">
        <NuxtLink :to="parentUrl" class="usa-breadcrumb__link">
          {{ parentTitle }}
        </NuxtLink>
      </li>
      <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
        <span>{{ page?.title }}</span>
      </li>
    </ol>
  </nav>
</template>
