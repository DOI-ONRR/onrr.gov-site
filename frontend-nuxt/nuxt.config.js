import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/sitemap',
  ],

  // Canonical site URL + name for the sitemap (and any future SEO tags). Production is
  // onrr.gov; override the URL per-env with NUXT_PUBLIC_SITE_URL (e.g. the preview host).
  // `name` titles the sitemap's human-readable XSL view — without it the header renders
  // the literal "undefined".
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://onrr.gov',
    name: 'Office of Natural Resources Revenue (ONRR)',
  },

  sitemap: {
    // The page URLs come from the CMS at request time via this server route (published
    // pages only, per the public read policy) — see server/api/__sitemap__/urls.js. The
    // module still auto-discovers the static file-based routes (/, /developers, …) and
    // merges them in; the catch-all [...slug] can't be auto-enumerated, which is exactly
    // what this source supplies. Search.gov crawls /sitemap.xml to index the site.
    sources: ['/api/__sitemap__/urls'],
    // Keep out of the XML sitemap: the error page (auto-discovered from the app routes)
    // and the human-facing HTML site map page (a CMS page at /site-map). `exclude` applies
    // to URLs from every source, including the CMS one above.
    exclude: ['/404', '/site-map'],
  },

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
    // Browser bundle only: replace postcss (pulled in by sanitize-html) with a
    // stub; see stubs/postcss-client.js.
    $client: {
      resolve: {
        alias: {
          postcss: fileURLToPath(new URL('./stubs/postcss-client.js', import.meta.url)),
        },
      },
    },
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
