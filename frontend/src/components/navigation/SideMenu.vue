<template>
  <div class="side-menu-wrap" ref="sideMenu">
    <v-list class="pa-0">
      <v-list-item-group
        color="primary">
        <v-list-item 
          link
          active-class="active"
          :to="`${ parentSlug }`">
               {{ `${ parentTitle } Home` }}
        </v-list-item>
        <div v-for="item in menuItems" :key="item.key.id">
        <v-list-item 
          link
          active-class="active"
          v-for="cItem in item.data" 
          :key="cItem.id"
          :to="`${ cItem.link_to_page.url }`">
          
              {{ cItem.menu_label }}

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
      menuItems: [],
      pages: [],
      parentTitle: null,
      parentSlug: null,
    }
  },
  apollo: {
    menu_items: {
      query: MENU_QUERY,
      loadingKey: 'loading...',
      result({ data }) {
        const mItems = []
        if (data) {
          const childItems = data.menu_items.filter(item => 
          item.menu === 'main' && item.parent !== null && item.parent.link_to_page.slug === this.parentSlug)
          data.menu_items.filter(item => item.menu === 'main').map(item => {
            if (item.parent === null) {
              mItems.push({ key: item, data: [...childItems.filter(child => child.parent.id === item.id) ] })
            }
          }) 
        }
        
        this.menuItems = mItems
      }
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
    },
    parentUrl () {
      const page = this.page.find(page => page.slug === this.parentSlug)
      this.parentSlug = page.url
    },
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

