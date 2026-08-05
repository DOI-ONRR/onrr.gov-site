<script setup>
/*
  DatasetView — renders a dataset page from a `dataset_metadata` record.
  Chosen (in [...slug].vue) when a page has an associated `dataset_metadata`;
  shows the dataset header (description, coverage, formats, links) followed by
  its ordered `chart_cards` (reusing the standard <ChartCard> renderer) and an
  "About this data" section. Breadcrumb/H1/layout chrome stay in [...slug].vue.
*/
import DisbursementPreview from '~/components/previews/DisbursementPreview.vue'

const props = defineProps({
  dataset: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()

const charts = computed(() => props.dataset.charts ?? [])

// `formats` is a select-multiple-dropdown -> array of strings (["CSV","XLSX",...]).
const formats = computed(() => {
  const f = props.dataset.formats
  return Array.isArray(f) ? f : (f ? [f] : [])
})

// `related_links` is a list interface -> array of { Text, URL }.
const relatedLinks = computed(() => {
  const l = props.dataset.related_links
  if (!Array.isArray(l)) return []
  return l
    .map((row) => ({ text: row?.Text ?? row?.text, url: row?.URL ?? row?.url }))
    .filter((row) => row.url)
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Date-only field (YYYY-MM-DD); parse as UTC so the month/year don't drift by tz.
function monthYear(d) {
  if (!d) return null
  const dt = new Date(`${d}T00:00:00Z`)
  if (Number.isNaN(dt.getTime())) return null
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

const coverage = computed(() => {
  const start = monthYear(props.dataset.coverage_start)
  const end = monthYear(props.dataset.coverage_end)
  if (start && end) return `${start} – ${end}`
  return start || end || null
})

// `terms` is a M2M -> junction rows each wrapping a glossary_terms record.
const terms = computed(() => {
  const rows = props.dataset.terms
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => row?.glossary_terms_id)
    .filter((t) => t && t.term)
})

// "Preview and filter" is a static component per dataset, chosen by
// dataset_metadata.preview_component. Register new datasets here as their preview
// components are built; unset → the section is hidden.
const PREVIEW_COMPONENTS = {
  disbursements: DisbursementPreview,
}
const previewComponent = computed(() => PREVIEW_COMPONENTS[props.dataset.preview_component] || null)
</script>

<template>
  <div class="dataset">
    <div class="grid-row grid-gap margin-bottom-4">
      <div v-if="dataset.description" class="tablet:grid-col-8">
        <!-- Reading-measure cap lives on the text, not the grid column, so the
             column keeps its full 8-col width and the meta panel fills its 4. -->
        <h1 class="margin-bottom-1">{{ dataset.name }}</h1>
        <div class="usa-intro measure-5" v-html="resolveImages(dataset.description)" />
        <div class="margin-top-2">
          <a class="usa-button" href="#preview">Preview &amp; filter data</a>
          <a class="usa-button usa-button--outline" href="#download">Download files</a>
          <a class="usa-button usa-button--outline" href="#api">API access</a>
        </div>
      </div>

      <!-- The panel styling lives on an inner wrapper, not the grid column: a
           bordered/filled box on a .grid-gap column paints into the gutter and
           bleeds past the container edge. The inner box stays in the content area. -->
      <div class="tablet:grid-col-4">
        <div class="dataset-meta">
          <dl class="usa-list usa-list--unstyled">
            <template v-if="dataset.update_frequency">
              <dt>Update frequency</dt>
              <dd>{{ dataset.update_frequency }}</dd>
            </template>
            <template v-if="coverage">
              <dt>Coverage</dt>
              <dd>{{ coverage }}</dd>
            </template>
            <template v-if="formats.length">
              <dt>Formats</dt>
              <dd>{{ formats.join(' · ') }}</dd>
            </template>
            <template v-if="dataset.publisher">
              <dt>Publisher</dt>
              <dd>{{ dataset.publisher }}</dd>
            </template>
            <template v-if="relatedLinks.length">
              <dt>Related</dt>
              <dd>
                <a
                  v-for="(link, i) in relatedLinks"
                  :key="i"
                  :href="link.url"
                  class="usa-link margin-bottom-1"
                >{{ link.text || link.url }}</a>
              </dd>
            </template>
          </dl>
        </div>
      </div>
    </div>
    
    <div class="grid-row grid-gap margin-bottom-4" id="chart">
      <div class="grid-col-12">
        <ChartCard :block="dataset.charts[0]" />
      </div>
    </div>

    <div v-if="previewComponent" class="grid-row grid-gap" id="preview">
      <div class="grid-col-12">
        <h2 class="font-heading-lg">Preview and filter</h2>
        <component :is="previewComponent" :dataset="dataset" />
      </div>
    </div>

    <div class="grid-row grid-gap" id="download">
      <h2 class="font-heading-lg">Download</h2>
      <div class="grid-col-12"></div>
    </div>

    <div class="grid-row grid-gap" id="api">
      <h2 class="font-heading-lg">API access</h2>
      <div class="grid-col-12"></div>
    </div>

    <div class="grid-row grid-gap" id="about">
      <h2 class="font-heading-lg">About this dataset</h2>
      <div class="grid-col-12">
        <div class="usa-prose measure-5"
          v-html="resolveImages(dataset.about)">
        </div>
      </div>
    </div>

    <div v-if="terms.length" class="grid-row grid-gap margin-bottom-2">
      <div>Key terms:
        <template v-for="(t, i) in terms" :key="t.id"><a class="usa-link ":href="`/glossary-terms#${t.term}`">{{ t.term }}</a><span v-if="i < terms.length - 1"> · </span></template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.dataset-meta {
  @include u-padding(2);
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #f9fafb;

  dt { 
    font-weight: 700; 
    font-size: 0.82rem; 
    text-transform: uppercase; 
    letter-spacing: 0.03em; 
    color: #565c65; 
    margin: 0; 
  }

  dd { 
    margin: 0 0 0.75rem; 
    font-size: 0.95rem; 
  }

  dd:last-child { 
    margin-bottom: 0; 
  }

}

.dataset-terms dt {
  font-weight: 700;
  margin-top: 0.75rem;
}

.dataset-terms dd {
  margin-left: 0;
  color: #565c65;
}
</style>
