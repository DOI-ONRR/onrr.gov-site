// Fixtures for the Federal Sales dataset page (DatasetView + FederalSalesPreview).
// Federal sales aggregates six MEASURE columns (Sales Volume, Sales Value, RVPA, TA, PA, RVLA)
// for the calendar-year range, one row per commodity; a breakout adds sub-rows. A `static`
// chart avoids any chart data fetch.

export const federalSalesPage = {
  __typename: 'pages',
  id: 'fs-page',
  title: 'Federal sales',
  slug: 'federal-sales',
  url: '/revenue-data/federal-sales',
  hero_image: null,
  hero_title: null,
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,
  dataset_metadata: {
    id: 'fs-meta',
    name: 'Federal sales',
    description: '<p>Sales of federal royalty commodities taken in kind.</p>',
    update_frequency: 'Annually',
    formats: ['CSV', 'XLSX', 'API'],
    coverage_start: '2013-01-01',
    coverage_end: '2024-01-01',
    publisher: 'Office of Natural Resources Revenue',
    related_links: [],
    about: null,
    scope: null,
    publication: null,
    preview_component: null,
    source_collection: 'federal_sales',
    export_filter: {},
    files: [],
    terms: [],
    charts: [{ id: 'fs-chart', title: 'Federal sales', data_source_type: 'static' }],
  },
}

export function federalSalesOptions() {
  return {
    years: [2020, 2021, 2022, 2023],
    commodities: ['Oil', 'Gas', 'NGL'],
    landTypes: ['Federal Offshore', 'Federal Onshore'],
    regions: ['Gulf of America', 'New Mexico', 'Wyoming'],
  }
}

// The six measures, keyed as the endpoint returns them.
const M = (sv, sval, rvpa, ta, pa, rvla) => ({ sales_volume: sv, sales_value: sval, rvpa, ta, pa, rvla })

export function federalSalesPivot(breakout = '') {
  if (breakout === 'land_type') {
    const bgroup = (key, base) => ({
      key,
      recordCount: 6,
      values: M(base * 3, base * 30, base * 27, -base, 0, base * 26),
      rows: [
        { key: 'Federal Onshore', values: M(base * 2, base * 20, base * 18, -base * 0.6, 0, base * 17.4) },
        { key: 'Federal Offshore', values: M(base, base * 10, base * 9, -base * 0.4, 0, base * 8.6) },
      ],
    })
    return {
      groupBy: 'commodity',
      breakout: 'land_type',
      groups: [bgroup('Oil', 1000), bgroup('Gas', 500)],
      totals: M(4500, 45000, 40500, -1500, 0, 39000),
      recordCount: 12,
    }
  }

  const g = (key, sv, sval, rvpa, ta, pa, rvla, cnt) => ({ key, recordCount: cnt, values: M(sv, sval, rvpa, ta, pa, rvla) })
  return {
    groupBy: 'commodity',
    breakout: null,
    groups: [
      g('Oil', 3000, 30000, 27000, -1000, 0, 26000, 6),
      g('Gas', 1500, 15000, 13500, -500, 0, 13000, 4),
      g('NGL', 500, 5000, 4500, -200, -100, 4200, 2),
    ],
    totals: M(5000, 50000, 45000, -1700, -100, 43200),
    recordCount: 12,
  }
}

// The unfiltered full-dataset count (native-export card).
export const federalSalesCount = { data: [{ count: { id: 872 } }] }
