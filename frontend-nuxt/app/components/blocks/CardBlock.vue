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
          v-if="block.block_content_html"
          v-html="sanitizeHtml(resolveImages(block.block_content_html))"
        />
        <div v-if="block.card_content_blocks?.length" class="grid-row grid-gap">
          <div
            v-for="child in block.card_content_blocks"
            :key="child.id"
            :class="`grid-col-${child.item?.block_v_col || 12}`"
          >
            <div
              v-if="child.item?.__typename === 'content_blocks'"
              v-html="sanitizeHtml(resolveImages(child.item.block_content_html))"
            />
            <CollectionBlock
              v-else-if="child.item?.__typename === 'collection_blocks'"
              :block="child.item"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;
@use "uswds-theme" as *;

.usa-card {
  height: 100%;
  @include u-margin-bottom(0);
}

.usa-card__container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-navy;
  border-radius: 0 0 4px 4px;
  background: #fff;
  @include u-margin-x(0);
}

.usa-card__body {
  padding: 1.5rem;

  // WYSIWYG content — mirror the payment-options link-card type. Headings inherit the
  // USWDS heading font (Merriweather); we only match size/weight/line-height/color.
  :deep(:is(h2, h3, h4)) {
    font-size: 1.04rem;
    font-weight: 700;
    line-height: 1.25;
    color: #1b1b1b;
    margin: 0 0 0.4rem;
  }

  // Exclude .usa-button so an <a class="usa-button"> keeps its own button text color
  // (white / variant color) instead of being repainted as a link.
  :deep(a:not(.usa-button)) { color: $onrr-blue; }

  :deep(p),
  :deep(li) { font-size: 0.93rem; color: #3d4551; }

  :deep(p) { margin: 0 0 0.5rem; }
  :deep(p:last-child) { margin-bottom: 0; }
}
</style>
