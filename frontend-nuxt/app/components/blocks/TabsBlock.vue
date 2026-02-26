<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const props = defineProps({
  block: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()

const pressReleaseConfig = {
  'Current Press Releases': { status: 'published', paginate: false },
  'Press Release Archive': { status: 'archived', paginate: true },
}

const tabs = computed(() => {
  const items = []
  props.block.tab_blocks?.forEach((entry) => {
    if (!entry.item) return
    if (entry.item.__typename === 'tab_block_label') {
      const label = entry.item.tab_block_label
      const config = pressReleaseConfig[label] || null
      items.push({
        label,
        blocks: [],
        pressRelease: config,
      })
    } else if (items.length) {
      items[items.length - 1].blocks.push(entry)
    }
  })
  return items
})
</script>

<template>
  <TabGroup as="div">
    <TabList class="tabs-block__list">
      <Tab v-for="(tab, i) in tabs" :key="i" v-slot="{ selected }" as="template">
        <button
          class="tabs-block__tab"
          :class="{ 'tabs-block__tab--selected': selected }"
          v-html="tab.label"
        />
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel v-for="(tab, i) in tabs" :key="i">
        <div class="grid-row grid-gap margin-top-4">
          <div
            v-for="block in tab.blocks"
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
        <PressReleases v-if="tab.pressRelease" :status="tab.pressRelease.status" :paginate="tab.pressRelease.paginate" />
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.tabs-block__list {
  display: flex;
  border-bottom: 1px solid color('base-lighter');
  gap: units(1);
}

.tabs-block__tab {
  @include typeset('sans', 'sm', 3);
  padding: units(1) units(2);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: color('base-dark');

  &:hover {
    color: color('primary');
  }

  &--selected {
    color: color('primary');
    border-bottom-color: color('primary');
    font-weight: fw('bold');
  }
}
</style>
