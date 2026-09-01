// Fixture for a data_tables block (DataTable renderer) on a topic page. The block
// reads its rows from a source collection (NYMEX) via a plain REST read, which the
// mock server answers from `nymexRows` below.

export const nymexRows = [
  { date: '2024-11-02', average: '70.10000', roll: '0.42000' },
  { date: '2024-10-02', average: '71.56000', roll: '0.45000' },
  { date: '2024-09-02', average: '69.37000', roll: '0.50000' },
]

// Snapshot-per-date shape: one row per date, table rows embedded in the `index_zones`
// JSON array. limit 1 → the latest snapshot; DataTable explodes the array.
export const indexZonesRows = [
  {
    date: '2026-03-01',
    index_zones: [
      { abbreviation: 'OK 1', index_zone: 'Oklahoma Zone 1', price: 2.12 },
      { abbreviation: 'OK 3', index_zone: 'Oklahoma Zone 3', price: 2.28 },
    ],
  },
]

export const valuationPage = {
  __typename: 'pages',
  id: 'valuation-page',
  title: 'Valuation & pricing references',
  slug: 'valuation',
  url: '/references/valuation',
  hero_image: null,
  hero_title: null,
  template: 'topic',
  topic_variant: 'sections',
  content_columns: 9,
  parent: { title: 'References', url: '/references' },
  related_content: null,
  meta_title: null,
  meta_description: null,
  sidebar_blocks: [],
  page_blocks: [
    {
      id: 'pb-nymex-table',
      item: {
        __typename: 'data_tables',
        id: 'dt-nymex',
        source_collection: 'NYMEX',
        columns: [
          { field: 'date', label: 'Month', format: 'month_year', align: 'left' },
          { field: 'average', label: 'Calendar month average', format: 'currency', align: 'right' },
          { field: 'roll', label: 'Roll', format: 'currency', align: 'right' },
        ],
        sort_field: 'date',
        sort_direction: 'desc',
        table_filter: null,
        row_limit: 12,
        caption: 'NYMEX calendar month average and roll',
        show_caption: false,
        striped: true,
        compact: true,
        footnote: '<p><a class="usa-link" href="/document/nymex.xlsx">Download the full NYMEX price history (XLSX)</a></p>',
      },
    },
    {
      id: 'pb-zones-table',
      item: {
        __typename: 'data_tables',
        id: 'dt-zones',
        source_collection: 'index_zones',
        source_field: 'index_zones',
        columns: [
          { field: 'abbreviation', label: 'Abbr.', format: 'text', align: 'left' },
          { field: 'index_zone', label: 'Index zone', format: 'text', align: 'left' },
          { field: 'price', label: 'Price', format: 'currency', align: 'right' },
        ],
        sort_field: 'date',
        sort_direction: 'desc',
        table_filter: null,
        row_limit: 1,
        caption: 'Index zone prices',
        show_caption: false,
        striped: true,
        compact: true,
        as_of_label: 'Prices for',
        footnote: null,
      },
    },
  ],
}
