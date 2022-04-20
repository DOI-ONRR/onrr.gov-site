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
#app .home-content a:visited,
#app .page-wrap a:visited {
  color: var(--v-primary-base);
}

#app .page-wrap .v-breadcrumbs a:visited {
  color: var(--v-secondary-base);
}

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

.v-icon.mdi-file-pdf-box {
  font-size: 28px;
}

/* editorjs tool icons */
.v-icon.mdi-file-pdf-box,
.v-icon.mdi-file-powerpoint-box,
.v-icon.mdi-file-excel-box,
.v-icon.mdi-file-word-box,
.v-icon.mdi-file-powerpoint-box,
.v-icon.mdi-text-box {
  color: var(--v-secondary-base) !important;
}

.ce-link-inline__link-button {
  font: bold 11px Arial;
  text-decoration: none;
  background-color: #EEEEEE;
  color: #333333;
  padding: 2px 6px 2px 6px;
  border-top: 1px solid #CCCCCC;
  border-right: 1px solid #333333;
  border-bottom: 1px solid #333333;
  border-left: 1px solid #CCCCCC;
}

</style>