// Fixture for the homepage (index.vue), served by the GetPageBySlug mock for the null
// slug. Exercises the hero (title / description / CTAs) and all four `page_bands` content
// types: cards, prose (body + aside), chart, and steps.

// chart_cards-shaped config for the chart band (endpoint data source).
const homeChart = {
  __typename: 'chart_cards',
  id: 'home-chart',
  key: 'home-total-monthly',
  title: 'Total monthly disbursements',
  source: '<p>Source: monthly disbursements dataset.</p>',
  chart_type: 'column',
  render_mode: 'chart',
  stacking: null,
  takeaway: '{amount} disbursed in {month}.',
  takeaway_variables: [
    { token: 'amount', field: 'total_amount', aggregate: 'last', format: 'currency_compact' },
    { token: 'month', field: 'period_date', aggregate: 'last', format: 'month_year' },
  ],
  data_source_type: 'endpoint',
  source_collection: null,
  aggregate_function: null,
  aggregate_field: null,
  group_by_field: null,
  filter: null,
  endpoint_url: '/charts/disbursement/total-monthly-disbursements?months=24',
  x_axis_field: 'period_date',
  static_data: null,
  x_axis_label: null,
  y_axis_label: null,
  x_axis_type: 'category',
  x_axis_format: 'month_year',
  tick_interval: null,
  y_axis_min: 0,
  y_axis_max: null,
  y_tick_interval: null,
  y_axis_secondary_label: null,
  grid_columns: 12,
  color_palette: null,
  background_color: null,
  height: 260,
  show_legend: false,
  legend_position: 'bottom',
  show_data_labels: false,
  show_tooltip: true,
  enable_export: false,
  enable_zoom: false,
  table_category_label: 'Month',
  table_include_category: true,
  table_show_totals: false,
  table_totals_direction: null,
  table_default_sort: null,
  table_sort_direction: null,
  highcharts_config: null,
  series: [{
    id: 'home-chart-series', sort: 0, name: 'Disbursements', type: null,
    color: '#005ea2', y_axis: 'primary', data_field: 'total_amount', stack_group: null,
    value_format: 'currency', prefix: null, suffix: null, dash_style: null,
    marker_enabled: false, visible: true, static_data: null,
  }],
}

export const homePage = {
  __typename: 'pages',
  id: 'home-1',
  title: 'Home',
  slug: null,
  hero_image: null,
  hero_title: 'Natural resources revenue, collected and returned to the public',
  hero_description: 'ONRR collects, accounts for, and disburses revenue from energy and mineral production on federal and Indian lands.',
  hero_cta: [
    { label: 'Report & pay', url: '/report-pay' },
    { label: 'Explore the data', url: '/revenue-data' },
  ],
  page_blocks: [],
  sidebar_blocks: [],
  parent: null,
  meta_title: null,
  meta_description: null,

  page_bands: [
    // 1. cards band
    {
      id: 'b-cards', heading: 'What do you need to do?', background: 'default',
      body: null, aside: null, cta_label: null, cta_url: null, body_columns: 12,
      chart: null, steps: [],
      cards: [
        { id: 'c1', title: 'Get started', body: '<ul><li><a href="#">Set up system access</a></li></ul>', cta_label: 'Getting Started', cta_url: '/getting-started' },
        { id: 'c2', title: 'Report', body: '<ul><li><a href="#">Report royalty revenue</a></li></ul>', cta_label: 'Reporting', cta_url: '/reporting' },
        { id: 'c3', title: 'Pay', body: '<ul><li><a href="#">Make a payment</a></li></ul>', cta_label: 'Paying', cta_url: '/paying' },
      ],
    },
    // 2. prose band (body + aside, 8/4, muted)
    {
      id: 'b-prose', heading: 'Indian mineral owners and Tribes', background: 'muted',
      body: '<p>Resources for individual Indian mineral owners, Tribes, and allottees.</p>',
      aside: '<ul class="usa-list usa-list--unstyled"><li><a href="#">Indian references</a></li></ul>',
      cta_label: 'Visit Indian Resources', cta_url: '/indian-resources', body_columns: 8,
      chart: null, steps: [], cards: [],
    },
    // 3. chart band (subtle)
    {
      id: 'b-chart', heading: 'The numbers, updated monthly', background: 'subtle',
      body: null, aside: null, cta_label: null, cta_url: null, body_columns: 8,
      chart: homeChart, steps: [], cards: [],
    },
    // 4. steps band
    {
      id: 'b-steps', heading: 'How revenue works', background: 'default',
      body: null, aside: null, cta_label: 'Learn how revenue works', cta_url: '#', body_columns: 12,
      chart: null, cards: [],
      steps: [
        { id: 's1', title: 'Companies produce', body: '<p>Companies lease and produce.</p>' },
        { id: 's2', title: 'ONRR collects', body: '<p>Producers report and pay.</p>' },
        { id: 's3', title: 'Revenue returns', body: '<p>Funds are disbursed.</p>' },
      ],
    },
  ],
}

// The three most recent published announcements, rendered as a 3-up card grid below
// the page bands (HomeAnnouncements + GetRecentAnnouncements). content is WYSIWYG.
export const recentAnnouncements = [
  { id: 'a1', title: 'Q1 reporting deadline extended', content: '<p>The deadline has moved to March 31.</p>' },
  { id: 'a2', title: 'New valuation guidance published', content: '<p>Revised oil and gas valuation guidance is now available.</p>' },
  { id: 'a3', title: 'System maintenance window', content: '<p>eCommerce will be offline Sunday 2–4am ET.</p>' },
]

// Endpoint data for the chart band. Last row (Dec 2025) drives the takeaway:
// currency_compact($1,149,450,226) = "$1.1B", month_year(period_date) = "Dec 2025".
export const homeChartData = {
  data: [
    { period_date: '2025-10-01T05:00:00.000Z', month_short: 'Oct', total_amount: 1200000000 },
    { period_date: '2025-11-01T05:00:00.000Z', month_short: 'Nov', total_amount: 1300000000 },
    { period_date: '2025-12-01T05:00:00.000Z', month_short: 'Dec', total_amount: 1149450226 },
  ],
}
