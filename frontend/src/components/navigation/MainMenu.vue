<template>
  <div>
    <label v-if="$apollo.loading" text=""></label>
    <nav id="main-menu" class="primary" v-else>
        <ul>
        <li v-for="item in menuItems" :key="item.id">

<v-menu
            open-on-hover
            offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="white"
                text
                dark
                v-bind="attrs"
                v-on="on"
                class="menu-btn"
             >
             <v-list-item-content>
              <v-list-item-title
            :id="attrs['aria-labelledby']"
            v-text="item.menu_label"
          >
             </v-list-item-title> 
            </v-list-item-content>
          </v-btn>
  </template>
          <v-list>
              <v-list-item :to="item.link_to_page.url" class="menu-btn">
                {{ `${ item.menu_label } Home` }}
              </v-list-item>
              <v-list-item
                v-for="(child, i) in item.menu_children"
                :key="i"
                link
                :to="`${ child.pages_id.url  }`"
                class="menu-btn"
              >
                  {{ child.pages_id.title }}
              </v-list-item>
            </v-list>
          </v-menu>
        </li>
        <li>
  <form id="search_form" action="https://search.usa.gov/search" accept-charset="UTF-8" method="get">

    <input type="hidden" name="affiliate" id="affiliate" value="onrr.gov" autocomplete="off" />
    <label for="query">Enter Search Term(s):</label>
    <input type="text" name="query" id="query" autocomplete="off" class="usagov-search-autocomplete" />
    <input type="submit" name="commit" value="Search" data-disable-with="Search" />
  </form>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { MENU_QUERY } from '@/graphql/queries'

export default {
  name: 'MainMenu',
  data () {
    return {
      menus: [],
      cItems: []
    }
  },
  apollo: {
    menus: {
      query: MENU_QUERY,
      loadingKey: 'loading...'
    }
  },
  methods: {
    onClick: function (event) {
      if (event) {
        console.debug(`You clicked ${ event }`)
      }
    },
    childItems(parentId) {
      this.cItems = this.menus && this.menus.filter(item => item.id === parentId)[0].menu_children
    },
  },
  computed: {
    menuItems() {
      return this.menus.filter(item => item.menu === 'main')
    },
    
  }
}
</script>

<style lang="scss" scoped>
#main-menu {
  width: 100%;
  margin: 0 auto;
  position: absolute;
  bottom: 0;
  height: 50px;
}
#main-menu ul {
  list-style: none;
  display: flex;
  justify-content: space-between;
  margin: 0 16px;
  padding: 0;
  align-items: center;
  height: 50px;
}
#main-menu a {
  color: white;
  display: inline-block;
  text-decoration: none;
  height: 50px;
  line-height: 50px;
  text-transform: uppercase;
}

#main-menu li:last-child {
  padding-top: 24px;
}

.menu-btn {
  text-transform: none;
}

.search-input .v-icon {
  color: white !important;
}

.search-input.v-input--is-focused .v-icon {
  color: var(--v-secondary-base) !important;
}
</style>
