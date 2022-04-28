const targetUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8055'

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: (config) => {
   config.module.rules.delete('svg')
   config.module.rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },
  devServer: {
    // proxy: targetUrl
    proxy: {
      '^/graphql': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
      '^/assets': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
      '^/document': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
      '^/items/NYMEX': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
      '^/press-releases': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
      '^/reporter-letters': {
        target: targetUrl,
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
      },
    }
  }
}
