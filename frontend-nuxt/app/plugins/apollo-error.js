/*
  Make Apollo errors loud.

  @nuxtjs/apollo's useAsyncQuery swallows GraphQL/network errors — it just returns
  `{ data: null }`, so a failed query (a validation error from a missing field, or a
  relation that degraded because Public read isn't granted) renders a blank page with
  nothing in the browser console (it only sees the hydrated empty result) and nothing
  in the server logs.

  The module fires an `apollo:error` hook on every error. Logging it here surfaces the
  real cause: during SSR it prints to the server (cf logs onrr-frontend), and on the
  client it prints to the browser console.
*/
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('apollo:error', (err) => {
    const op = err?.operation?.operationName || 'unknown'
    const where = import.meta.server ? 'SSR' : 'client'

    for (const e of err?.graphQLErrors ?? []) {
      // eslint-disable-next-line no-console
      console.error(`[apollo:${where}] GraphQL error in "${op}": ${e.message}`)
    }
    if (err?.networkError) {
      // eslint-disable-next-line no-console
      console.error(`[apollo:${where}] Network error in "${op}":`, err.networkError.message || err.networkError)
    }
  })
})
