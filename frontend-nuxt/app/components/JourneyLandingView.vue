<script setup>
/*
  JourneyLandingView — renders a "journey-landing" page (pages.template ===
  'journey-landing'), modeled on the Getting Started / Reporting / Paying mockups:
  a hero (eyebrow + title + intro) followed by the journey content. Chosen in
  [...slug].vue by the page's template field; the standard sidenav is dropped there.

  Intro / surrounding prose comes from the page's page_blocks; the journey "steps"
  come from a dedicated ordered O2M, `page.journey_steps` (each step: label, url, body,
  meta), rendered as a USWDS usa-process-list.
*/
const props = defineProps({
  page: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()

const blocks = computed(() => props.page?.page_blocks ?? [])
// Eyebrow = parent section name (e.g. the hub this journey belongs to); optional.
const eyebrow = computed(() => props.page?.parent?.title || null)
// Ordered journey steps (O2M on the page); empty until the collection/relation and
// the pageFields `journey_steps` selection exist.
const steps = computed(() => props.page?.journey_steps ?? [])

// Card links (dedicated O2M `journey_links`), split by `section`:
//   'path'      — the primary parallel-path cards (reporting/paying main content)
//   'related'   — the closing "next steps / related" band above the footer
//   'callout'   — the aside help/deadline box (single; heading + body + CTA)
//   'reference' — the aside "Key references" list items
// Empty until the collection/relation + pageFields `journey_links` selection exist.
const links = computed(() => props.page?.journey_links ?? [])
const pathCards = computed(() => links.value.filter((l) => l.section === 'path'))
const relatedCards = computed(() => links.value.filter((l) => l.section === 'related'))
const callout = computed(() => links.value.find((l) => l.section === 'callout') || null)
const references = computed(() => links.value.filter((l) => l.section === 'reference'))
const pathsHeading = computed(() => props.page?.journey_paths_heading || null)
const relatedHeading = computed(() => props.page?.journey_related_heading || null)
const referencesHeading = computed(() => props.page?.journey_references_heading || null)
</script>

<template>
  <div class="journey-landing">
    <div class="grid-row grid-gap">
      <!-- Journey content (hero + steps / body) -->
      <div class="tablet:grid-col-8">
        <h1 class="margin-top-05 margin-bottom-2">{{ page?.hero_title || page?.title }}</h1>
        <div class="journey-content">
          <div
            v-for="block in blocks"
            :key="block.id"
            class="margin-bottom-3"
          >
            <div
              v-if="block.item?.__typename === 'content_blocks'"
              class="usa-prose"
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

          <!-- The journey: an ordered list of steps rendered as a USWDS process list. -->
          <ol v-if="steps.length" class="usa-process-list">
            <li v-for="step in steps" :key="step.id" class="usa-process-list__item">
              <h2 class="usa-process-list__heading">
                <a v-if="step.url" :href="step.url" class="usa-link step-link">{{ step.label }}</a>
                <template v-else>{{ step.label }}</template>
              </h2>
              <p v-if="step.body" class="step-body margin-top-05">{{ step.body }}</p>
              <p v-if="step.meta" class="step-meta">{{ step.meta }}</p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Aside (right column): a help/deadline callout box + a "Key references" list. -->
      <aside v-if="callout || references.length" class="tablet:grid-col-4 journey-aside">
        <div v-if="callout" class="journey-callout padding-3 margin-bottom-3">
          <h2 class="margin-top-0 font-heading-sm">{{ callout.title }}</h2>
          <p v-if="callout.description" class="font-body-2xs margin-bottom-1">{{ callout.description }}</p>
          <a
            v-if="callout.link_url"
            class="usa-button usa-button--outline"
            :href="callout.link_url"
          >{{ callout.link_label || callout.title }}</a>
        </div>

        <div v-if="references.length">
          <h2 v-if="referencesHeading" class="font-heading-sm margin-bottom-1">{{ referencesHeading }}</h2>
          <ul class="journey-refs">
            <li v-for="ref in references" :key="ref.id">
              <a v-if="ref.link_url" class="usa-link" :href="ref.link_url">{{ ref.title }}</a><template v-else>{{ ref.title }}</template><span v-if="ref.description"> — {{ ref.description }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- Primary "path" cards (reporting/paying main content): a heading + a card row. -->
    <section v-if="pathCards.length" class="journey-paths margin-top-4">
      <h2 v-if="pathsHeading" class="font-heading-lg margin-bottom-2">{{ pathsHeading }}</h2>
      <div class="grid-row grid-gap">
        <div
          v-for="card in pathCards"
          :key="card.id"
          class="tablet:grid-col-4 margin-bottom-2"
        >
          <div class="jl-card padding-3">
            <h3 class="font-heading-md margin-top-0">{{ card.title }}</h3>
            <p v-if="card.description" class="jl-card__desc">{{ card.description }}</p>
            <a
              v-if="card.link_url"
              class="usa-button usa-button--outline jl-card__cta"
              :href="card.link_url"
            >{{ card.link_label || card.title }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing "next steps / related" band above the footer. The band background is
         full-bleed (breaks out of the page container to viewport width); the inner
         .grid-container re-aligns the cards with the rest of the page content. -->
    <section v-if="relatedCards.length" class="journey-related-band margin-top-4">
      <div class="grid-container padding-y-4">
        <h2 v-if="relatedHeading" class="font-heading-lg margin-top-0 margin-bottom-2">
          {{ relatedHeading }}
        </h2>
        <div class="grid-row grid-gap">
          <div
            v-for="card in relatedCards"
            :key="card.id"
            class="tablet:grid-col-4 margin-bottom-2"
          >
            <div class="jl-card padding-3">
              <h3 class="font-heading-md margin-top-0">{{ card.title }}</h3>
              <p v-if="card.description" class="jl-card__desc">{{ card.description }}</p>
              <a
                v-if="card.link_url"
                class="usa-button usa-button--outline jl-card__cta"
                :href="card.link_url"
              >{{ card.link_label || card.title }}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.journey-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.82rem;
  font-weight: 700;
  color: #565c65;
}

// Step styling from the mockup — applies when the journey steps render as a
// usa-process-list (whether from page_blocks or a dedicated steps model).
.journey-content :deep(.usa-process-list__heading .step-link),
.journey-content :deep(.step-link) {
  font-size: 1.1rem;
  font-weight: 700;
}

.journey-content :deep(.step-body) {
  max-width: 60ch;
}

.journey-content :deep(.step-meta) {
  font-size: 0.85rem;
  color: #565c65;
}

// Path / related cards — bordered card with a CTA pinned to the bottom.
.jl-card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.jl-card__desc {
  font-size: 0.95rem;
  color: #1b1b1b;
}

.jl-card__cta {
  margin-top: auto;
}

// Aside (right column): a tinted callout box + a compact references list.
.journey-callout {
  border: 1px solid #dfe1e2;
  border-left: 4px solid $onrr-navy;
  border-radius: 0 4px 4px 0;
  background: #f9fafb;
}

.journey-refs {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.95rem;

  li {
    margin-bottom: 0.5rem;
    line-height: 1.35;
    color: #565c65;
  }
}

// Closing band: a tinted, ruled section that sets the "next / related" cards apart.
// Full-bleed — break out of the constrained page container to viewport width. The
// inner .grid-container re-constrains the content. Needs `overflow-x: clip` on an
// ancestor (.onrr-app) so the 100vw width can't introduce a horizontal scrollbar.
.journey-related-band {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background: #f9fafb;
  border-top: 1px solid #dfe1e2;
}

.journey-content :deep(.step-meta) {
  font-size: 0.85rem;
  color: #565c65;
}
</style>
