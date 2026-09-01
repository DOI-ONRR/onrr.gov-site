<script setup>
/*
  Data table — a page_blocks block that renders a reference table straight from a
  source collection (NYMEX, index_zones, ibmp, …). "Collection as data source" like
  ChartCard, but a plain read (fields / sort / filter / limit), not an aggregation.
  Column config, formats, and the optional footnote come from the `data_tables` row.
*/
const props = defineProps({
  block: { type: Object, required: true },
})

const { apiUrl } = useRuntimeConfig().public
const { resolveImages } = useCmsContent()

const cols = computed(() =>
  (Array.isArray(props.block.columns) ? props.block.columns : []).filter((c) => c && c.field),
)

// Some source collections store the table as a JSON array embedded in one field — a
// dated snapshot (e.g. index_zones.index_zones, ibmp.ibmp_line_items). `source_field`
// names that array; when set, the table rows come from it (columns read the nested
// keys) instead of from the collection rows.
const sourceField = computed(() => props.block.source_field || null)

const { data: rawData } = await useAsyncData(`data-table-${props.block.id}`, async () => {
  if (!props.block.source_collection) return []
  // Embedded source: fetch the array field (+ sort field). Flat source: the columns.
  const fetchFields = sourceField.value
    ? [sourceField.value, props.block.sort_field].filter(Boolean)
    : cols.value.map((c) => c.field)
  if (!fetchFields.length) return []
  // fields/sort are comma-separated; filter is a JSON string (Directus REST parses it).
  const query = { fields: fetchFields.join(','), limit: props.block.row_limit || -1 }
  if (props.block.sort_field) {
    query.sort = (props.block.sort_direction === 'desc' ? '-' : '') + props.block.sort_field
  }
  // `table_filter` is the aliased `filter` from the fragment (avoids a type clash with
  // chart_cards.filter). A JSON string Directus REST parses.
  if (props.block.table_filter) query.filter = props.block.table_filter
  const res = await $fetch(`${apiUrl}/items/${props.block.source_collection}`, { query })
  return res?.data ?? []
})

// Flat source → the collection rows are the table rows. Embedded source → explode the
// array field across the fetched snapshot rows (typically limit 1 = the latest snapshot).
const rows = computed(() =>
  sourceField.value
    ? (rawData.value ?? []).flatMap((r) => (Array.isArray(r?.[sourceField.value]) ? r[sourceField.value] : []))
    : (rawData.value ?? []),
)

// "As of" line for snapshot tables: a label prefix (as_of_label, e.g. "Prices for" /
// "Production month") + the snapshot's date — the first fetched row's sort field,
// formatted as "March 2026". Rendered only when as_of_label is set.
const asOfText = computed(() => {
  const date = rawData.value?.[0]?.[props.block.sort_field]
  return props.block.as_of_label && date ? `${props.block.as_of_label} ${formatCell(date, 'month_year')}` : null
})

function fmtDate(value, opts) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  // UTC so a date-only value isn't shifted a day by the local offset.
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
}

function formatCell(value, format) {
  if (value == null || value === '') return ''
  const n = Number(value)
  switch (format) {
    // 2-decimal currency for prices ($/bbl etc.)
    case 'currency': return Number.isFinite(n)
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : String(value)
    case 'currency_compact': return Number.isFinite(n) ? '$' + n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 }) : String(value)
    case 'number': return Number.isFinite(n) ? n.toLocaleString('en-US') : String(value)
    case 'percent': return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%' : String(value)
    case 'month_year': return fmtDate(value, { month: 'long', year: 'numeric' })
    case 'date': return fmtDate(value, { year: 'numeric', month: 'short', day: 'numeric' })
    default: return String(value)
  }
}

const isNum = (c) => c.align === 'right'
</script>

<template>
  <div class="data-table">
    <p v-if="asOfText" class="as-of">{{ asOfText }}</p>
    <div class="data-table__wrap">
      <table
        class="usa-table width-full"
        :class="{ 'usa-table--compact': block.compact }"
      >
        <caption v-if="block.caption" :class="{ 'usa-sr-only': !block.show_caption }">{{ block.caption }}</caption>
        <thead>
          <tr>
            <th v-for="(c, ci) in cols" :key="ci" scope="col" :class="{ num: isNum(c) }">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in rows" :key="ri">
            <template v-for="(c, ci) in cols" :key="ci">
              <th v-if="ci === 0" scope="row" :class="{ num: isNum(c) }">{{ formatCell(row[c.field], c.format) }}</th>
              <td v-else :class="{ num: isNum(c) }">{{ formatCell(row[c.field], c.format) }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- footnote / download line (mockup .dl-line) — WYSIWYG, so a <div> not a <p> -->
    <div v-if="block.footnote" class="data-table__footnote" v-html="resolveImages(block.footnote)" />
  </div>
</template>

<style lang="scss" scoped>
// "As of" / snapshot-date line above the table (mockup .as-of).
.as-of {
  font-size: 0.85rem;
  color: #565c65;
}

// Scrollable bordered wrapper (mockup .price-table-wrap).
.data-table__wrap {
  overflow-x: auto; // keeps wide tables scrollable; no frame (borderless style)

  table { margin: 0; }
  thead th { white-space: nowrap; }
  // right-aligned numeric cells, tabular figures (mockup td.num / th.num)
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
}

// Footnote / download line (mockup .dl-line).
.data-table__footnote {
  font-size: 0.85rem;
  margin-top: 0.5rem;

  :deep(p) { margin: 0; }
}
</style>
