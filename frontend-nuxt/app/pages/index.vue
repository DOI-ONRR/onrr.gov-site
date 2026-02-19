<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'

const { data } = await useAsyncQuery(getPageBySlug, { slug: null })
const page = computed(() => data.value?.page?.[0])
</script>

<template>
  <section class="grid-container usa-section">
    <div class="grid-row grid-gap">
      <div class="grid-col-12">
        <h1>{{ page?.hero_title || page?.title }}</h1>
        <div
          v-for="block in page?.page_blocks"
          :key="block.id"
        >
          <div
            v-if="block.item?.__typename === 'content_blocks'"
            v-html="block.item.block_content_html || block.item.block_content"
          />
          <ExpansionPanelBlock
            v-else-if="block.item?.__typename === 'expansion_panels'"
            :block="block.item"
          />
          <CardBlock
            v-else-if="block.item?.__typename === 'card_blocks'"
            :block="block.item"
          />
        </div>
      </div>
    </div>
  </section>
</template>
