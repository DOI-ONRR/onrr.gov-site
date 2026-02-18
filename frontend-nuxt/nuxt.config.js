// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/apollo',
  ],

  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8056/graphql',
      },
    },
  },

  css: [
    '@/assets/scss/styles.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [
            'node_modules/@uswds/uswds/packages',
          ],
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8056',
    },
  },
})
