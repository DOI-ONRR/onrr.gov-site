// Fixtures for the Monthly Disbursements dataset page (/revenue-data/monthly-disbursements)
// — the DatasetView + DisbursementPreview (pivot) + DatasetDownloads section.
//
// The page is served by the GetPageBySlug mock for slug "monthly-disbursements"; the
// pivot/options + pivot + count endpoints are served by REST handlers.

// A curated file attached via dataset_metadata.files (M2M → directus_files).
const xlsxFile = {
  directus_files_id: {
    id: 'file-xlsx-1',
    title: 'Monthly Disbursements',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filesize: 1992294, // ~1.9 MB
    filename_download: 'monthly_disbursements.xlsx',
  },
}

// The dataset page. `dataset_metadata` drives DatasetView; a `static` chart avoids any
// chart data fetch (ChartCard renders an info notice for unsupported source types).
export const datasetPage = {
  __typename: 'pages',
  id: 'ds-page-1',
  title: 'Monthly disbursements',
  slug: 'monthly-disbursements',
  url: '/revenue-data/monthly-disbursements',
  hero_image: null,
  hero_title: null,
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,
  dataset_metadata: {
    id: 'ds-meta-1',
    name: 'Monthly disbursements',
    description: '<p>Money paid each month to states, Tribes, and federal funds.</p>',
    update_frequency: 'Monthly, about the last business day',
    formats: ['CSV', 'XLSX', 'API'],
    coverage_start: '2016-10-01',
    coverage_end: '2022-10-01',
    publisher: 'Office of Natural Resources Revenue',
    related_links: [],
    about: '<p>Disbursement data comes from ONRR&rsquo;s financial system.</p>',
    preview_component: 'disbursements',
    source_collection: 'disbursement',
    export_filter: { period: { type: { _eq: 'Monthly' } } },
    files: [xlsxFile],
    terms: [],
    charts: [{ id: 'ds-chart-1', title: 'Disbursements by month and recipient', data_source_type: 'static' }],
  },
}

// Distinct filter-dropdown values for the pivot UI (/charts/disbursement/pivot/options).
export const pivotOptions = {
  months: ['2020-01-01', '2020-02-01', '2021-01-01', '2021-02-01'],
  states: ['Colorado', 'New Mexico', 'Wyoming'],
  commodities: ['Gas', 'Oil'],
  sources: ['8(g) offshore', 'OCS Gulf', 'Offshore', 'Onshore'],
  recipients: [
    { key: 'state_local', label: 'State & local' },
    { key: 'us_treasury', label: 'U.S. Treasury' },
    { key: 'native_american', label: 'Native American' },
    { key: 'reclamation_fund', label: 'Reclamation Fund' },
    { key: 'land_water', label: 'Land and Water Conservation Fund' },
    { key: 'historic_preservation', label: 'Historic Preservation Fund' },
    { key: 'other_funds', label: 'Other funds' },
  ],
}

// Build a pivot response for a group-by dimension. Two groups so the group-by switch is
// observable; U.S. Treasury's Sep-2021 value is NEGATIVE to exercise the text-secondary
// styling. Years span 2020–2021.
function group(key, jan, sep) {
  return {
    key,
    total: jan[2020] + jan[2021] + sep[2020] + sep[2021],
    byYear: { 2020: jan[2020] + sep[2020], 2021: jan[2021] + sep[2021] },
    months: [
      { month: 1, monthName: 'January', byYear: { ...jan }, total: jan[2020] + jan[2021] },
      { month: 9, monthName: 'September', byYear: { ...sep }, total: sep[2020] + sep[2021] },
    ],
  }
}

export function pivotResponse(groupBy = 'recipient') {
  const groups =
    groupBy === 'source'
      ? [
          group('Onshore', { 2020: 500, 2021: 600 }, { 2020: 700, 2021: 800 }),
          group('Offshore', { 2020: 300, 2021: 400 }, { 2020: 200, 2021: 250 }),
        ]
      : [
          group('State & local', { 2020: 1000, 2021: 1200 }, { 2020: 900, 2021: 1100 }),
          group('U.S. Treasury', { 2020: 2000, 2021: 2200 }, { 2020: 1500, 2021: -100 }),
        ]
  const grandTotal = groups.reduce((a, g) => a + g.total, 0)
  return { groupBy, years: [2020, 2021], groups, grandTotal, recordCount: 50769 }
}

// The unfiltered full-dataset count (native-export card), scoped by export_filter server-side.
export const disbursementCount = { data: [{ count: { id: 50769 } }] }
