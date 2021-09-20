<template>
  <div>
    <label v-if="$apollo.loading" text=""></label>
    <nav id="main-menu" class="primary" v-else>
      <ul>
        <li v-for="item in menuItems" :key="item.key.id">
          <v-menu 
            offset-y
            open-on-hover>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="white"
                text
                dark
                v-bind="attrs"
                v-on="on"
                v-on:hover="getChildItems(item.key.id)"
                v-on:click="onClick($event.target.innerText); getChildItems(item.key.id)"
                class="menu-btn"
              >
                  {{ item.key.menu_label }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item :to="item.key.link_to_page.url" class="menu-btn">
                {{ `${ item.key.menu_label } Home` }}
              </v-list-item>
              <v-list-item
                v-for="child in item.data"
                :key="child.id"
                :to="`${ child.link_to_page.url  }`"
                class="menu-btn"
              >
                  {{ child.menu_label }}
              </v-list-item>
            </v-list>
          </v-menu>
        </li>
        <li>
          <v-text-field
            solo-inverted
            dense
            label="Search"
            prepend-inner-icon="mdi-magnify"
            class="search-input">
          </v-text-field>
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
      menu_items: [],
      items: [],
    }
  },
  apollo: {
    menu_items: {
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
    getChildItems: function (parentId) {
      const i = []
      const childItems = this.menu_items && this.menu_items.filter(item => item.menu === 'main' && item.parent !== null && item.parent.id === parentId)
      childItems.forEach(item => i.push(item))
      this.items = i
    }
  },
  computed: {
    menuItems() {
      const mItems = []
      if (this.menu_items) {
        const childItems = this.menu_items.filter(item => item.menu === 'main' && item.parent !== null)
        this.menu_items.filter(item => item.menu === 'main').map(item => {
          if (item.parent === null) {
            mItems.push({ key: item, data: [...childItems.filter(child => child.parent.id === item.id)] })
          }
        }) 
      }
      
      return mItems
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
</style>
