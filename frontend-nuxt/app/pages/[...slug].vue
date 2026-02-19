<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'

const route = useRoute()
const slug = computed(() => route.params.slug?.at(-1) || null)

const { resolveImages } = useCmsContent()
const { data } = await useAsyncQuery(getPageBySlug, { slug: slug.value })
const page = computed(() => data.value?.page?.[0])
</script>

<template>
  <section class="grid-container usa-section">
    <div class="grid-row grid-gap">
      <div class="grid-col-2">
      </div>
      <div class="grid-col-10">
        <h1>{{ page?.hero_title || page?.title }}</h1>
        <div class="grid-row grid-gap">
          <div
            v-for="block in page?.page_blocks"
            :key="block.id"
            :class="`grid-col-${block.item?.block_v_col || 12}`"
          >
            <div
              v-if="block.item?.__typename === 'content_blocks'"
              v-html="resolveImages(block.item.block_content_html || block.item.block_content)"
            />
            <TabsBlock
              v-else-if="block.item?.__typename === 'tab_blocks'"
              :block="block.item"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
