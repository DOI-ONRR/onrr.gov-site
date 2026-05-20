<script setup>
import getContentBlockByLabel from '@/graphql/queries/collections/content_blocks/getContentBlockByLabel.gql'

const { data } = await useAsyncQuery(getContentBlockByLabel, {
  label: 'Latest release details',
})

const block = computed(() => data.value?.content_blocks?.[0])
</script>

<template>
  <div v-if="block" class="usa-card__container">
    <div class="usa-card__header">
      <h4 class="usa-card__heading text-center font-ui-lg">{{ block.block_label }}</h4>
    </div>
    <div class="usa-card__body" v-html="block.block_content_html" />
  </div>
</template>
