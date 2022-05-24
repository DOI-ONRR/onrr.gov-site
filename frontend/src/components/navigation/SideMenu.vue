<template>
  <div class="side-menu-wrap" ref="sideMenu">
    <v-list class="pa-0" v-if="!isMobile">
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
    <div v-if="isMobile" class="side-menu-mobile">
      <v-list>
        <v-list-group
          v-for="item in sideMenuItems"
          :key="item.id"
          v-model="item.active"
          no-action
          :to="`${ parentUrl }`"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title
                
                v-text="`${ parentTitle } Home`"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="cItem in item.menu_children"
            :key="cItem.id"
            :to="`${ cItem.pages_id.url }`"
          >
            <v-list-item-content>
              <v-list-item-title
                v-text="cItem.pages_id.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </div>
  </div>
</template>

<script>
import { MENU_QUERY, PAGES_QUERY } from '@/graphql/queries'
import { mobileMixin } from '@/mixins'

export default {
  name: 'SideMenu',
  mixins: [mobileMixin],
  data () {
    return {
      menus: [],
      pages: [],
      parentTitle: null,
      parentSlug: null,
      isMobile: false
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

.v-list-item-group .v-list-item--active,
.side-menu-mobile .v-list-item--active {
  border-left: 4px solid var(--v-yellow-lighten1);
  color: black;
  background-color: white;
  font-weight: bold;
}

.v-application--is-ltr .v-list-group--no-action > .v-list-group__items > .v-list-item {
  padding-left: 16px;
}

.side-menu-mobile {
  margin-bottom: 32px;
}

.side-menu-mobile .v-list {
  padding: 0;
}

.v-list-group .v-list-group__header .v-list-item__icon.v-list-group__header__append-icon {
  min-width: inherit;
}
</style>

