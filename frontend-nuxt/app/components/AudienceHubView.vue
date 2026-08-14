<script setup>
/*
  AudienceHubView — renders an "audience-hub" page (pages.template === 'audience-hub'),
  modeled on the Indian Resources mockup: an audience-routing hub whose body is a stack
  of alternating full-width bands and constrained containers.

  Chosen in [...slug].vue by the page's template field. Unlike the other custom layouts,
  this view is rendered at the PAGE TOP LEVEL (a sibling of, not nested inside, the shared
  `.grid-container.usa-section` wrapper) so its bands can be genuinely full-width — the
  tinted `.hub-header` and `.data-band` span the viewport, with an inner `.grid-container`
  re-constraining their content. No 100vw breakout hack is needed.

  The breadcrumb lives INSIDE the tinted header band (per the mockup), so [...slug].vue
  passes the resolved breadcrumb inputs down and this view renders <Breadcrumbs> itself.

  Intro prose comes from the page's page_blocks (content_blocks), matching the convention
  used by JourneyLandingView. The audience cards / services / data band come from dedicated
  collections (wired in a following iteration).
*/
const props = defineProps({
  page: { type: Object, required: true },
  parentLink: { type: Object, default: null },
  parentUrl: { type: String, default: null },
  parentTitle: { type: String, default: null },
})

const { resolveImages } = useCmsContent()

const introBlocks = computed(
  () => (props.page?.page_blocks ?? []).filter((b) => b.item?.__typename === 'content_blocks'),
)

const audienceCards = computed(() => props.page?.audience_cards ?? [])
const audienceHeading = computed(() => props.page?.audience_heading || null)

const services = computed(() => props.page?.hub_services ?? [])
const servicesHeading = computed(() => props.page?.services_heading || null)

const hubLinks = computed(() => props.page?.hub_links ?? [])
const help = computed(() => hubLinks.value.find((l) => l.section === 'help') || null)
const dataLinks = computed(() => hubLinks.value.filter((l) => l.section === 'data-link'))

const chart = computed(() => props.page?.hub_chart || null)
const dataHeading = computed(() => props.page?.data_heading || null)
</script>

<template>
  <div class="audience-hub">
    <!-- Full-width tinted header band: breadcrumb + h1 + intro. The band spans the
         viewport; the inner .grid-container re-constrains its content to the site width. -->
    <div class="hub-header">
      <div class="grid-container padding-top-2 padding-bottom-4">
        <Breadcrumbs
          :page="page"
          :parent-link="parentLink"
          :parent-url="parentUrl"
          :parent-title="parentTitle"
        />
        <div class="grid-row">
          <div class="tablet:grid-col-9">
            <h1 class="margin-bottom-1">{{ page?.hero_title || page?.title }}</h1>
            <div
              v-for="block in introBlocks"
              :key="block.id"
              class="usa-prose hub-intro margin-bottom-0"
              v-html="resolveImages(block.item.block_content_html)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Audience routing: 3-up cards with a violet top border, each a title + a WYSIWYG
         list of links (constrained container). -->
    <div v-if="audienceCards.length" class="grid-container padding-y-4">
      <h2 v-if="audienceHeading" class="font-heading-lg margin-top-0">{{ audienceHeading }}</h2>
      <div class="grid-row grid-gap">
        <div
          v-for="card in audienceCards"
          :key="card.id"
          class="tablet:grid-col-4 margin-bottom-2"
        >
          <div class="aud-card padding-3">
            <h3 class="font-heading-md margin-top-0">{{ card.title }}</h3>
            <div
              v-if="card.body"
              class="aud-card__body"
              v-html="resolveImages(card.body)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Services list ("Everything in this section") + help box aside (constrained). -->
    <div v-if="services.length || help" class="grid-container padding-bottom-4">
      <div class="grid-row grid-gap">
        <div v-if="services.length" class="tablet:grid-col-8">
          <h2 v-if="servicesHeading" class="font-heading-lg margin-top-0">{{ servicesHeading }}</h2>
          <ul class="svc-list">
            <li v-for="svc in services" :key="svc.id">
              <a class="usa-link svc-name" :href="svc.url">{{ svc.title }}</a>
              <p v-if="svc.description" class="svc-desc">{{ svc.description }}</p>
            </li>
          </ul>
        </div>
        <div v-if="help" class="tablet:grid-col-4">
          <div class="help-box padding-3">
            <h2 class="margin-top-0 font-heading-sm">{{ help.title }}</h2>
            <div
              v-if="help.description"
              class="help-box__desc font-body-2xs margin-bottom-1"
              v-html="resolveImages(help.description)"
            />
            <a
              v-if="help.link_url"
              class="usa-button usa-button--outline"
              :href="help.link_url"
            >{{ help.link_label || help.title }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Data band: full-width tinted band with a chart + a "Learn how it works" list. -->
    <div v-if="chart || dataLinks.length" class="data-band padding-y-4">
      <div class="grid-container">
        <div class="grid-row grid-gap">
          <div v-if="chart" class="tablet:grid-col-8">
            <ChartCard :block="chart" />
          </div>
          <div v-if="dataLinks.length" class="tablet:grid-col-4">
            <h2 v-if="dataHeading" class="font-heading-sm margin-top-2 tablet:margin-top-0">{{ dataHeading }}</h2>
            <ul class="usa-list usa-list--unstyled">
              <li v-for="link in dataLinks" :key="link.id" class="margin-bottom-1">
                <a class="usa-link" :href="link.link_url">{{ link.link_label || link.title }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;
@use "uswds-fonts" as *;

.hub-header {
  background: #f9fafb;
  border-bottom: 1px solid #dfe1e2;
}

.hub-header :deep(.usa-breadcrumb) {
  background-color: transparent;
}

.hub-intro {
  max-width: 62ch;
  @include u-font('serif', 'lg');
}

.aud-card {
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-violet;
  border-radius: 0 0 4px 4px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aud-card__body {
  font-size: 0.94rem;

  :deep(ul) { margin: 0 0 1rem; padding-left: 1.1rem; }
  :deep(li) { margin-bottom: 0.5rem; }
  :deep(p) { margin: 0 0 0.5rem; }
}

.svc-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    padding: 0.85rem 0;
    border-bottom: 1px solid #dfe1e2;
  }
  li:last-child { border-bottom: 0; }
}

.svc-name { font-weight: 700; font-size: 1.02rem; }

.svc-desc {
  font-size: 0.92rem;
  color: #565c65;
  margin: 0.15rem 0 0;
  max-width: 62ch;
}

.help-box {
  border-left: 4px solid $onrr-violet;
  border-radius: 0 4px 4px 0;
  background: $onrr-violet-light;
}

.help-box__desc {
  :deep(p) { margin: 0 0 0.5rem; }
  :deep(p:last-child) { margin-bottom: 0; }
}

.data-band {
  background: #f9fafb;
  border-top: 1px solid #dfe1e2;
  border-bottom: 1px solid #dfe1e2;
}
</style>
