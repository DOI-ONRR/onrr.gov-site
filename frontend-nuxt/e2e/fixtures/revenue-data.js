// --- GraphQL fixtures ---

export const productionAggregated = {
  production_totals: [
    // FY 2025
    { group: { period: 'p1', commodity: 'c1', location: 'l1' }, sum: { volume: 50000000 } },
    { group: { period: 'p1', commodity: 'c2', location: 'l1' }, sum: { volume: 30000000 } },
    { group: { period: 'p1', commodity: 'c3', location: 'l1' }, sum: { volume: 10000000 } },
    { group: { period: 'p2', commodity: 'c1', location: 'l2' }, sum: { volume: 45000000 } },
    { group: { period: 'p2', commodity: 'c2', location: 'l2' }, sum: { volume: 25000000 } },
    { group: { period: 'p2', commodity: 'c3', location: 'l2' }, sum: { volume: 8000000 } },
    // FY 2024
    { group: { period: 'p3', commodity: 'c1', location: 'l1' }, sum: { volume: 48000000 } },
    { group: { period: 'p3', commodity: 'c2', location: 'l1' }, sum: { volume: 28000000 } },
    { group: { period: 'p3', commodity: 'c3', location: 'l1' }, sum: { volume: 11000000 } },
    { group: { period: 'p4', commodity: 'c1', location: 'l2' }, sum: { volume: 42000000 } },
    { group: { period: 'p4', commodity: 'c2', location: 'l2' }, sum: { volume: 23000000 } },
    { group: { period: 'p4', commodity: 'c3', location: 'l2' }, sum: { volume: 9000000 } },
  ],
  period: [
    { __typename: 'period', id: 'p1', fiscal_year: 2025, fiscal_month: 1, month_short: 'Oct', month_long: 'October', calendar_year: 2024, period_date: '2024-10-01' },
    { __typename: 'period', id: 'p2', fiscal_year: 2025, fiscal_month: 2, month_short: 'Nov', month_long: 'November', calendar_year: 2024, period_date: '2024-11-01' },
    { __typename: 'period', id: 'p3', fiscal_year: 2024, fiscal_month: 1, month_short: 'Oct', month_long: 'October', calendar_year: 2023, period_date: '2023-10-01' },
    { __typename: 'period', id: 'p4', fiscal_year: 2024, fiscal_month: 2, month_short: 'Nov', month_long: 'November', calendar_year: 2023, period_date: '2023-11-01' },
  ],
  commodity: [
    { __typename: 'commodity', id: 'c1', product: 'Oil (bbl)' },
    { __typename: 'commodity', id: 'c2', product: 'Gas (mcf)' },
    { __typename: 'commodity', id: 'c3', product: 'Coal (tons)' },
  ],
  location: [
    { __typename: 'location', id: 'l1', source: 'Federal onshore' },
    { __typename: 'location', id: 'l2', source: 'Federal offshore' },
  ],
}

export const contentBlock = {
  content_blocks: [
    {
      __typename: 'content_blocks',
      block_label: 'Latest release details',
      block_content_html: '<p>Data updated through March 2025.</p>',
    },
  ],
}

export const menuData = {
  menus: [
    {
      __typename: 'menus',
      link_to_page: { title: 'Revenue Data', url: '/revenue-data' },
      menu_children: [
        { pages_id: { title: 'Explore Data', url: '/explore-data' } },
      ],
    },
  ],
}

// --- REST endpoint fixtures ---

export const revenueSummary = {
  data: [
    { breakout_value: 'Federal onshore', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 500000000 },
    { breakout_value: 'Federal onshore', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 550000000 },
    { breakout_value: 'Federal offshore', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 300000000 },
    { breakout_value: 'Federal offshore', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 320000000 },
    { breakout_value: 'Native American', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 100000000 },
    { breakout_value: 'Native American', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 110000000 },
  ],
}

export const disbursementSummary = {
  data: [
    { breakout_value: 'Federal onshore', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 400000000 },
    { breakout_value: 'Federal onshore', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 420000000 },
    { breakout_value: 'Federal offshore', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 200000000 },
    { breakout_value: 'Federal offshore', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 210000000 },
    { breakout_value: 'Native American', fiscal_year: 2024, fiscal_month: 1, calendar_year: 2023, period_date: '2023-10-01', month_short: 'Oct', month_long: 'October', total_amount: 50000000 },
    { breakout_value: 'Native American', fiscal_year: 2025, fiscal_month: 1, calendar_year: 2024, period_date: '2024-10-01', month_short: 'Oct', month_long: 'October', total_amount: 55000000 },
  ],
}

export const fySummaryProduction = {
  data: {
    fiscal_year: 2025,
    max_fiscal_month: 6,
    current: [
      { commodity: 'Oil', unit_abbr: 'bbl', volume: 280000000 },
      { commodity: 'Gas', unit_abbr: 'mcf', volume: 1500000000 },
      { commodity: 'Coal', unit_abbr: 'tons', volume: 45000000 },
    ],
    previous: [
      { commodity: 'Oil', unit_abbr: 'bbl', volume: 260000000 },
      { commodity: 'Gas', unit_abbr: 'mcf', volume: 1400000000 },
      { commodity: 'Coal', unit_abbr: 'tons', volume: 50000000 },
    ],
  },
}

export const fySummaryRevenue = {
  data: {
    fiscal_year: 2025,
    max_fiscal_month: 6,
    current: { revenue: 5200000000, fy: 'current' },
    previous: { revenue: 4800000000, fy: 'previous' },
  },
}

export const fySummaryDisbursements = {
  data: {
    fiscal_year: 2025,
    max_fiscal_month: 6,
    current: { disbursement: 4100000000, fy: 'current' },
    previous: { disbursement: 3900000000, fy: 'previous' },
  },
}
