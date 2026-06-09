<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const props = defineProps({
  block: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const route = useRoute()
const router = useRouter()
const { resolveImages } = useCmsContent()

function toKebabCase(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

function getTabSegments() {
  const param = route.query.tabs
  if (!param) return []
  return param.split(',')
}

const selectedIndex = computed(() => {
  const segments = getTabSegments()
  const segment = segments[props.depth]
  if (!segment) return 0
  const idx = tabs.value.findIndex((t) => toKebabCase(t.label) === segment)
  return idx >= 0 ? idx : 0
})

function onTabChange(index) {
  const segments = getTabSegments()
  const slug = toKebabCase(tabs.value[index].label)
  // Set this depth's segment and trim any deeper segments
  segments[props.depth] = slug
  const newSegments = segments.slice(0, props.depth + 1)
  router.replace({ query: { ...route.query, tabs: newSegments.join(',') } })
}
</script>

<template>
  <TabGroup as="div" :selected-index="selectedIndex" @change="onTabChange">
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
      <TabPanel v-for="(tab, i) in tabs" :key="i" :unmount="false">
        <div class="grid-row grid-gap margin-top-4">
          <div
            v-for="block in tab.blocks"
            :key="block.id"
            :class="`grid-col-${block.item?.block_v_col || 12}`"
          >
            <div
              v-if="block.item?.__typename === 'content_blocks'"
              v-html="resolveImages(block.item.block_content_html)"
            />
            <TabsBlock
              v-else-if="block.item?.__typename === 'tab_blocks'"
              :block="block.item"
              :depth="depth + 1"
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
