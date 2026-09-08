/*
  Client-side XLSX downloads for CMS-authored links. Directus's native API can't emit XLSX
  (only csv/json/xml/yaml), so we fetch the collection and build the workbook in the browser
  with SheetJS. The download is self-contained (fetches its own data), so a CMS content link
  `#download/<slug>` works anywhere — including topic pages that render curated DataTable
  blocks rather than the live pricing components.

  Imported only by the data-downloads.client plugin (which delegates the link clicks), so
  there's no shared component/module state to get instantiated twice.
*/

// Split a Directus date into the {year, long-month} the pricing tables display.
function ym(dateStr) {
  const d = new Date(dateStr)
  return { year: d.getFullYear(), month: d.toLocaleDateString('en-US', { month: 'long' }) }
}
function dueDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

// Per-slug dataset: which collection to fetch, how to flatten it (mirrors each pricing
// component), the export columns, and the filename. `index_zones`/`ibmp_line_items` are
// JSON array columns, so REST returns them as nested arrays directly.
const DATASETS = {
  nymex: {
    collection: 'NYMEX',
    fields: 'date,average,roll',
    sort: 'date',
    flatten: (data) => data.map((r) => ({ ...ym(r.date), average: r.average, roll: r.roll })),
    columns: [
      { key: 'year', label: 'Year' },
      { key: 'month', label: 'Month' },
      { key: 'average', label: 'Calendar Month Avg.' },
      { key: 'roll', label: 'NYMEX Roll' },
    ],
    filename: 'nymex-price-history.xlsx',
    sheet: 'NYMEX',
  },
  'index-zones': {
    collection: 'index_zones',
    fields: 'date,index_zones',
    sort: '-date',
    flatten: (data) => {
      const out = []
      for (const rec of data) {
        const { year, month } = ym(rec.date)
        for (const z of rec.index_zones || []) {
          out.push({ indexZone: `${z.index_zone} (${z.abbreviation})`, year, month, price: z.price })
        }
      }
      return out
    },
    columns: [
      { key: 'indexZone', label: 'Index Zone' },
      { key: 'year', label: 'Year' },
      { key: 'month', label: 'Month' },
      { key: 'price', label: 'Price' },
    ],
    filename: 'indian-gas-index-zone-prices.xlsx',
    sheet: 'Index Zone Prices',
  },
  'major-portion': {
    collection: 'indian_gas_major_portion',
    fields: 'date,index_zones',
    sort: '-date',
    flatten: (data) => {
      const out = []
      for (const rec of data) {
        const { year, month } = ym(rec.date)
        for (const z of rec.index_zones || []) {
          out.push({ designatedArea: z.designatedArea, year, month, price: z.price, dueDate: z.dueDate })
        }
      }
      return out
    },
    columns: [
      { key: 'designatedArea', label: 'Designated Area' },
      { key: 'year', label: 'Year' },
      { key: 'month', label: 'Month' },
      { key: 'price', label: 'Price' },
      { key: 'dueDate', label: 'Due Date', format: dueDate },
    ],
    filename: 'indian-gas-major-portion-prices.xlsx',
    sheet: 'Major Portion Prices',
  },
  ibmp: {
    collection: 'ibmp',
    fields: 'date,ibmp_line_items',
    sort: '-date',
    flatten: (data) => {
      const out = []
      for (const rec of data) {
        const { year, month } = ym(rec.date)
        for (const row of rec.ibmp_line_items || []) {
          out.push({
            designatedArea: row.designatedArea,
            year,
            month,
            condensate02: row.condensate02,
            sweet61: row.sweet61,
            sour62: row.sour62,
            asphaltic63: row.asphaltic63,
            blackWax64: row.blackWax64,
            yellowWax65: row.yellowWax65,
          })
        }
      }
      return out
    },
    columns: [
      { key: 'designatedArea', label: 'Designated Area' },
      { key: 'year', label: 'Year' },
      { key: 'month', label: 'Month' },
      { key: 'condensate02', label: 'Condensate (02)' },
      { key: 'sweet61', label: 'Sweet (61)' },
      { key: 'sour62', label: 'Sour (62)' },
      { key: 'asphaltic63', label: 'Asphaltic (63)' },
      { key: 'blackWax64', label: 'Black Wax (64)' },
      { key: 'yellowWax65', label: 'Yellow Wax (65)' },
    ],
    filename: 'indian-oil-ibmp-prices.xlsx',
    sheet: 'IBMP Prices',
  },
}

export function hasDataset(slug) {
  return Object.prototype.hasOwnProperty.call(DATASETS, slug)
}

// Build + save an XLSX from array-of-objects `rows` using a column spec
// (`[{ key, label, format? }]`). Numeric cells stay numeric. SheetJS is lazy-loaded.
async function buildXlsx(rows, columns, filename, sheetName = 'Data') {
  const XLSX = await import('xlsx')
  const header = columns.map((c) => c.label)
  const body = rows.map((r) => columns.map((c) => (c.format ? c.format(r[c.key], r) : r[c.key] ?? '')))
  const ws = XLSX.utils.aoa_to_sheet([header, ...body])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

// Fetch the dataset's full published history and download it as XLSX.
export async function runDataDownload(slug, apiUrl) {
  const cfg = DATASETS[slug]
  if (!cfg) return false
  const res = await $fetch(`${apiUrl}/items/${cfg.collection}`, {
    query: { fields: cfg.fields, sort: cfg.sort, limit: -1, filter: JSON.stringify({ status: { _eq: 'published' } }) },
  })
  await buildXlsx(cfg.flatten(res?.data ?? []), cfg.columns, cfg.filename, cfg.sheet)
  return true
}
