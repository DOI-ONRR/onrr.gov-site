import Vue from 'vue'
import router from './router'
import VueApollo from 'vue-apollo'
import ApolloClient from 'apollo-boost'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import introspectionQueryResultData from './json/possibleTypes.json'


const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
})

const cache = new InMemoryCache({
  fragmentMatcher
})

// console.log('cache yo ------> ', cache)

const apolloClient = new ApolloClient({
  fetch: fetch,
  uri: `${ process.env.VUE_APP_API_URL }/graphql`,
  cache
})

const clientA = new ApolloClient({
  fetch: fetch,
  uri: `${ process.env.VUE_APP_API_URL }/graphql/system`,
  cache
})

const clientB = new ApolloClient({
  fetch: fetch,
  uri: `${ process.env.VUE_APP_NRRD_API_URL }/v1/graphql`,
  cache
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  clients: {
    a: clientA,
    b: clientB
  },
})

Vue.config.productionTip = false
Vue.use(VueApollo)

new Vue({
  vuetify,
  apolloProvider,
  router,
  render: h => h(App)
}).$mount('#app')
