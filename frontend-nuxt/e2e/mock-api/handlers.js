import * as eventsFixtures from '../fixtures/events.js'

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
  {
    match: (query) => query?.includes('events'),
    resolve: () => {
      const fixture = state.events || eventsFixtures.withEvents
      return fixture.data
    },
  },

  // Menu queries
  {
    match: (query) => query?.includes('menus') && !query?.includes('pages'),
    resolve: () => ({ menus: [] }),
  },

  // Page queries
  {
    match: (query) => query?.includes('pages'),
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
