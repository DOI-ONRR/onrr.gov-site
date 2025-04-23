<template>
  <v-app>
    <AppToolbar />
    <v-main>
      <router-view :key="$route.path" />
    </v-main>
    <site-feedback :key="feedbackKey" :feedback-form-key="feedbackKey" />
    <Footer />
  </v-app>
</template>

<script>
// @ is an alias to /src
import AppToolbar from '@/components/toolbars/AppToolbar'
import Footer from '@/components/navigation/Footer'
import SiteFeedback from './components/sections/SiteFeedback';

export default {
  name: 'App',
  metaInfo() {
    return {
      // if no subcompoents specify a metaInfo.title, this title will be used
      title: 'Office of Natural Resources Revenue',
      // all page titles will be injected into this template
      titleTemplate: '%s | Office of Natural Resources Revenue',
      meta: [
        { property: 'og:site_name', content: 'Office of Natural Resources Revenue' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index,follow' },
        { name: 'description', content: 'ONRR.gov helps industry report and pay royalties for energy and natural resources on federal and tribal lands. It provides tools, guidance, and resources to ensure compliance with regulations.' }
      ]
    }
    
  },
  components: {
    AppToolbar,
    Footer,
    SiteFeedback
  },

  data: function() {
    return {
      feedbackKey: 0
    }
  },
  methods: {
    reloadSiteFeedback() {
      this.feedbackKey += 1;
    }
  },
  watch: {
    $route: function(newVal, oldVal) {
      if (oldVal.path === "/" && oldVal.name == null) {
        return;
      }
      this.reloadSiteFeedback();
    }
  }
};
</script>


<style>
/* shared table styles */
@import '@/scss/tables.scss';
@import '@/scss/onrr.scss';

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

.theme--light.v-breadcrumbs .v-breadcrumbs__divider {
  color: #767676 !important; 
}

.v-icon.mdi-file-pdf-box {
  font-size: 28px;
}

/* editorjs tool icons */
.v-icon.mdi-file-pdf-box,
.v-icon.mdi-file-powerpoint-box,
.v-icon.mdi-file-excel-box,
.v-icon.mdi-file-word-box,
.v-icon.mdi-text-box {
  color: var(--v-secondary-base) !important;
}

.ce-link-inline__link-button {
  background-color: var(--v-secondary-base) !important;
  border-color: var(--v-secondary-base) !important;
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 500;
  letter-spacing: .0892857143em;
  justify-content: center;
  outline: 0;
  position: relative;
  text-decoration: none;
  text-indent: 0.0892857143em;
  text-transform: "inherit";
  transition-duration: .28s;
  transition-property: box-shadow,transform,opacity;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  color: white !important;
  height: 36px;
  min-width: 64px;
  padding: 0 16px;
  font-size: .85rem;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
}

/* dont display icon div next to button, creates weird flex alignment when targeting divs */
.ce-link-inline__link-button +  .v-list-item__icon {
  display: none;
}

.v-list-item__icon {
  display: inline-block;
  margin: 0;
}

.v-list-item__icon > .icon {
  position: relative;
  top: 4px;
}

.container .v-tabs i.v-icon.v-icon {
  color: var(--v-secondary-base);
}
</style>
