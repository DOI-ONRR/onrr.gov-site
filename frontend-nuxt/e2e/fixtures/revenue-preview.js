// Fixtures for the Revenue dataset page (DatasetView + RevenuePreview).
// One page, all three grains via the in-page Period selector (Monthly / Calendar Year /
// Fiscal Year). Revenue is single-unit (dollars) → currency values, multi-series chart,
// and a "Not tied to a commodity" group. scope/publication are intentionally EMPTY so the
// DatasetView section-header gating can be asserted (headers absent here, present on production).

const endpointChart = (title) => ({
  id: 'rev-chart-1',
  title,
  data_source_type: 'endpoint',
  endpoint_url: '/charts/revenue/pivot',
  reacts_to_filters: true,
  chart_type: 'line',
  height: 380,
  show_legend: true,
})

export const revenuePage = {
  __typename: 'pages',
  id: 'rev-page',
  title: 'Revenue',
  slug: 'revenue-by-commodity',
  url: '/revenue-data/revenue-by-commodity',
  hero_image: null,
  hero_title: null,
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,
  dataset_metadata: {
    id: 'rev-meta',
    name: 'Revenue',
    description: '<p>Revenue ONRR collected from natural resource extraction.</p>',
    update_frequency: 'Monthly, ~3-4 months in arrears',
    formats: ['CSV', 'XLSX', 'API'],
    coverage_start: '2003-01-01',
    coverage_end: '2025-01-01',
    publisher: 'Office of Natural Resources Revenue',
    related_links: [],
    about: null,
    scope: null, // empty → the "Scope" header should NOT render
    publication: null, // empty → the "Data publication" header should NOT render
    preview_component: null,
    source_collection: 'revenue',
    export_filter: { period: { type: { _eq: 'Fiscal Year' } } },
    files: [],
    terms: [],
    charts: [endpointChart('Revenue by year and commodity')],
  },
}

export function revenueOptions(period) {
  const periodType = period === 'monthly' ? 'Monthly' : period === 'calendar-year' ? 'Calendar Year' : 'Fiscal Year'
  return {
    periodType,
    years: [2022, 2023, 2024],
    landTypes: ['Federal offshore', 'Federal onshore', 'Native American'],
    revenueTypes: ['Bonus', 'Rents', 'Royalties'],
    products: ['Oil', 'Gas', 'Coal'],
    regions: ['Gulf of America', 'New Mexico', 'Wyoming'],
  }
}

const flatGroup = (key, y) => ({
  key,
  total: Object.values(y).reduce((a, b) => a + b, 0),
  recordCount: Object.keys(y).length,
  byYear: { ...y },
})

export function revenuePivot(period) {
  if (period === 'monthly') {
    const years = [2023, 2024]
    const mgroup = (key, base) => ({
      key,
      total: base * 4,
      recordCount: 4,
      byYear: { 2023: base * 2, 2024: base * 2 },
      months: [
        { month: 1, monthName: 'January', byYear: { 2023: base, 2024: base }, total: base * 2 },
        { month: 9, monthName: 'September', byYear: { 2023: base, 2024: base }, total: base * 2 },
      ],
    })
    return {
      groupBy: 'product',
      periodType: 'Monthly',
      years,
      groups: [mgroup('Oil', 1000000), mgroup('Gas', 500000), mgroup('Not tied to a commodity', 250000)],
      grandTotal: 7000000,
      recordCount: 12,
    }
  }

  const periodType = period === 'calendar-year' ? 'Calendar Year' : 'Fiscal Year'
  const years = [2022, 2023, 2024]
  return {
    groupBy: 'product',
    periodType,
    years,
    groups: [
      flatGroup('Oil', { 2022: 1200000000, 2023: 1300000000, 2024: 1400000000 }),
      flatGroup('Not tied to a commodity', { 2022: 400000000, 2023: 420000000, 2024: 450000000 }),
      flatGroup('Gas', { 2022: 300000000, 2023: 310000000, 2024: 320000000 }),
    ],
    grandTotal: 6100000000,
    recordCount: 9,
  }
}

export const revenueCount = { data: [{ count: { id: 51000 } }] }
