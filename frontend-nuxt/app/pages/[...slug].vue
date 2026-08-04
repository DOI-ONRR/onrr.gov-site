<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'

definePageMeta({
  key: (route) => route.fullPath,
})

const route = useRoute()
const slug = computed(() => route.params.slug?.at(-1) || null)

const { resolveImages, assetUrl } = useCmsContent()
const { data } = await useAsyncQuery(getPageBySlug, { slug: slug.value })
const page = computed(() => data.value?.page?.[0])

// A page with an associated dataset_metadata record renders as a dataset page
// (DatasetView) instead of the standard page_blocks layout — and drops the sidenav.
const isDataset = computed(() => !!page.value?.dataset_metadata)

const pageTitle = computed(() => page.value?.title || null)
const parentTitle = computed(() => page.value?.parent?.title || null)
const grandparentTitle = computed(() => page.value?.parent?.parent?.title || null)

const { data: menuByPageTitle } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: pageTitle.value,
}, { enabled: !!pageTitle.value })

const { data: menuByParentTitle } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: parentTitle.value,
}, { enabled: !!parentTitle.value && !menuByPageTitle.value?.menus?.length })

const { data: menuByGrandparentTitle } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: grandparentTitle.value,
}, { enabled: !!grandparentTitle.value && !menuByPageTitle.value?.menus?.length && !menuByParentTitle.value?.menus?.length })

const menuData = computed(() => {
  if (menuByPageTitle.value?.menus?.length) return menuByPageTitle.value
  if (menuByParentTitle.value?.menus?.length) return menuByParentTitle.value
  return menuByGrandparentTitle.value
})

const parentLink = computed(() => menuData.value?.menus?.[0]?.link_to_page || null)
const parentUrl = computed(() => page.value?.parent?.url || null)

const isGrandchild = computed(() => !!menuByGrandparentTitle.value?.menus?.length)

function isSidenavCurrent(linkUrl) {
  if (linkUrl === route.path) return true
  if (isGrandchild.value && parentUrl.value && linkUrl === parentUrl.value) return true
  return false
}

const sidenavLinks = computed(() => {
  const menu = menuData.value?.menus?.[0]
  if (!menu) return []
  const links = []
  if (menu.link_to_page) links.push(menu.link_to_page)
  menu.menu_children?.forEach((child) => {
    if (child.pages_id) links.push(child.pages_id)
  })
  return links
})
</script>

<template>
  <img
    v-if="page?.hero_image?.id"
    :src="assetUrl(page.hero_image.id)"
    :alt="page.hero_image.description || ''"
    class="width-full"
  />
  <section class="grid-container usa-section margin-top-4">
    <div class="grid-row grid-gap">
      <div v-if="!isDataset" class="grid-col-2">
        <nav v-if="sidenavLinks.length" aria-label="Side navigation">
          <ul class="usa-sidenav">
            <li class="usa-sidenav__item" v-for="link in sidenavLinks" :key="link.title">
              <NuxtLink :to="link.url" :class="{ 'usa-current': isSidenavCurrent(link.url) }">
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div :class="isDataset ? 'grid-col-12' : 'grid-col-10'">
        <nav class="usa-breadcrumb" aria-label="Breadcrumbs">
          <ol class="usa-breadcrumb__list">
            <li class="usa-breadcrumb__list-item">
              <NuxtLink to="/" class="usa-breadcrumb__link">Home</NuxtLink>
            </li>
            <li v-if="parentLink && parentLink.url !== '/' && parentLink.url !== route.path" class="usa-breadcrumb__list-item">
              <NuxtLink :to="parentLink.url" class="usa-breadcrumb__link">
                {{ parentLink.title }}
              </NuxtLink>
            </li>
            <li v-if="parentUrl && parentUrl !== '/' && parentUrl !== parentLink?.url" class="usa-breadcrumb__list-item">
              <NuxtLink :to="parentUrl" class="usa-breadcrumb__link">
                {{ parentTitle }}
              </NuxtLink>
            </li>
            <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
              <span>{{ page?.title }}</span>
            </li>
          </ol>
        </nav>
        <h1 v-if="!isDataset">{{ page?.hero_title || page?.title }}</h1>
        <DatasetView v-if="isDataset" :dataset="page.dataset_metadata" />
        <template v-else>
        <Events v-if="slug === 'events'" />
        <div class="grid-row grid-gap">
          <div
            v-for="block in page?.page_blocks"
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
            <ChartCard
              v-else-if="block.item?.__typename === 'chart_cards'"
              :block="block.item"
            />
          </div>
        </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.usa-sidenav .usa-current::before {
  background-color: $onrr-violet !important;
}
</style>
