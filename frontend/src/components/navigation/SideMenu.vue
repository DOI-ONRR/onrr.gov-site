<template>
  <div class="side-menu-wrap">
    <v-list>
      <v-subheader>{{ `${ parentTitle } Home` }}</v-subheader>
      <v-list-item-group
        color="primary" v-for="item in menuItems" :key="item.key.id">
        <v-list-item v-for="cItem in item.data" :key="cItem.id">
          <v-list-item-content>
            <router-link :to="`/${ item.key.link_to_page.slug }/${ cItem.link_to_page.slug }`">
              {{ cItem.menu_label }}
            </router-link>  
          </v-list-item-content>
        </v-list-item>
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
  // props: {
  //   menuId: {
  //     type: String,
  //     required: true
  //   },
  //   menuHeader: {
  //     type: String,
  //   },
  //   menuSlug: {
  //     type: String
  //   }
  // },
  created () {
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
  }
}
</script>

<style lang="scss" scoped>
a.router-link-active {
  font-weight: bold;
  color: rgb(6, 33, 53);
}
</style>

