<script setup>

import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'

const { assetUrl, resolveImages } = useCmsContent()

const { data } = await useAsyncQuery(getPageBySlug, { slug: null })
const page = computed(() => data.value?.page?.[0])

const heroTitle = computed(
  () => page.value?.hero_title || '',
)

const heroDescription = computed(
  () => page.value?.hero_description,
)

// Hero CTAs from the `hero_cta` repeater ({ label, url }). The first renders as the
// primary big button; every one after it gets the outline/inverse treatment.
const heroCtas = computed(() => page.value?.hero_cta ?? [])

const pageBands = computed(() =>
  (page.value?.page_bands?.length ? page.value.page_bands : []),
)

// Body/aside split. `body_columns` (8/9/12) drives the body span; the aside takes the
// remainder and is dropped entirely at 12 (full-width body).
const bandBodyCols = (band) => band.body_columns || 12
const bandAsideCols = (band) => 12 - bandBodyCols(band)

</script>

<template>
  <div class="homepage">
    <section
      class="hero padding-y-6"
      :class="{ 'hero--has-image': page?.hero_image?.id }"
      :style="page?.hero_image?.id ? { '--hero-image': `url(${assetUrl(page.hero_image.id)})` } : null"
      aria-label="Introduction"
    >
      <div class="grid-container">
        <h1 class="font-heading-2xl margin-0">{{ heroTitle }}</h1>
        <p class="margin-top-2 measure-5">{{ heroDescription }}</p>
        <p v-if="heroCtas.length" class="margin-top-3 margin-bottom-0 hero-actions">
          <a
            v-for="(cta, i) in heroCtas"
            :key="i"
            class="usa-button usa-button--big"
            :class="{ 'usa-button--outline usa-button--inverse': i > 0 }"
            :href="cta.url"
          >{{ cta.label }}</a>
        </p>
      </div>
    </section>

    <section
      v-for="(band, i) in pageBands"
      :key="band.id || i"
      class="page-band padding-y-4"
      :class="`page-band--${band.background || 'default'}`"
    >
      <div class="grid-container">
        <h2 v-if="band.heading" class="font-heading-lg margin-top-0">{{ band.heading }}</h2>

        <!-- Steps band: a full-width 3-up numbered grid (the number comes from sort
             order). Renders when the band has `steps`; the CTA is a plain link below. -->
        <template v-if="band.steps?.length">
          <div class="grid-row grid-gap-4 margin-top-3">
            <div
              v-for="(step, si) in band.steps"
              :key="step.id || si"
              class="tablet:grid-col-4 margin-bottom-2"
            >
              <div class="page-band__step">
                <div class="page-band__step-num" aria-hidden="true">{{ si + 1 }}</div>
                <div>
                  <h3 class="margin-top-0">{{ step.title }}</h3>
                  <div v-if="step.body" class="page-band__step-body" v-html="resolveImages(step.body)" />
                </div>
              </div>
            </div>
          </div>
          <a v-if="band.cta_url" class="usa-link" :href="band.cta_url">{{ band.cta_label || band.heading }}</a>
        </template>

        <!-- Cards band: an auto-fit grid of cards (title + WYSIWYG body + CTA). The grid
             sizes cards to a min width and wraps, so any card count lays out cleanly. -->
        <div v-else-if="band.cards?.length" class="page-band__cards margin-top-3">
          <div v-for="(card, ci) in band.cards" :key="card.id || ci" class="page-band__card padding-3">
            <h3 class="font-heading-md margin-top-0">{{ card.title }}</h3>
            <div v-if="card.body" class="page-band__card-body" v-html="resolveImages(card.body)" />
            <a
              v-if="card.cta_url"
              class="usa-button usa-button--outline page-band__card-cta"
              :href="card.cta_url"
            >{{ card.cta_label || card.title }}</a>
          </div>
        </div>

        <!-- Content band: an embedded chart_card, else the WYSIWYG body, in a body/aside
             split; the CTA is an outline button in the body column. -->
        <div v-else class="grid-row grid-gap">
          <div :class="`tablet:grid-col-${bandBodyCols(band)}`">
            <ChartCard v-if="band.chart" :block="band.chart" />
            <div v-else-if="band.body" class="page-band__body measure-5" v-html="resolveImages(band.body)" />
            <a
              v-if="band.cta_url"
              class="usa-button usa-button--outline page-band__cta"
              :class="{ 'usa-button--inverse': band.background === 'navy' }"
              :href="band.cta_url"
            >{{ band.cta_label || band.heading }}</a>
          </div>
          <div
            v-if="bandAsideCols(band) > 0 && band.aside"
            :class="`tablet:grid-col-${bandAsideCols(band)}`"
          >
            <div class="page-band__aside" v-html="resolveImages(band.aside)" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

