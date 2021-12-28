<template>
  <div class="side-menu-wrap" ref="sideMenu">
    <v-list class="pa-0">
      <v-list-item-group
        color="primary">
        <v-list-item 
          link
          exact
          :to="`${ parentUrl }`">
               {{ `${ parentTitle } Home` }}
        </v-list-item>
        <div v-for="item in sideMenuItems" :key="item.id">
        <v-list-item 
          link
          active-class="active"
          v-for="cItem in item.menu_children" 
          :key="cItem.id"
          :to="`${ cItem.pages_id.url }`">
              {{ cItem.pages_id.title }}
        </v-list-item>
        </div>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import { MENU_QUERY, PAGES_QUERY } from '@/graphql/queries'

export default {
  name: 'SideMenu',
  data () {
    return {
      menus: [],
      pages: [],
      parentTitle: null,
      parentSlug: null,
    }
  },
  apollo: {
    menus: {
      query: MENU_QUERY,
      loadingKey: 'loading...'
    },
    pages: {
      query: PAGES_QUERY,
      loadingKey: 'loading...',
      result ({ data }) {
        if (data) {
          return data.pages
        }
      }
    },
  },
  created() {
    this.getParentSlug()
    this.getParentPageTitleBySlug()
  },
  methods: {
    getParentSlug () {
      const fullPath = this.$route.fullPath

      // get first segement of full url path
      fullPath.indexOf(1)
      fullPath.toLowerCase()
      const path = fullPath.split('/')[1]
      this.parentSlug = path
    },
    getParentPageTitleBySlug () {
      const page = this.pages.find(page => page.slug === this.parentSlug)
      this.parentTitle = page.title
      this.parentUrl = page.url
    },
  },
  computed: {
    sideMenuItems() {
      return this.menus.filter(item => item.menu === 'main' && item.link_to_page.slug === this.parentSlug)
    }
  }
}
</script>

<style lang="scss" scoped>
.side-menu-wrap {
  margin-top: 24px;
}

.side-menu-wrap .v-list.v-sheet{
  background-color: var(--v-neutrals-lighten2);
}
.v-subheader {
  font-size: 16px;
}
a {
  text-decoration: none;
}
a.router-link-active {
  font-weight: bold;
  color: rgb(185, 208, 226);
}

.theme--light.v-list-item--active::before {
    opacity: 0;
}

.v-list-item-group .v-list-item {
  padding-top: 4px;
  padding-bottom: 4px;
}

.v-list-item-group .v-list-item--active {
  border-left: 4px solid var(--v-yellow-lighten1);
  color: black;
  background-color: white;
  font-weight: bold;
}
</style>

