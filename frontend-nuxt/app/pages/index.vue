<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'

const { assetUrl, resolveImages } = useCmsContent()

const { data } = await useAsyncQuery(getPageBySlug, { slug: null })
const page = computed(() => data.value?.page?.[0])
</script>

<template>
  <div v-if="page?.hero_image?.id" class="hero">
    <img
      :src="assetUrl(page.hero_image.id)"
      :alt="page.hero_image.description || ''"
      class="hero__image"
    />
    <div v-if="page?.hero_title" class="hero__overlay grid-container">
      <div class="grid-row">
        <div class="grid-col-8">
          <h1 class="hero__title">{{ page.hero_title }}</h1>
        </div>
      </div>
    </div>
  </div>
  <section class="grid-container usa-section">
    <div class="grid-row grid-gap">
      <div class="grid-col-8">
        <div class="grid-row">
          <div
            v-for="block in page?.page_blocks"
            :key="block.id"
            :class="`grid-col-${block.item?.block_v_col || 12} margin-bottom-3`"
          >
            <div
              v-if="block.item?.__typename === 'content_blocks'"
              v-html="block.item.block_content_html || block.item.block_content"
            />
            <TabsBlock
              v-else-if="block.item?.__typename === 'tab_blocks'"
              :block="block.item"
            />
            <ExpansionPanelBlock
              v-else-if="block.item?.__typename === 'expansion_panels'"
              :block="block.item"
            />
            <CardBlock
              v-else-if="block.item?.__typename === 'card_blocks'"
              :block="block.item"
            />
            <CollectionBlock
              v-else-if="block.item?.__typename === 'collection_blocks'"
              :block="block.item"
            />
          </div>
        </div>
      </div>
      <div class="grid-col-4">
        <div
          v-for="block in page?.sidebar_blocks"
          :key="block.id"
          class="margin-bottom-3"
        >
          <div
            v-if="block.item?.__typename === 'content_blocks'"
            v-html="resolveImages(block.item.block_content_html || block.item.block_content)"
          />
          <CollectionBlock
            v-else-if="block.item?.__typename === 'collection_blocks'"
            :block="block.item"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.hero {
  position: relative;
}

.hero__image {
  display: block;
  width: 100%;
  @include u-margin-bottom(4);
}

.hero__overlay {
  position: absolute;
  top: units(4);
  left: 0;
  right: 0;
}

.hero__title {
  background-color: rgba(255, 255, 255, 0.5);
  padding: units(4);
  margin: 0;
  font-size: size('sans', 'lg');
  @include u-line-height('sans', 6);
  @include u-radius('md');
}
</style>
