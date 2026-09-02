<script setup>
/*
  DatasetDownloads — the "Download" section for a dataset page, rendered by DatasetView.
  Three kinds of card:
    1. Full dataset (CSV)  — Directus native export of the source collection, so it's
       always current (no stored file). Record count is queried live.
    2. Curated files       — anything attached via dataset_metadata.files (M2M to
       directus_files), e.g. an Excel workbook with a data dictionary. Size + download
       URL come straight from the file record.
    3. Your filtered selection — exports whatever the active preview currently shows.
       The preview publishes a descriptor via provide/inject (`datasetPreviewExport`);
       this card just renders + triggers it, so it works for any *Preview component.

  `files` comes through the page GraphQL query (pageFields fragment); the section
  degrades to "no curated cards" until files are attached to the dataset record.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
  // Real Directus table for the dataset's source (DatasetView maps the label → table).
  sourceTable: { type: String, default: null },
})

const { apiUrl } = useRuntimeConfig().public

// Readable CSV headers per collection (nested field paths → dotted export columns).
// Collections without a spec export all fields (relational values come through as ids).
const EXPORT_FIELDS = {
  disbursement:
    'period.period_date,fund.type,location.land_category,fund.disbursement_type,location.state_name,location.county,commodity.name,amount',
}

// --- Card 1: full dataset via native export ----------------------------------
// Optional per-dataset export filter (JSON, e.g. {"period":{"type":{"_eq":"Monthly"}}})
// scopes the full-dataset count + CSV to what the dataset represents. Comes through the
// page GraphQL query; null when unset → no scoping.
const exportFilter = computed(() => props.dataset.export_filter || null)

const { data: countData } = await useAsyncData(
  `dataset-count-${props.dataset.id}`,
  () =>
    props.sourceTable
      ? $fetch(`${apiUrl}/items/${props.sourceTable}`, {
          query: {
            aggregate: JSON.stringify({ count: ['id'] }),
            ...(exportFilter.value ? { filter: JSON.stringify(exportFilter.value) } : {}),
          },
        }).catch(() => null)
      : Promise.resolve(null),
  { watch: [() => props.sourceTable, exportFilter] },
)
const recordCount = computed(() => Number(countData.value?.data?.[0]?.count?.id) || 0)

const csvHref = computed(() => {
  if (!props.sourceTable) return null
  const q = new URLSearchParams({ export: 'csv', limit: '-1' })
  const fields = EXPORT_FIELDS[props.sourceTable]
  if (fields) q.set('fields', fields)
  if (exportFilter.value) q.set('filter', JSON.stringify(exportFilter.value))
  return `${apiUrl}/items/${props.sourceTable}?${q.toString()}`
})

// --- Card 2: curated files (dataset_metadata.files M2M → directus_files) -------
// Delivered by the page GraphQL query (pageFields fragment) as dataset.files.
const curatedFiles = computed(() =>
  (props.dataset.files || [])
    .map((row) => row?.directus_files_id)
    .filter(Boolean)
    .map((f) => ({
      id: f.id,
      label: f.title || f.filename_download || 'Download',
      format: (f.filename_download?.split('.').pop() || '').toUpperCase(),
      size: humanSize(f.filesize),
      href: `${apiUrl}/assets/${f.id}?download`,
    })),
)

function humanSize(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return null
  const u = ['B', 'KB', 'MB', 'GB']
  let v = n
  let i = 0
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`
}

// --- Card 3: filtered selection, published by the active preview --------------
const previewExport = inject('datasetPreviewExport', ref(null))
</script>

<template>
  <div class="grid-row grid-gap margin-top-3">
    <!-- Full dataset (CSV) — native export, always current -->
    <div v-if="csvHref" class="tablet:grid-col-4 margin-bottom-2">
      <div class="download-card padding-2">
        <h3 class="margin-top-0 font-heading-sm">Full dataset (CSV)</h3>
        <p class="dl-size">{{ recordCount ? `All ${recordCount.toLocaleString()} records` : 'All records' }}</p>
        <a class="usa-button" :href="csvHref">Download CSV</a>
      </div>
    </div>

    <!-- Curated files (e.g. Excel with a data dictionary) -->
    <div v-for="f in curatedFiles" :key="f.id" class="tablet:grid-col-4 margin-bottom-2">
      <div class="download-card padding-2">
        <h3 class="margin-top-0 font-heading-sm">Full dataset ({{ f.format || 'file' }})</h3>
        <p class="dl-size">All records with data dictionary{{ f.size ? ` · ${f.size}` : '' }}</p>
        <a class="usa-button usa-button--outline" :href="f.href">Download {{ f.format || 'file' }}</a>
      </div>
    </div>

    <!-- Your filtered selection — reflects the preview's current filters -->
    <div v-if="previewExport" class="tablet:grid-col-4 margin-bottom-2">
      <div class="download-card padding-2">
        <h3 class="margin-top-0 font-heading-sm">Your filtered selection</h3>
        <p class="dl-size">{{ previewExport.note || 'Current selection' }}</p>
        <a
          v-if="previewExport.ready && previewExport.href"
          class="usa-button usa-button--outline"
          :href="previewExport.href"
        >Download filtered CSV</a>
        <button v-else type="button" class="usa-button usa-button--outline" disabled>Download filtered CSV</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;

  .usa-button { margin-top: auto; align-self: flex-start; }
}
.dl-size { font-size: 0.85rem; color: #565c65; }
</style>
