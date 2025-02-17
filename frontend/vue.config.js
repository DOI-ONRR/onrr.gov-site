const path = require('path');
const targetUrl =
  process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8055'
const SITE = process.env.SITE
module.exports = {
  configureWebpack: {
    ignoreWarnings: [
      (warning) => /division\s+outside\s+of\s+calc/.test(warning.message),
    ],
    stats: 'errors-only',
  },
  css: {
    loaderOptions: {
      scss: {
        sassOptions: {
          includePaths: [
            path.resolve(__dirname, './node_modules/@uswds/uswds/packages')
          ]
        }
      }
    }
  },
  transpileDependencies: ['vuetify'],

  devServer: {
    // proxy: targetUrl
    proxy: {
      '^/graphql': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/assets': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/document': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/items/NYMEX': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/press-releases': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/reporter-letters': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      },
      '^/unbundling': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug'
      }
    }
  }
}
