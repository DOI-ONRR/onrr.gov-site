<script setup>
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const route = useRoute()

const { data: menuData } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: 'Revenue Data',
})

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
      <div class="grid-col-7">
        <nav class="usa-breadcrumb" aria-label="Breadcrumbs">
          <ol class="usa-breadcrumb__list">
            <li class="usa-breadcrumb__list-item">
              <NuxtLink to="/" class="usa-breadcrumb__link">Home</NuxtLink>
            </li>
            <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
              <span>Revenue Data</span>
            </li>
          </ol>
        </nav>
        <h1>About natural resources revenue data</h1>
        <p class="line-height-body-4">Companies pay to produce energy and minerals on federal lands, Native American lands, and the Outer Continental Shelf. The payments these companies make include bonuses, rents, and royalties. The Office of Natural Resources Revenue (ONRR)  collects these payments and distributes them. The payments go to federal and local governments and Native Americans.</p>

        <TabGroup as="div" class="margin-top-4">
          <TabList class="tabs-block__list">
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Production</button>
            </Tab>
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Revenue</button>
            </Tab>
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Disbursements</button>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ProductionTab />
            </TabPanel>
            <TabPanel>
              <RevenueTab />
            </TabPanel>
            <TabPanel>
              <DisbursementsTab />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <div class="grid-col-3">
        <h2>What's New</h2>
        <ul class="usa-card-group">
          <li class="usa-card grid-col-12 card--accent-left accent-teal">
            <WhatsNewProduction />
          </li>
          <li class="usa-card grid-col-12 card--accent-left accent-teal">
            <WhatsNewRevenue />
          </li>
          <li class="usa-card grid-col-12 card--accent-left accent-teal">
            <WhatsNewDisbursements />
          </li>
          <li class="usa-card grid-col-12 card--accent-left accent-teal">
            <div class="usa-card__container">
              <div class="usa-card__header">
                <h4 class="usa-card__heading text-center font-ui-lg">Monthly fact sheet</h4>
              </div>
              <div class="usa-card__body">
                <p class="margin-bottom-2">Fact sheet summarizing disbursements, revenue, and production data by month on federal and Native American lands.</p>
              </div>
            </div>
          </li>
          <li class="usa-card grid-col-12 card--accent-left accent-green">
            <LatestReleaseDetails />
          </li>
        </ul>
        
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.usa-sidenav .usa-current::before {
  background-color: $onrr-green !important;
}
</style>
