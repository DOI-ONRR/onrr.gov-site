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
        httpEndpoint: (process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8056') + '/graphql',
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
    },
  },
})
