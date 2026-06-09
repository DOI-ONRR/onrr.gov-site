<script setup>
const props = defineProps({
  block: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()

const panels = computed(() => {
  const items = []
  props.block.expansion_panel_blocks?.forEach((entry) => {
    if (!entry.item) return
    if (entry.item.__typename === 'expansion_panel_block_label') {
      items.push({ id: entry.id, label: entry.item.block_label, blocks: [] })
    } else if (items.length) {
      items[items.length - 1].blocks.push(entry)
    }
  })
  return items
})

const openByDefaultIds = computed(() => {
  const val = props.block.open_by_default
  if (!val) return []
  if (Array.isArray(val)) return val.map((item) => item.id)
  return val.id ? [val.id] : []
})

const expandedPanels = ref(new Set(openByDefaultIds.value))

function toggle(id) {
  const next = new Set(expandedPanels.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedPanels.value = next
}
</script>

<template>
  <div class="usa-accordion">
    <template v-for="panel in panels" :key="panel.id">
      <h4 class="usa-accordion__heading">
        <button
          type="button"
          class="usa-accordion__button"
          :aria-expanded="expandedPanels.has(panel.id)"
          :aria-controls="`accordion-${panel.id}`"
          @click="toggle(panel.id)"
        >
          {{ panel.label }}
        </button>
      </h4>
      <div
        :id="`accordion-${panel.id}`"
        class="usa-accordion__content usa-prose"
        :hidden="!expandedPanels.has(panel.id)"
      >
        <div
          v-for="child in panel.blocks"
          :key="child.id"
        >
          <div
            v-if="child.item?.__typename === 'content_blocks'"
            v-html="resolveImages(child.item.block_content_html)"
          />
          <CardBlock
            v-else-if="child.item?.__typename === 'card_blocks'"
            :block="child.item"
          />
          <CollectionBlock
            v-else-if="child.item?.__typename === 'collection_blocks'"
            :block="child.item"
          />
        </div>
      </div>
    </template>
  </div>
</template>