// Full-width bands: index.vue renders at the top level of #main-content, so each
// <section> fills the viewport width; the inner .grid-container re-constrains content.

// Hero — deep navy band with white text. When the CMS provides a hero image, its URL
// is injected inline as the `--hero-image` custom property; the directional gradient
// overlay (opaque navy on the text side, fading to reveal the photo on the right) and
// the responsive focal point live here in SCSS.
.hero {
  background-color: #1a4480;
  color: #fff;

  h1 {
    max-width: 24ch;
    text-wrap: balance;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
  p {
    max-width: 62ch;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
}

// With an image: layer the 90deg gradient over the photo. On the left (behind
// the text) it's near-opaque navy; by the right edge it's ~transparent so the photo
// shows through. `--hero-image` is set inline (dynamic CMS URL).
.hero--has-image {
  background-image:
    linear-gradient(
      90deg,
      rgba(17, 46, 88, 0.96) 0%,
      rgba(17, 46, 88, 0.86) 36%,
      rgba(17, 46, 88, 0.30) 66%,
      rgba(17, 46, 88, 0.02) 100%
    ),
    var(--hero-image);
  background-size: cover;
  background-position: center 42%;
  background-repeat: no-repeat;

  // Narrow screens: a horizontal fade leaves the text unreadable, so switch to a flat
  // overlay and shift the focal point down.
  @media (max-width: 39.99em) {
    background-image:
      linear-gradient(rgba(17, 46, 88, 0.92), rgba(17, 46, 88, 0.92)),
      var(--hero-image);
    background-position: center 58%;
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

// Content bands (page_bands) + band background tokens.
.page-band__body :deep(p) { margin: 0 0 0.5rem; }
.page-band__body :deep(p:last-child) { margin-bottom: 0; }
.page-band__aside :deep(ul) { margin: 0; }
.page-band__aside :deep(li) { margin-bottom: 0.25rem; }
.page-band__cta { display: inline-block; margin-top: 0.5rem; }

// Numbered step (steps band): a filled circle beside the title + body.
.page-band__step {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;

  h3 { margin: 0; font-size: 1.05rem; }
}

// `body` is WYSIWYG — style its paragraphs/lists via :deep (v-html content).
.page-band__step-body {
  font-size: 0.92rem;
  color: #565c65;

  :deep(p) { margin: 0.2rem 0 0; }
  :deep(p:first-child) { margin-top: 0; }
  :deep(ul) { margin: 0.25rem 0 0; padding-left: 1.1rem; }
}

.page-band__step-num {
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: $onrr-blue;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Cards band: auto-fit grid — cards size to a min width and wrap, so 3/4/5/6 cards all
// lay out cleanly without a fixed column count.
.page-band__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.page-band__card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

// `body` is WYSIWYG (a list of links).
.page-band__card-body {
  font-size: 0.95rem;

  :deep(ul) { margin: 0 0 1rem; padding-left: 1.1rem; }
  :deep(li) { margin-bottom: 0.4rem; }
}

// Pin the CTA to the bottom so uneven card content still aligns.
.page-band__card-cta { margin-top: auto; align-self: flex-start; }

.page-band--subtle {
  background: #f9fafb;
  border-top: 1px solid #dfe1e2;
  border-bottom: 1px solid #dfe1e2;
}
.page-band--muted { background: #f0f0f0; }
.page-band--navy {
  background: $onrr-navy;
  color: #fff;

  :deep(a:not(.usa-button)) { color: #fff; }
}
</style>
