import * as eventsFixtures from '../fixtures/events.js'
import * as revenueDataFixtures from '../fixtures/revenue-data.js'
import { chartCardsByKey, chartEndpointData } from '../fixtures/chart-cards.js'
import { journeyPage } from '../fixtures/journey.js'
import { audienceHubPage } from '../fixtures/audience-hub.js'
import { homePage, homeChartData } from '../fixtures/home.js'
import { glossaryTerms } from '../fixtures/glossary.js'
import { handbooks as handbooksItems, handbooksPage } from '../fixtures/handbooks.js'
import { handbookPage, handbookToc } from '../fixtures/handbook-detail.js'
import { paymentOptionsPage } from '../fixtures/payment-options.js'

/**
 * Each handler has:
 *   match(query) - returns true if this handler should respond
 *   resolve(query) - returns the data object for the response
 *
 * The default fixtures can be overridden per-test via the
 * setState/getState mechanism below.
 */

// Shared mutable state that tests can override
let state = {}

export function setState(key, value) {
  state[key] = value
}

export function getState(key) {
  return state[key]
}

export function resetState() {
  state = {}
}

export const handlers = [
  // Events (single list; the events page groups by event_category client-side)
  {
    match: (query, op) => op === 'GetEvents',
    resolve: () => state.events || eventsFixtures.withEvents,
  },

  // Production aggregated (landingPageProduction query)
  {
    match: (query, op) => op === 'LandingPageProduction',
    resolve: () => revenueDataFixtures.productionAggregated,
  },

  // Content blocks by label
  {
    match: (query, op) => op === 'GetContentBlockByLabel',
    resolve: () => revenueDataFixtures.contentBlock,
  },

  // Menu queries (GetMenuByLabel)
  {
    match: (query, op) => op === 'GetMenuByLabel',
    resolve: () => revenueDataFixtures.menuData,
  },

  // Glossary terms (glossary page)
  {
    match: (query, op) => op === 'GetGlossaryTerms',
    resolve: () => ({ glossary_terms: glossaryTerms }),
  },

  // Handbooks index (References › Handbooks, via CollectionBlock → <Handbooks>)
  {
    match: (query, op) => op === 'GetHandbooks',
    resolve: () => ({ handbooks: state.handbooks ?? handbooksItems }),
  },

  // Handbook detail TOC rows (HandbookDetailView)
  {
    match: (query, op) => op === 'GetHandbookToc',
    resolve: () => ({ handbook_toc: state.handbookToc ?? handbookToc }),
  },

  // Chart card by key (ChartCardByKey on the Revenue Data landing page). Returns the
  // card matching the `key` variable, or an empty list for an unknown key.
  {
    match: (query, op) => op === 'GetChartCardByKey',
    resolve: (query, variables) => {
      const card = chartCardsByKey[variables?.key]
      return { chart_cards: card ? [card] : [] }
    },
  },

  // Page queries (GetPageBySlug) — slug-aware: homepage for the null slug (index.vue),
  // journey-landing for 'getting-started', audience-hub for 'indian-resources', the
  // default (Events) page otherwise.
  {
    match: (query, op) => op === 'GetPageBySlug',
    resolve: (query, variables) => {
      if (variables?.slug == null) return { page: [homePage] }
      if (variables?.slug === 'getting-started') return { page: [journeyPage] }
      if (variables?.slug === 'indian-resources') return { page: [audienceHubPage] }
      if (variables?.slug === 'handbooks') return { page: [handbooksPage] }
      if (variables?.slug === 'minerals-revenue-reporter-handbook') return { page: [handbookPage] }
      if (variables?.slug === 'payment-options') return { page: [paymentOptionsPage] }
      return {
        page: [{
          __typename: 'pages',
          id: 'mock-page-1',
          title: 'Events',
          slug: 'events',
          url: '/events',
          hero_image: null,
          hero_title: null,
          page_blocks: [],
          sidebar_blocks: [],
          parent: null,
          meta_title: null,
          meta_description: null,
        }],
      }
    },
  },
]

/**
 * REST endpoint handlers.
 * Matched by URL path in the server.
 */
export const restHandlers = [
  {
    match: (url) => url.startsWith('/revenue-summary'),
    resolve: () => revenueDataFixtures.revenueSummary,
  },
  {
    match: (url) => url.startsWith('/disbursement-summary'),
    resolve: () => revenueDataFixtures.disbursementSummary,
  },
  {
    match: (url) => url === '/fy-summary/production',
    resolve: () => revenueDataFixtures.fySummaryProduction,
  },
  {
    match: (url) => url === '/fy-summary/revenue',
    resolve: () => revenueDataFixtures.fySummaryRevenue,
  },
  {
    match: (url) => url === '/fy-summary/disbursements',
    resolve: () => revenueDataFixtures.fySummaryDisbursements,
  },
  // Chart endpoints backing the ChartCardByKey charts (data source: endpoint).
  // calendar-year-totals varies by recipient: the audience-hub chart requests
  // ?recipient=native_american and gets the Native-American-scoped totals.
  {
    match: (url) => url === '/charts/disbursement/calendar-year-totals',
    resolve: (urlPath, fullUrl = '') =>
      (fullUrl.includes('recipient=native_american')
        ? chartEndpointData['/charts/disbursement/calendar-year-totals?recipient=native_american']
        : chartEndpointData['/charts/disbursement/calendar-year-totals']),
  },
  {
    match: (url) => url === '/charts/disbursement/top-states',
    resolve: () => chartEndpointData['/charts/disbursement/top-states'],
  },
  // Homepage chart band (total monthly disbursements).
  {
    match: (url) => url === '/charts/disbursement/total-monthly-disbursements',
    resolve: () => homeChartData,
  },
]
