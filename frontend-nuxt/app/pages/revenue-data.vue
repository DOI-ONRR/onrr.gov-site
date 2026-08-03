<script setup>
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const route = useRoute()

const { data: menuData } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: 'Revenue Data',
})

</script> 

<template>
  <section class="grid-container usa-section margin-top-4">
    <div class="grid-row">
      <div class="grid-col">
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
      </div>
    </div>
  </section>

  <section class="grid-container padding-bottom-3">
    <div class="grid-row">
      <div class="tablet:grid-col-8">
        <h1 class="margin-bottom-1">Revenue Data</h1>
        <p class="usa-intro">
          How much energy and mineral revenue is collected from federal and Indian lands, where it
          comes from, and where the money goes — explorable, downloadable, and updated monthly.
        </p>
        <p>
          <a class="usa-button margin-bottom-2 tablet:margin-bottom-0" href="#explore">Explore the data</a>
          <a class="usa-button usa-button--outline" href="#datasets">Find a dataset</a>
        </p>
      </div>
    </div>
  </section>

  <section class="grid-container padding-bottom-4" id="explore">
    <h2 class="font-heading-lg margin-bottom-1">Explore the data</h2>
    <p class="section-lede margin-top-0">Curated views of the headline numbers. Every chart links to the dataset
      behind it, where you can filter to exactly the records you need.</p>
    <div class="grid-row grid-gap">
      <div class="tablet:grid-col-6 margin-bottom-2">
        <ChartCardByKey chart-key="disbursements-by-year" />
      </div>
      <div class="tablet:grid-col-6 margin-bottom-2">
        <ChartCardByKey chart-key="disbursements-top-states" />
      </div>
    </div>
    <p class="margin-top-1">Want the story behind these numbers? <a class="usa-link" href="../learn-page/index.html">How revenue works</a>
      explains the path from production to disbursement in plain language.</p>
  </section>

  <section class="grid-container padding-bottom-5" id="datasets">
    <h2 class="font-heading-lg margin-bottom-1">Find a dataset</h2>
    <p class="section-lede margin-top-0">One page per dataset: preview the records, filter to what you need,
      download files, or use the API. No separate query and download tools.</p>
    <div class="grid-row grid-gap">
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Monthly disbursements</h3>
          <p class="ds-desc">Money paid each month to states, counties, Tribes and individual Indian
            mineral owners, and federal funds.</p>
          <p class="ds-meta">Updated monthly · Oct 2016 – Oct 2022 · CSV, XLSX, API</p>
          <a class="usa-button usa-button--outline ds-cta" href="../dataset-page/index.html">Preview, filter &amp; download</a>
        </div>
      </div>
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Production</h3>
          <p class="ds-desc">Volumes of oil, gas, coal, and other commodities produced on federal
            and Indian lands.</p>
          <p class="ds-meta">Updated monthly, plus fiscal and calendar year · CSV, XLSX, API</p>
          <a class="usa-button usa-button--outline ds-cta" href="#" aria-disabled="true">Preview, filter &amp; download</a>
        </div>
      </div>
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Revenue</h3>
          <p class="ds-desc">Royalties, rents, bonuses, and other payments companies make for
            producing on federal and Indian lands.</p>
          <p class="ds-meta">Updated monthly, plus fiscal and calendar year · CSV, XLSX, API</p>
          <a class="usa-button usa-button--outline ds-cta" href="#" aria-disabled="true">Preview, filter &amp; download</a>
        </div>
      </div>
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Federal sales</h3>
          <p class="ds-desc">Sales of federal royalty gas taken in kind rather than in value.</p>
          <p class="ds-meta">Updated periodically · CSV, XLSX, API</p>
          <a class="usa-button usa-button--outline ds-cta" href="#" aria-disabled="true">Preview, filter &amp; download</a>
        </div>
      </div>
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Revenue by company</h3>
          <p class="ds-desc">Federal revenue itemized by the company that reported it, by calendar year.</p>
          <p class="ds-meta">Updated annually · CSV, XLSX, API</p>
          <a class="usa-button usa-button--outline ds-cta" href="#" aria-disabled="true">Preview, filter &amp; download</a>
        </div>
      </div>
      <div class="tablet:grid-col-4 margin-bottom-2">
        <div class="ds-card padding-3">
          <h3 class="font-heading-md">Reference data</h3>
          <p class="ds-desc">Commodities, periods, funds, and locations — the shared reference lists
            that power filters across every dataset.</p>
          <p class="ds-meta">Updated as needed · API</p>
          <a class="usa-button usa-button--unstyled ds-cta" href="#">About the reference data</a>
        </div>
      </div>
    </div>
  </section>

  <section class="about-band padding-y-4" id="about">
    <div class="grid-container">
      <div class="grid-row">
        <div class="tablet:grid-col-8">
          <h2 class="font-heading-md margin-top-0">About this data</h2>
          <p class="margin-bottom-1">Data comes from ONRR's financial and production reporting systems, is loaded
            monthly, and is preliminary until the fiscal year closes. Read about
            <a class="usa-link" href="#">how the data is collected and validated</a>, or start with
            <a class="usa-link" href="../learn-page/index.html">how revenue works</a>.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.usa-sidenav .usa-current::before {
  background-color: $onrr-navy !important;
}

.ds-card { border: 1px solid #dfe1e2; border-radius: 4px; background: #fff; height: 100%; display: flex; flex-direction: column; }

.ds-card h3 { margin-top: 0; }

.ds-cta { margin-top: auto; }

.ds-desc { font-size: 0.93rem; color: #1b1b1b; }

.ds-meta { font-size: 0.82rem; color: #565c65; margin: 0.5rem 0 1rem; }
</style>
