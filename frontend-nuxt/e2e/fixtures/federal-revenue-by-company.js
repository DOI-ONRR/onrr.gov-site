// Fixtures for the Federal Revenue by Company dataset page (DatasetView +
// FederalRevenueByCompanyPreview). Like the revenue preview it spreads one measure (revenue, USD)
// across year COLUMNS, but the row dimension is the COMPANY; a breakout adds sub-rows. The
// preview publishes a top-6-companies pivot payload to the dataset's reactive ChartCard.

// Reactive chart_card — the data comes from the datasetPreviewChart inject, so this only carries
// the card config (like the revenue dataset's card).
const endpointChart = (title) => ({
  id: 'frbc-chart-1',
  title,
  data_source_type: 'endpoint',
  endpoint_url: '/charts/federal-revenue-by-company/pivot',
  reacts_to_filters: true,
  chart_type: 'line',
  height: 380,
  show_legend: true,
})

export const federalRevenueByCompanyPage = {
  __typename: 'pages',
  id: 'frbc-page',
  title: 'Federal revenue by company',
  slug: 'federal-revenue-by-company',
  url: '/revenue-data/federal-revenue-by-company',
  hero_image: null,
  hero_title: null,
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,
  dataset_metadata: {
    id: 'frbc-meta',
    name: 'Federal revenue by company',
    description: '<p>Federal revenue reported to ONRR by company, by calendar year.</p>',
    update_frequency: 'Annually',
    formats: ['CSV', 'XLSX', 'API'],
    coverage_start: '2021-01-01',
    coverage_end: '2023-01-01',
    publisher: 'Office of Natural Resources Revenue',
    related_links: [],
    about: null,
    scope: null,
    publication: null,
    preview_component: null,
    source_collection: 'federal_revenue_by_company',
    export_filter: {},
    files: [],
    terms: [],
    charts: [endpointChart('Revenue by year and company')],
  },
}

const YEARS = [2021, 2022, 2023]
const byYear = (a, b, c) => ({ 2021: a, 2022: b, 2023: c })

export function federalRevenueByCompanyOptions() {
  return {
    years: YEARS,
    companies: ['Chevron U.S.A. Inc.', 'ConocoPhillips Company', 'Exxon Mobil Corporation'],
    commodities: ['Oil', 'Gas', 'NGL'],
    revenueTypes: ['Bonus', 'Rents', 'Royalties'],
  }
}

export function federalRevenueByCompanyPivot(breakout = '') {
  if (breakout === 'commodity') {
    const band = (key, base) => ({
      key,
      total: base * 6,
      recordCount: 6,
      byYear: byYear(base * 2, base * 2.2, base * 2.4),
      rows: [
        { key: 'Oil', byYear: byYear(base * 1.2, base * 1.32, base * 1.44) },
        { key: 'Gas', byYear: byYear(base * 0.8, base * 0.88, base * 0.96) },
      ],
    })
    return {
      groupBy: 'company',
      breakout: 'commodity',
      years: YEARS,
      groups: [band('Exxon Mobil Corporation', 1e9), band('Chevron U.S.A. Inc.', 0.7e9)],
      totalsByYear: byYear(3.4e9, 3.74e9, 4.08e9),
      truncated: false,
      shownCompanies: 2,
      totalCompanies: 2,
      recordCount: 12,
    }
  }

  const g = (key, a, b, c) => ({ key, total: a + b + c, recordCount: 3, byYear: byYear(a, b, c) })
  return {
    groupBy: 'company',
    breakout: null,
    years: YEARS,
    groups: [
      g('Exxon Mobil Corporation', 3.0e9, 3.3e9, 3.6e9),
      g('Chevron U.S.A. Inc.', 2.0e9, 2.2e9, 2.4e9),
      g('ConocoPhillips Company', 1.5e9, 1.65e9, 1.8e9),
    ],
    totalsByYear: byYear(6.5e9, 7.15e9, 7.8e9),
    truncated: false,
    shownCompanies: 3,
    totalCompanies: 3,
    recordCount: 9,
  }
}

// The unfiltered full-dataset count (native-export card).
export const federalRevenueByCompanyCount = { data: [{ count: { id: 900 } }] }
