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

const pageTitle = computed(() => page.value?.title || null)
const parentTitle = computed(() => page.value?.parent?.title || null)

const { data: menuByPageTitle } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: pageTitle.value,
}, { enabled: !!pageTitle.value })

const { data: menuByParentTitle } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: parentTitle.value,
}, { enabled: !!parentTitle.value && !menuByPageTitle.value?.menus?.length })

const menuData = computed(() => {
  if (menuByPageTitle.value?.menus?.length) return menuByPageTitle.value
  return menuByParentTitle.value
})

const parentLink = computed(() => menuData.value?.menus?.[0]?.link_to_page || null)

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
      <div class="grid-col-2">
        <nav v-if="sidenavLinks.length" aria-label="Side navigation">
          <ul class="usa-sidenav">
            <li class="usa-sidenav__item" v-for="link in sidenavLinks" :key="link.title">
              <NuxtLink :to="link.url" :class="{ 'usa-current': link.url === route.path }">
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div class="grid-col-10">
        <nav class="usa-breadcrumb" aria-label="Breadcrumbs">
          <ol class="usa-breadcrumb__list">
            <li class="usa-breadcrumb__list-item">
              <NuxtLink to="/" class="usa-breadcrumb__link">Home</NuxtLink>
            </li>
            <li v-if="parentLink" class="usa-breadcrumb__list-item">
              <NuxtLink :to="parentLink.url" class="usa-breadcrumb__link">
                {{ parentLink.title }}
              </NuxtLink>
            </li>
            <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
              <span>{{ page?.title }}</span>
            </li>
          </ol>
        </nav>
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
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.usa-sidenav .usa-current::before {
  background-color: $color-medium-green !important;
}
</style>
