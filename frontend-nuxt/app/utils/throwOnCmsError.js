// A failed CMS query — a network error or a 5xx from Directus, as opposed to a successful
// query that simply returned no rows — should surface as a 503 "service unavailable" via
// app/error.vue, not a blank page (dedicated routes) or a misleading 404 (the catch-all).
//
// Pass the `error` ref from useAsyncQuery/useAsyncData and call it right after awaiting the
// query, before any empty-result handling. Throwing here renders the error page with a
// 503 HTTP status on SSR so clients and crawlers see the outage for what it is.
export function throwOnCmsError(error) {
  if (error?.value) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service temporarily unavailable',
      fatal: true,
    })
  }
}
