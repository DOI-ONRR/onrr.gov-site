<script setup>
/*
  Page bands renderer — the reusable body of the `page_bands` system (prose / chart /
  steps / cards). Used full-bleed on the homepage (index.vue) and constrained inside the
  standard page container on full-width template pages (e.g. Payment options).

  `bleed` (default true): each band is a full-width <section> whose inner .grid-container
  re-constrains content — so colored band backgrounds span the viewport. Set `:bleed="false"`
  to render each band as a plain block that flows in the parent container (no nested
  .grid-container, no double padding), for pages that already sit inside a container.
*/
defineProps({
  bands: { type: Array, default: () => [] },
  bleed: { type: Boolean, default: true },
})

const { resolveImages } = useCmsContent()

// Body/aside split. `body_columns` (8/9/12) drives the body span; the aside takes the
// remainder and is dropped entirely at 12 (full-width body).
const bandBodyCols = (band) => band.body_columns || 12
const bandAsideCols = (band) => 12 - bandBodyCols(band)
</script>

<template>
  <component
    :is="bleed ? 'section' : 'div'"
    v-for="(band, i) in bands"
    :key="band.id || i"
    class="page-band"
    :class="[
      `page-band--${band.background || 'default'}`,
      { 'page-band--hub': band.card_variant === 'link' },
      bleed ? 'padding-y-4' : 'padding-bottom-4',
    ]"
  >
    <div :class="{ 'grid-container': bleed }">
      <!-- font-heading-lg is size-only and `!important`, so it can't be overridden by
           the .page-band--hub rule — omit it on hub headings and size them there. -->
      <h2
        v-if="band.heading"
        class="margin-top-0"
        :class="{ 'font-heading-lg': band.card_variant !== 'link' }"
      >{{ band.heading }}</h2>

      <!-- Steps band: a full-width 3-up numbered grid (number from sort order). -->
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

      <!-- Cards band: an auto-fit grid of cards. `card_variant: 'link'` renders each card
           as a linked title (navy top border, no button); otherwise title + body + CTA. -->
      <template v-else-if="band.cards?.length">
        <!-- Optional group hint (band.body) between the heading and the cards. -->
        <div v-if="band.body" class="page-band__hint" v-html="resolveImages(band.body)" />
        <div class="page-band__cards margin-top-3">
          <div
            v-for="(card, ci) in band.cards"
            :key="card.id || ci"
            class="page-band__card padding-3"
            :class="{ 'page-band__card--link': band.card_variant === 'link' }"
          >
            <template v-if="band.card_variant === 'link'">
              <h3 class="font-heading-md margin-top-0">
                <a v-if="card.cta_url" class="usa-link" :href="card.cta_url">{{ card.title }}</a>
                <template v-else>{{ card.title }}</template>
              </h3>
              <div v-if="card.body" class="page-band__card-body" v-html="resolveImages(card.body)" />
            </template>
            <template v-else>
              <h3 class="font-heading-md margin-top-0">{{ card.title }}</h3>
              <div v-if="card.body" class="page-band__card-body" v-html="resolveImages(card.body)" />
              <a
                v-if="card.cta_url"
                class="usa-button usa-button--outline page-band__card-cta"
                :href="card.cta_url"
              >{{ card.cta_label || card.title }}</a>
            </template>
          </div>
        </div>
      </template>

      <!-- Content band: an embedded chart_card, else the WYSIWYG body, in a body/aside split. -->
      <div v-else class="grid-row grid-gap">
        <div :class="`tablet:grid-col-${bandBodyCols(band)}`">
          <ChartCard v-if="band.chart" :block="band.chart" />
          <!-- measure-5 (reading-width cap) only when full-bleed; constrained pages
               already bound the width via their own container/columns. -->
          <div
            v-else-if="band.body"
            class="page-band__body"
            :class="{ 'measure-5': bleed }"
            v-html="resolveImages(band.body)"
          />
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
  </component>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.page-band__body :deep(p) { margin: 0 0 0.5rem; }
.page-band__body :deep(p:last-child) { margin-bottom: 0; }
.page-band__aside :deep(ul) { margin: 0; }
.page-band__aside :deep(li) { margin-bottom: 0.25rem; }
.page-band__cta { display: inline-block; margin-top: 0.5rem; }

// Group hint: a short lead-in under a cards-band heading.
.page-band__hint {
  color: #565c65;
  font-size: 0.95rem;
  max-width: 60ch;

  :deep(p) { margin: 0.25rem 0 0; }
  :deep(p:first-child) { margin-top: 0; }
}

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

// Cards band: auto-fill grid — cards size to a min width and wrap. auto-FILL (not
// auto-fit) keeps empty column tracks, so a band with a single card leaves it at one
// column's width instead of stretching it across the whole row.
.page-band__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.page-band__card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

// Link-title variant: a navy top border and a linked heading, no button (a hub of links).
.page-band__card--link {
  border-top: 4px solid $onrr-navy;
  border-radius: 0 0 4px 4px;

  h3 { font-size: 1.1rem; line-height: 1.25; margin-bottom: 0.4rem; }
  h3 a { color: $onrr-blue; }
}

// Hub treatment for link-variant cards bands (payment-options .method-group look):
// a compact heading + tighter grid + muted card body. Scoped to --hub so homepage
// button-card bands keep their large section headings.
.page-band--hub {
  h2 { font-size: 1.1rem; font-weight: 700; color: #1b1b1b; margin: 0 0 0.25rem; }

  .page-band__hint { margin-bottom: 1rem; }

  .page-band__cards {
    margin-top: 0;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  }

  .page-band__card { padding: 1.1rem 1.2rem 1rem; }
  .page-band__card-body { color: #3d4551; font-size: 0.93rem; }
}

// `body` is WYSIWYG (a list of links, or a short description).
.page-band__card-body {
  font-size: 0.95rem;

  :deep(ul) { margin: 0 0 1rem; padding-left: 1.1rem; }
  :deep(li) { margin-bottom: 0.4rem; }
  :deep(p) { margin: 0; }
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
