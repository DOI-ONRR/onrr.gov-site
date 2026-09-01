<script setup>
import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'
import getContactTopics from '@/graphql/queries/collections/contacts/getContactTopics.gql'

definePageMeta({
  key: (route) => route.fullPath,
})

const route = useRoute()
const slug = computed(() => route.params.slug?.at(-1) || null)

const { resolveImages, assetUrl } = useCmsContent()
const { data } = await useAsyncQuery(getPageBySlug, { slug: slug.value })
const page = computed(() => data.value?.page?.[0])

// Contact-topic fallback: /about/contact/<slug> with no authored CMS page → render the
// topic's contacts directory directly, so every hub topic works before its page exists.
const contactFallbackWanted = !page.value && route.path.startsWith('/about/contact/')
const { data: contactTopicsData } = await useAsyncQuery(getContactTopics, {}, { enabled: contactFallbackWanted })
const fallbackTopic = computed(() =>
  contactFallbackWanted
    ? ((contactTopicsData.value?.contact_topics ?? []).find((t) => t.slug === slug.value) ?? null)
    : null,
)

// A page with an associated dataset_metadata record renders as a dataset page
// (DatasetView) instead of the standard page_blocks layout — and drops the sidenav.
const isDataset = computed(() => !!page.value?.dataset_metadata)

// pages.template selects an alternate layout. 'topic' → TopicView (3/9 grid with an
// "On this page" rail); like the dataset case, it drops the standard sidenav.
const isTopic = computed(() => page.value?.template === 'topic')

// 'journey-landing' → JourneyLandingView (a hero + process-list of steps, like the
// Getting Started / Reporting / Paying mockups); also drops the standard sidenav.
const isJourneyLanding = computed(() => page.value?.template === 'journey-landing')

// 'audience-hub' → AudienceHubView (Indian Resources mockup): an audience-routing hub of
// alternating full-width bands + constrained containers. Unlike the other custom layouts
// it renders at the page TOP LEVEL (outside the shared .grid-container) so its header and
// data bands are genuinely full-width, and it owns its own breadcrumb inside the header.
const isAudienceHub = computed(() => page.value?.template === 'audience-hub')

// 'handbook' → HandbookDetailView (interactive handbook: rail + TOC/chapters/
// supplemental/contact sections). Like DatasetView it reads a M2O off the page
// (page.handbook) and owns its own heading + 3/9 column structure.
const isHandbook = computed(() => page.value?.template === 'handbook')

// Layouts that own their own heading + column structure (no standard sidenav/h1).
const isCustomLayout = computed(
  () => isDataset.value || isTopic.value || isJourneyLanding.value || isAudienceHub.value || isHandbook.value,
)

const isFullWidth = computed(() => page.value?.template === 'full-width')

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
  <!-- audience-hub renders at the top level (full-width bands own their own container +
       breadcrumb); every other template renders inside the shared constrained section. -->
  <AudienceHubView
    v-if="isAudienceHub"
    :page="page"
    :parent-link="parentLink"
    :parent-url="parentUrl"
    :parent-title="parentTitle"
  />
  <!-- contact-topic fallback (no CMS page authored for this topic yet) -->
  <section v-else-if="fallbackTopic" class="grid-container usa-section margin-top-4">
    <Breadcrumbs
      :page="{ title: `${fallbackTopic.title} contacts` }"
      :parent-link="{ title: 'Contact', url: '/about/contact' }"
    />
    <h1 class="margin-bottom-1">{{ fallbackTopic.title }} contacts</h1>
    <p v-if="fallbackTopic.description" class="usa-intro">{{ fallbackTopic.description }}</p>
    <ContactDirectory :topic="fallbackTopic.slug" />
  </section>
  <section v-else class="grid-container usa-section margin-top-4">
    <div class="grid-row grid-gap">
      <div v-if="!isCustomLayout && !isFullWidth" class="grid-col-2">
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
      <div :class="isCustomLayout || isFullWidth ? 'grid-col-12' : 'grid-col-10'">
        <Breadcrumbs
          :page="page"
          :parent-link="parentLink"
          :parent-url="parentUrl"
          :parent-title="parentTitle"
        />
        <h1 v-if="!isCustomLayout">{{ page?.hero_title || page?.title }}</h1>
        <DatasetView v-if="isDataset" :dataset="page.dataset_metadata" />
        <TopicView v-else-if="isTopic" :page="page" />
        <JourneyLandingView v-else-if="isJourneyLanding" :page="page" />
        <HandbookDetailView v-else-if="isHandbook" :page="page" />
        <template v-else>
        <!-- page_bands render (constrained) above any page_blocks; full-width pages
             like Payment options are built entirely from bands. -->
        <PageBands v-if="page?.page_bands?.length" :bands="page.page_bands" :bleed="false" />
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
            <PayGovForm
              v-else-if="block.item?.__typename === 'pay_gov_forms'"
              :block="block.item"
            />
            <ContactBox
              v-else-if="block.item?.__typename === 'contact_boxes'"
              :block="block.item"
            />
            <DataTable
              v-else-if="block.item?.__typename === 'data_tables'"
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
