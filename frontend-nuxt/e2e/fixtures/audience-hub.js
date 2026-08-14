// Fixture for an `audience-hub` template page (AudienceHubView), modeled on the Indian
// Resources mockup. Exercises every piece: the full-width header band (breadcrumb + h1 +
// intro), the audience-routing cards, the services list + help box, and the data band's
// "Learn how it works" links. Served by the GetPageBySlug mock for the `indian-resources`
// slug.
//
// hub_chart is null here so the data band renders without pulling in ChartCard's data
// fetch — the chart is covered by the chart-cards fixtures. The band still renders via
// its links column.

export const audienceHubPage = {
  __typename: 'pages',
  id: 'hub-1',
  title: 'Indian Resources',
  slug: 'indian-resources',
  url: '/indian-resources',
  template: 'audience-hub',
  hero_title: null,
  hero_image: null,
  parent: { title: 'Home', url: '/', parent: null },
  sidebar_blocks: [],
  dataset_metadata: null,
  meta_title: null,
  meta_description: null,

  // Intro prose (rendered inside the header band).
  page_blocks: [
    {
      id: 'b1',
      item: {
        __typename: 'content_blocks',
        block_content_html:
          '<p>Revenue from energy and mineral production on Indian lands is collected and paid to the Tribes and individual mineral owners it belongs to.</p>',
      },
    },
  ],

  audience_heading: 'Start with who you are',
  services_heading: 'Everything in this section',
  data_heading: 'Learn how it works',

  // Data-band chart: annual disbursements scoped to the Native American recipient group
  // (calendar-year-totals?recipient=native_american). The takeaway is interpolated from
  // the endpoint rows — `aggregate: 'last'` picks 2025; currency_compact → "$911.4M";
  // the year uses an empty format so it stays "2025" (a `number` format would give "2,025").
  hub_chart: {
    __typename: 'chart_cards',
    id: 'hub-chart-1',
    key: 'ir-disbursements',
    title: 'Disbursements to Tribes and individual mineral owners',
    source: null,
    chart_type: 'column',
    render_mode: 'chart',
    stacking: null,
    takeaway: '{amount} reached Tribes and individual Indian mineral owners in {year}.',
    takeaway_variables: [
      { token: 'amount', field: 'total_amount', aggregate: 'last', format: 'currency_compact' },
      { token: 'year', field: 'calendar_year', aggregate: 'last', format: '' },
    ],
    data_source_type: 'endpoint',
    source_collection: null,
    aggregate_function: null,
    aggregate_field: null,
    group_by_field: null,
    filter: null,
    endpoint_url: '/charts/disbursement/calendar-year-totals?years=10&recipient=native_american',
    x_axis_field: 'calendar_year',
    static_data: null,
    x_axis_label: null,
    y_axis_label: null,
    x_axis_type: 'category',
    x_axis_format: null,
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
    table_category_label: null,
    table_include_category: true,
    table_show_totals: false,
    table_totals_direction: null,
    table_default_sort: null,
    table_sort_direction: null,
    highcharts_config: null,
    series: [{
      id: 'hub-series-1',
      sort: 0,
      name: 'Disbursements',
      type: null,
      color: '#8168b3',
      y_axis: 'primary',
      data_field: 'total_amount',
      stack_group: null,
      value_format: 'currency',
      prefix: null,
      suffix: null,
      dash_style: null,
      marker_enabled: false,
      visible: true,
      static_data: null,
    }],
  },

  audience_cards: [
    { id: 'ac1', title: 'I own the minerals', body: '<ul><li><a href="#">Get help with your account or payments</a></li><li><a href="#">Understand ownership</a></li></ul>' },
    { id: 'ac2', title: 'I represent a Tribe', body: '<ul><li><a href="#">Tribal consultation</a></li><li><a href="#">Tribal lockbox payments</a></li></ul>' },
    { id: 'ac3', title: 'I report on Indian leases', body: '<ul><li><a href="#">Indian pricing</a></li><li><a href="#">New to reporting? Get started</a></li></ul>' },
  ],

  hub_services: [
    { id: 'sv1', title: 'Assistance', url: '#', description: 'Help for individual Indian mineral owners — explanation of payments and statements.' },
    { id: 'sv2', title: 'Tribal consultation', url: '#', description: 'How ONRR consults with Tribes on policy, rulemaking, and decisions.' },
  ],

  hub_links: [
    // aside help box (single)
    { id: 'h1', section: 'help', title: 'Talk to a person', description: '<p>ONRR staff help individual Indian mineral owners understand their payments.</p>', link_label: 'Contact ONRR assistance', link_url: '#' },
    // data band "Learn how it works" list
    { id: 'd1', section: 'data-link', title: 'Native American ownership & governance', link_label: null, link_url: '#' },
    { id: 'd2', section: 'data-link', title: 'Production on Native American lands', link_label: null, link_url: '#' },
    { id: 'd3', section: 'data-link', title: 'Revenue from Native American lands', link_label: null, link_url: '#' },
  ],
}
