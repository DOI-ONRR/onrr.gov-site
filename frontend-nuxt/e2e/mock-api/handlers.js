import * as eventsFixtures from '../fixtures/events.js'
import * as revenueDataFixtures from '../fixtures/revenue-data.js'

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
  // Events
  {
    match: (query, op) => op === 'GetEvents',
    resolve: () => {
      const fixture = state.events || eventsFixtures.withEvents
      return fixture.data
    },
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

  // Page queries (GetPageBySlug)
  {
    match: (query, op) => op === 'GetPageBySlug',
    resolve: () => ({
      page: [{
        __typename: 'pages',
        title: 'Events',
        slug: 'events',
        url: '/events',
        hero_image: null,
        hero_title: null,
        page_blocks: [],
        sidebar_blocks: [],
        parent: null,
      }],
    }),
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
]
