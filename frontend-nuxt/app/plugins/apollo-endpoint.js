import { NuxtApollo } from '#apollo'

/*
  Runtime GraphQL endpoint.

  @nuxtjs/apollo bakes each client's `httpEndpoint` at BUILD time (from the generated
  `#apollo` config), so the GraphQL URL can't change without a full rebuild (`cf restage`)
  and can drift from the REST/asset calls, which use `runtimeConfig`.

  The module's runtime plugin reads `NuxtApollo.clients.*.httpEndpoint` when it constructs
  each client. This `pre` plugin runs first and rewrites that endpoint from the RUNTIME
  `apiUrl`, so GraphQL and REST share one source of truth (`NUXT_PUBLIC_API_URL`) — changing
  the CMS host is then just `cf set-env NUXT_PUBLIC_API_URL … && cf restart`, no rebuild.
*/
export default defineNuxtPlugin({
  name: 'apollo-runtime-endpoint',
  enforce: 'pre',
  setup() {
    const apiUrl = useRuntimeConfig().public.apiUrl
    const client = NuxtApollo?.clients?.default
    if (apiUrl && client) {
      const endpoint = `${apiUrl}/graphql`
      client.httpEndpoint = endpoint
      if (client.browserHttpEndpoint) client.browserHttpEndpoint = endpoint
    }
  },
})
