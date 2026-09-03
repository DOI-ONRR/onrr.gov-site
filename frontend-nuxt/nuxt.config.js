// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxtjs/apollo',
  ],

  apollo: {
    clients: {
      default: {
        // Build-time default only. The effective endpoint is set at RUNTIME from
        // runtimeConfig.public.apiUrl by app/plugins/apollo-endpoint.js, so it shares
        // one source (NUXT_PUBLIC_API_URL) with the REST/asset calls and needs no rebuild.
        httpEndpoint: (process.env.NUXT_PUBLIC_API_URL || 'https://preview-onrr-cms.app.cloud.gov') + '/graphql',
      },
    },
  },

  css: [
    '@/assets/scss/styles.scss',
  ],

  vite: {
    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          api: 'legacy',
          loadPaths: [
            'node_modules/@uswds/uswds/packages',
            'app/assets/scss',
          ],
          silenceDeprecations: ['legacy-js-api'],
        },
      },
      preprocessor: 'sass',
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8056',
      // Public data API base (the data.onrr.gov subdomain), used by the /developers docs
      // for the documented base URL and the "Run" example links. Override per-env with
      // NUXT_PUBLIC_DATA_API_BASE if the subdomain differs before DNS is live.
      dataApiBase: process.env.NUXT_PUBLIC_DATA_API_BASE || 'https://data.onrr.gov',
    },
  },
})
