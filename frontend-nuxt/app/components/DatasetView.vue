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

// Glossary-term tooltips for any tagged spans in this view's content.
const { enhance: enhanceGlossary } = useGlossary()
const glossaryRoot = ref(null)
onMounted(() => enhanceGlossary(glossaryRoot.value))
watch(() => props.dataset, () => nextTick(() => enhanceGlossary(glossaryRoot.value)))

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

// `source_collection` holds the real Directus collection name, so it drives both the
// preview component (init-capped + "Preview", e.g. disbursement -> DisbursementPreview)
// and DatasetDownloads' live count + native CSV export directly — no mapping needed.
// Register each preview here as it's built.
const initCap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const sourceCollection = computed(() => props.dataset.source_collection || null)
const PREVIEW_COMPONENTS = {
  DisbursementPreview,
  // RevenuePreview, ProductionPreview — add when built
}
const previewComponent = computed(() => PREVIEW_COMPONENTS[`${initCap(sourceCollection.value)}Preview`] || null)

// The active preview publishes a "filtered selection" export descriptor here; the
// Download section's third card consumes it (works for any *Preview component).
const previewExport = ref(null)
provide('datasetPreviewExport', previewExport)

// Public data API (data.onrr.gov), consistent with the /developers reference. Only the
// flat-backed datasets are exposed; source_collection maps to the friendly endpoint name.
// The section stays hidden for datasets without a public endpoint.
const dataApiBase = useRuntimeConfig().public.dataApiBase
const API_ENDPOINTS = { disbursement: 'disbursements', revenue: 'revenue', production: 'production' }
const apiEndpoint = computed(() => API_ENDPOINTS[sourceCollection.value] || null)
const hasApi = computed(() => !!apiEndpoint.value)
const apiUrl = computed(() => (apiEndpoint.value ? `${dataApiBase}/${apiEndpoint.value}` : null))
const apiCopied = ref(false)
async function copyApiUrl() {
  try {
    await navigator.clipboard.writeText(apiUrl.value)
    apiCopied.value = true
    setTimeout(() => { apiCopied.value = false }, 1500)
  } catch (e) {
    /* clipboard unavailable — the URL stays visible for manual copy */
  }
}
</script>

<template>
  <div class="dataset" ref="glossaryRoot">
    <div class="grid-row grid-gap margin-bottom-4">
      <div v-if="dataset.description" class="tablet:grid-col-8">
        <!-- Reading-measure cap lives on the text, not the grid column, so the
             column keeps its full 8-col width and the meta panel fills its 4. -->
        <h1 class="margin-bottom-1">{{ dataset.name }}</h1>
        <div class="usa-intro measure-5" v-html="resolveImages(dataset.description)" />
        <div class="margin-top-2">
          <a class="usa-button" href="#preview">Preview &amp; filter data</a>
          <a class="usa-button usa-button--outline" href="#download">Download files</a>
          <a v-if="hasApi" class="usa-button usa-button--outline" href="#api">API access</a>
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

    <div class="grid-row grid-gap margin-bottom-2" id="download">
      <div class="grid-col-12">
        <h2 class="font-heading-lg">Download</h2>
        <DatasetDownloads :dataset="dataset" :source-table="sourceCollection" />
      </div>
    </div>

    <div v-if="hasApi" class="grid-row grid-gap margin-bottom-2" id="api">
      <h2 class="font-heading-lg">API access</h2>
      <div class="grid-col-12  border-bottom-05 padding-bottom-4 border-onrr-blue">
        <div>
          <p>
            This dataset is available through ONRR's open, read-only data API — no account or
            API key required. Query it with the standard filters, sorting, and pagination, or
            download a filtered slice as CSV.
          </p>
        </div>
        <p class="api-endpoint-label">Endpoint</p>
        <div class="api-block">
          <code>GET {{ apiUrl }}</code>
          <button type="button" class="api-copy" @click="copyApiUrl">
            {{ apiCopied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <p class="margin-top-2 line-height-sans-3">
          See the
          <NuxtLink class="usa-link" to="/developers">Data API documentation</NuxtLink>
          for the full column reference, query parameters, runnable examples, and bulk downloads.
        </p>
      </div>
    </div>

    <div class="grid-row grid-gap" id="scope">
      <h2 class="font-heading-lg">Scope</h2>
      <div class="grid-col-12">
        <div class="line-height-sans-5"
          v-html="resolveImages(dataset.scope)">
        </div>
      </div>
    </div>

    <div class="grid-row grid-gap" id="publication">
      <h2 class="font-heading-lg">Data publication</h2>
      <div class="grid-col-12">
        <div class="line-height-sans-5"
          v-html="resolveImages(dataset.publication)">
        </div>
      </div>
    </div>

    <DatasetDictionary :dataset="dataset" />

    <ContactBox v-if="dataset.contact_box" :block="dataset.contact_box" class="margin-bottom-4" />

    <div v-if="terms.length" class="grid-row grid-gap margin-bottom-4">
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

// API access: dark endpoint block (matches the mockup's .api-block and the /developers
// code style) with an inline copy control.
.api-endpoint-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #565c65;
  margin: 1rem 0 0.4rem;
}

.api-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #1b1b1b;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  overflow-x: auto;

  code {
    font-family: "Roboto Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.9rem;
    color: #eef2f7;
    white-space: pre;
  }
}

.api-copy {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #9ec7ff;
  background: transparent;
  border: 1px solid #4a5568;
  border-radius: 3px;
  padding: 0.2rem 0.55rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
