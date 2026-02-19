<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'

const route = useRoute()
const slug = computed(() => route.params.slug?.at(-1) || null)

const { resolveImages } = useCmsContent()
const { data } = await useAsyncQuery(getPageBySlug, { slug: slug.value })
const page = computed(() => data.value?.page?.[0])

const parentTitle = computed(() => page.value?.parent?.title || null)

const { data: menuData } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: parentTitle.value,
}, { enabled: !!parentTitle.value })

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
  <section class="grid-container usa-section">
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
