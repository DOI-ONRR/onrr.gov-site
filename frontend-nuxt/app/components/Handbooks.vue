<script setup>
/*
  Handbooks index — the card list on the References › Handbooks page. Rendered
  in the default page template via CollectionBlock (collection === 'handbooks'),
  mirroring the Rulemakings / ReporterLetters reference-list pattern. Each card
  links to the interactive handbook (when one exists) and a downloadable file.
*/
import getHandbooks from '@/graphql/queries/collections/handbooks/getHandbooks.gql'

const { data } = await useAsyncQuery(getHandbooks)
const handbooks = computed(() => data.value?.handbooks ?? [])
</script>

<template>
  <div class="handbooks-index margin-top-4">
    <div v-for="h in handbooks" :key="h.id" class="hb-card">
      <h2>{{ h.title }}</h2>
      <p v-if="h.release" class="margin-0"><span class="hb-release">{{ h.release }}</span></p>
      <NuxtLink
        v-if="h.interactive_page?.url"
        class="usa-button usa-button--outline"
        :to="h.interactive_page.url"
      >Interactive handbook</NuxtLink>
      <a
        class="usa-button usa-button--unstyled"
        :class="{ 'margin-left-1': h.interactive_page?.url }"
        :href="h.download_url"
      >Download<template v-if="h.format"> ({{ h.format }})</template></a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.hb-card {
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-blue;
  border-radius: 0 0 4px 4px;
  background: #fff;
  padding: 1.25rem 1.4rem;
  margin-bottom: 1.25rem;

  h2 { margin: 0 0 0.35rem; font-size: 1.2rem; line-height: 1.25; }
  .usa-button { margin: 0.75rem 0.5rem 0 0; }
}

.hb-release {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2c5c2e;
  background: #ecf3ec;
  border-radius: 3px;
  padding: 0.1rem 0.45rem;
}
</style>
