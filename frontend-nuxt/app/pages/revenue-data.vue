<script setup>
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'
import landingPageProduction from '@/graphql/queries/pages/revenue-data/landingPageProduction.gql'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const route = useRoute()

const { data: menuData } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: 'Revenue Data',
})

const { data } = await useAsyncQuery(landingPageProduction)

const production = computed(() => {
  const totals = data.value?.production_totals || []
  const periods = Object.fromEntries((data.value?.period || []).map(p => [p.id, p]))
  const commodities = Object.fromEntries((data.value?.commodity || []).map(c => [c.id, c]))
  const locations = Object.fromEntries((data.value?.location || []).map(l => [l.id, l]))

  return totals.map(row => {
    const period = periods[row.group.period] || {}
    const commodity = commodities[row.group.commodity] || {}
    const location = locations[row.group.location] || {}

    return {
      source: location.source,
      product: commodity.product,
      total_volume: row.sum.volume,
      month_long: period.month_long,
      period_date: period.period_date,
      calendar_year: period.calendar_year,
      fiscal_year: period.fiscal_year,
      fiscal_month: period.fiscal_month,
    }
  })
})

const selectedFrequency = ref('Yearly')
const selectedProduct = ref('Oil (bbl)')

const now = new Date()
const mostRecentCalendarYear = now.getFullYear() - 1
const mostRecentFiscalYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1

const periodOptions = computed(() => {
  if (selectedFrequency.value === 'Yearly') {
    return ['Fiscal Year', 'Calendar Year']
  }
  return [
    'Most Recent 12 Months',
    `Fiscal Year ${mostRecentFiscalYear}`,
    `Calendar Year ${mostRecentCalendarYear}`,
  ]
})

const selectedPeriod = ref('Fiscal Year')

watch(selectedFrequency, () => {
  selectedPeriod.value = periodOptions.value[0]
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
              <h3>Production</h3>
              <p>The volume of natural resources produced on property owned by the federal government and Native Americans.</p>
              <div class="display-flex flex-row flex-align-end">
                <div class="margin-right-2">
                  <label class="usa-label usa-sr-only">Frequency</label>
                  <ul class="usa-button-group usa-button-group--segmented margin-top-05">
                    <li class="usa-button-group__item">
                      <button type="button" class="usa-button"
                        :class="{ 'usa-button--outline': selectedFrequency !== 'Yearly' }"
                        @click="selectedFrequency = 'Yearly'">Yearly</button>
                    </li>
                    <li class="usa-button-group__item">
                      <button type="button" class="usa-button"
                        :class="{ 'usa-button--outline': selectedFrequency !== 'Monthly' }"
                        @click="selectedFrequency = 'Monthly'">Monthly</button>
                    </li>
                  </ul>
                </div>
                <div class="padding-bottom-05 margin-right-2 flex-1">
                  <label class="usa-label margin-top-05" for="period-select">Period</label>
                  <select class="usa-select" name="period-select" id="period-select" v-model="selectedPeriod">
                    <option v-for="option in periodOptions" :key="option">{{ option }}</option>
                  </select>
                </div>
                <div class="padding-bottom-05 flex-1">
                  <label class="usa-label margin-top-05" for="product-select">Product</label>
                  <select class="usa-select" name="product-select" id="product-select" v-model="selectedProduct">
                    <option>Oil (bbl)</option>
                    <option>Gas (mcf)</option>
                    <option>Coal (tons)</option>
                  </select>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <h3>Revenue</h3>
              <p>The amount of money collected from natural resources on property owned by the federal government and Native Americans.</p>
            </TabPanel>
            <TabPanel>
              <h3>Disbursements</h3>
              <p>The amount of money paid to federal and local governments and Native Americans.</p>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <div class="grid-col-3">
        <h2>What's New</h2>
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
