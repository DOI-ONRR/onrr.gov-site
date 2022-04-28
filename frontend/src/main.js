import Vue from 'vue'
import VueMeta from 'vue-meta'
import router from './router'
import VueApollo from 'vue-apollo'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import fetch from 'node-fetch'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import possibleTypes from './json/possibleTypes.json'

const cache = new InMemoryCache({
  possibleTypes
})

const clientHttpLink = createHttpLink({
  uri: `${ process.env.VUE_APP_API_URL }/graphql`,
})

const clientAHttpLink = createHttpLink({
  uri: `${ process.env.VUE_APP_API_URL }/graphql/system`,
})

const clientBHttpLink = createHttpLink({
  uri: `${ process.env.VUE_APP_NRRD_API_URL }/v1/graphql`,
})

// console.log('cache yo ------> ', cache)

export const apolloClient = new ApolloClient({
  fetch: fetch,
  link: clientHttpLink,
  cache,
  resolvers: {},
})

const clientA = new ApolloClient({
  fetch: fetch,
  link: clientAHttpLink,
  cache,
  resolvers: {},
})

const clientB = new ApolloClient({
  fetch: fetch,
  link: clientBHttpLink,
  cache,
  resolvers: {},
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
Vue.use(VueMeta)

new Vue({
  vuetify,
  apolloProvider,
  router,
  render: h => h(App)
}).$mount('#app')

