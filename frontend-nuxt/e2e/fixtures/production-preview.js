// Fixtures for the Production dataset pages (DatasetView + ProductionPreview).
//   - yearly-production  (export_filter Fiscal Year → Period selector FY/CY, flat table)
//   - monthly-production (export_filter Monthly → grouped table with month detail)
// Pivot/options are served by REST handlers, varying by ?period= (and ?breakout=).

const endpointChart = (title) => ({
  id: 'prod-chart-1',
  title,
  data_source_type: 'endpoint',
  endpoint_url: '/charts/production/pivot',
  reacts_to_filters: true,
  chart_type: 'line',
  height: 380,
  show_legend: true,
})

function datasetMeta(overrides = {}) {
  return {
    id: 'prod-meta',
    name: 'Production',
    description: '<p>Production volumes.</p>',
    update_frequency: 'Monthly, ~3-4 months in arrears',
    formats: ['CSV', 'XLSX', 'API'],
    coverage_start: '2003-01-01',
    coverage_end: '2024-01-01',
    publisher: 'Office of Natural Resources Revenue',
    related_links: [],
    about: null,
    // Populated so the "Scope" / "Data publication" headers render (gating test).
    scope: '<p>Production scope text.</p>',
    publication: '<p>Production publication text.</p>',
    preview_component: null,
    source_collection: 'production',
    export_filter: { period: { type: { _eq: 'Fiscal Year' } } },
    files: [],
    terms: [],
    charts: [endpointChart('Production by year and product')],
    ...overrides,
  }
}

const page = (id, slug, title, meta) => ({
  __typename: 'pages',
  id,
  title,
  slug,
  url: `/revenue-data/${slug}`,
  hero_image: null,
  hero_title: null,
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,
  dataset_metadata: meta,
})

export const productionYearlyPage = page('prod-page-yearly', 'yearly-production', 'Yearly production', datasetMeta({ id: 'prod-meta-yearly' }))

export const productionMonthlyPage = page('prod-page-monthly', 'monthly-production', 'Monthly production', datasetMeta({
  id: 'prod-meta-monthly',
  name: 'Monthly production',
  export_filter: { period: { type: { _eq: 'Monthly' } } },
}))

const LAND = {
  landTypes: ['Federal offshore', 'Federal onshore', 'Native American'],
  landClasses: ['Federal', 'Native American'],
  landCategories: ['Offshore', 'Onshore'],
  regions: ['Gulf of America', 'New Mexico', 'Wyoming'],
  products: ['Gas (mcf)', 'Oil (bbl)', 'Coal (tons)'],
}

export function productionOptions(period) {
  if (period === 'monthly') {
    return { periodType: 'Monthly', months: ['2023-01-01', '2023-02-01', '2024-01-01', '2024-02-01'], ...LAND }
  }
  const periodType = period === 'calendar-year' ? 'Calendar Year' : 'Fiscal Year'
  return { periodType, years: [2022, 2023, 2024], ...LAND }
}

const flatGroup = (key, y) => ({
  key,
  total: Object.values(y).reduce((a, b) => a + b, 0),
  recordCount: Object.keys(y).length,
  byYear: { ...y },
})

export function productionPivot(period, breakout) {
  if (period === 'monthly') {
    const years = [2023, 2024]
    const mgroup = (key) => ({
      key,
      total: 100,
      recordCount: 4,
      byYear: { 2023: 50, 2024: 50 },
      months: [
        { month: 1, monthName: 'January', byYear: { 2023: 25, 2024: 25 }, total: 50 },
        { month: 2, monthName: 'February', byYear: { 2023: 25, 2024: 25 }, total: 50 },
      ],
    })
    return { groupBy: 'product', periodType: 'Monthly', years, groups: [mgroup('Gas (mcf)'), mgroup('Oil (bbl)'), mgroup('Coal (tons)')], grandTotal: 300, recordCount: 12 }
  }

  const periodType = period === 'calendar-year' ? 'Calendar Year' : 'Fiscal Year'
  const years = [2022, 2023, 2024]

  if (breakout === 'state') {
    const bgroup = (key) => ({
      key,
      total: 90,
      recordCount: 6,
      byYear: { 2022: 30, 2023: 30, 2024: 30 },
      rows: [
        { key: 'Wyoming', byYear: { 2022: 20, 2023: 20, 2024: 20 } },
        { key: 'New Mexico', byYear: { 2022: 10, 2023: 10, 2024: 10 } },
      ],
    })
    return { groupBy: 'product', periodType, breakout: 'state', years, groups: [bgroup('Gas (mcf)'), bgroup('Oil (bbl)')], grandTotal: 180, recordCount: 12 }
  }

  return {
    groupBy: 'product',
    periodType,
    years,
    groups: [
      flatGroup('Gas (mcf)', { 2022: 900, 2023: 850, 2024: 800 }),
      flatGroup('Oil (bbl)', { 2022: 500, 2023: 520, 2024: 540 }),
      flatGroup('Coal (tons)', { 2022: 300, 2023: 280, 2024: 260 }),
    ],
    grandTotal: 4990,
    recordCount: 9,
  }
}

export const productionCount = { data: [{ count: { id: 2184 } }] }
