<script setup>
const props = defineProps({
  block: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()
</script>

<template>
  <div class="usa-card">
    <div class="usa-card__container">
      <div class="usa-card__body">
        <div
          v-if="block.block_content_html || block.block_content"
          v-html="resolveImages(block.block_content_html || block.block_content)"
        />
        <template v-if="block.card_content_blocks?.length">
          <div
            v-for="child in block.card_content_blocks"
            :key="child.id"
          >
            <div
              v-if="child.item?.__typename === 'content_blocks'"
              v-html="resolveImages(child.item.block_content_html || child.item.block_content)"
            />
            <CollectionBlock
              v-else-if="child.item?.__typename === 'collection_blocks'"
              :block="child.item"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.usa-card {
  height: 100%;
}

.usa-card__container {
  height: 100%;
}
</style>
