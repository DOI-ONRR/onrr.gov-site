<template>
  <v-app>
    <AppToolbar />
    <v-main>
      <router-view :key="$route.path" />
      <!-- <router-view name="TwoColumnLeft" /> -->
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
// @ is an alias to /src
import AppToolbar from '@/components/toolbars/AppToolbar'
import Footer from '@/components/navigation/Footer'

export default {
  name: 'App',
  metaInfo() {
    return {
      // if no subcompoents specify a metaInfo.title, this title will be used
      title: 'Office of Natural Resources Revenue',
      // all page titles will be injected into this template
      titleTemplate: '%s | Office of Natual Resources Revenue',
      meta: [
        { property: 'og:site_name', content: 'Office of Natural Resources Revenue' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index,follow' }
      ]
    }
    
  },
  components: {
    AppToolbar,
    Footer
  },

  data: () => ({
    //
  }),
  created() {
    // console.log('this.$route.fullPath --------------------> ', this.$route.fullPath)
  }
};
</script>


<style>
#app {}

.v-toolbar__extension {
  margin-left: 0;
  margin-right: 0;
  padding: 0 !important;
  top: 5px;
}

.theme--light.v-breadcrumbs .v-breadcrumbs__item--disabled {
  font-weight: bold;
  color: black !important; 
  /* shouldn't have to do this, need to figure out correct method https://vuetifyjs.com/en/api/v-breadcrumbs/ */
}

</style>