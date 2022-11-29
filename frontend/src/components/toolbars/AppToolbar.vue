<template>
  <div>
    <v-system-bar
      app
      height="30"
      class="system-bar"
      :class="{ 'hidden-system-bar': !showSystemBar }">
      <div class="banner-wrap">
        <v-img
        alt="U.S. Flag"
        class="shrink mr-2"
        contain
        src="../../assets/images/icons/us-flag-small.png"
        transition="scale-transition"
        width="20"
      />
        An official website of the U.S. government
      </div>
    </v-system-bar>
    <v-app-bar
      app
      color="primary darken-1"
      dark
      :height="`${ showSystemBar ? '80px' : '60px' }`"
      class="v-app-bar-wrap"
      :class="{ 'hidden-system-bar': !showSystemBar }"
    >
        <div class="d-flex logo">
          <router-link to="/">
            <v-img
              alt="Office of Natural Resources and Revenue (ONRR) Logo"
              class="logo shrink mr-2"
              contain
              src="../../assets/images/logos/ONRR-mark-200x200.png"
              transition="scale-transition"
            />
            </router-link>
            <router-link to="/">
            <v-toolbar-title>
              <div class="logo-content">
                <span>U.S. Department of the Interior</span>
                <span>Office of Natural</span>
                <span>Resources Revenue (ONRR)</span>
              </div>
            </v-toolbar-title>
            </router-link>
          
        </div>

        <v-spacer></v-spacer>

        <!-- Header Menu -->
        <HeaderMenu></HeaderMenu>

        <!-- Mobile Menu -->
        <div class="d-lg-none">
          <v-app-bar-nav-icon aria-label = 'Mobile menu' op="drawer = !drawer"></v-app-bar-nav-icon>
        </div>

        <template v-slot:extension v-if="!isMobile">
          <div class="d-none d-lg-block">
            <MainMenu />
          </div>
        </template>
    </v-app-bar>
    <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    right
    dark>
      <v-list dense>
        <v-subheader>Menu</v-subheader>
        <v-list-item-group>
          <v-list-item
            to="/">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="item in menuItems"
            :key="item.id"
            :to="`${ item.custom_url || item.link_to_page.url }`"
          >
              <v-list-item-title 
                v-text="item.menu_label"></v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <hr />
      <v-list dense>
        <v-list-item-group>
          <v-list-item
            to="/search-results"
          >
            <v-list-item-icon>
              <v-icon>mdi-magnify</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Search</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="item in utilityItems"
            :key="item.id"
            :to="`${ item.custom_url || item.link_to_page.url }`"
          >
            <v-list-item-icon>
              <v-icon v-text="item.menu_icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-title 
              v-text="item.menu_label"></v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-btn
      color="primary"
      dark
      fab
      fixed
      bottom
      left
      elevation="2"
      v-scroll="onScroll"
      v-show="fab"
      @click="toTop">
      <v-icon color="white">mdi-chevron-up</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { MENU_QUERY } from '@/graphql/queries'
import HeaderMenu from '@/components/navigation/HeaderMenu'
import MainMenu from '@/components/navigation/MainMenu'

const OFFSET = 30
const FAB_OFFSET = 150

export default {
  name: 'AppToolbar',
  data () {
    return {
      showSystemBar: true, 
      lastScrollPosition: 0,
      scrollValue: 0,
      drawer: false,
      group: null,
      isMobile: false,
      fab: false,
      menus: []
    }
  },
  apollo: {
    menus: {
      query: MENU_QUERY,
      loadingKey: 'loading...',
    }
  },
  components: {
    HeaderMenu,
    MainMenu
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)

    if (typeof window === 'undefined') return

    window.removeEventListener('resize', this.onResize, { passive: true })
  },
  mounted () {
    this.lastScrollPosition = window.pageYOffset
    window.addEventListener('scroll', this.onScroll)
    const viewportMeta = document.createElement('meta')
    viewportMeta.name = 'viewport'
    viewportMeta.content = 'width=device-width, initial-scale=1'
    document.head.appendChild(viewportMeta)

    // resize
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  watch: {
    group () {
      this.drawer = false
    },
  },
  methods: {
    toggleTheme () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    },
    onScroll (e) {
      if (typeof window === 'undefined') return

      const top = window.pageYOffset || e.target.scrollTop || 0
      this.fab = top > FAB_OFFSET

      if (window.pageYOffset < 0) {
        return
      }
      if (Math.abs(window.pageYOffset - this.lastScrollPosition) < OFFSET) {
        return
      }
      this.showSystemBar = window.pageYOffset < this.lastScrollPosition
      this.lastScrollPosition = window.pageYOffset
    },
    toTop () {
      this.$vuetify.goTo(0)
    },
    onResize () {
      // console.log('window.innerWidth------------>', window.innerWidth)
      // isMobile vuetify lg size
      this.isMobile = window.innerWidth < 1264
    }
  },
  computed: {
    menuItems() {
      return this.menus.filter(item => item.menu === 'main')
    },
    utilityItems() {
      return this.menus.filter(item => item.menu === 'header')
    },
    height () {
      switch (this.$vuetify.breakpoint.name) {
        case 'lg': return 50
        default: return 50
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '~/vuetify/src/styles/styles.sass';

@media #{map-get($display-breakpoints, 'md-and-down')} {
  .logo {
    transform: scale(0.85, .85);
    transition: 0.1s all ease-out;
    align-items: center;
    position: relative;
    left: -60px;
  }
}

@media #{map-get($display-breakpoints, 'sm-and-down')} {
  .logo {
    transform: scale(.65, .65);
    transition: 0.1s all ease-out;
    align-items: center;
    position: relative;
    left: -40px;
  }
}


.logo {
  width: 60px;
  align-items: center;
  a {
    text-decoration: none;
    color: white;
  }
  .v-toolbar__title {
    position: relative;
    top: -2px;
    margin-left: 5px;
  }
}

.logo-content {
  position: relative;
  top: -10px;

  span {
    display: block;
  }

  span:first-child {
    font-size: .80rem;
    top: 24px;
    position: relative;
  }

  span:nth-child(2) {
    font-size: 1.5rem; 
    top: 16px;
    position: relative;
  }

  span:last-child {
    font-size: 1.5rem; 
    top: 4px;
    position: relative;
  }
}

.banner-wrap {
  text-align: center;
  color: white;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 30px;
}

.system-bar {
  transform: translate3d(0, 0, 0);
  transition: 0.1s all ease-out;
  width: 100vw;
  background-color: var(--v-neutrals-base) !important;
}

.system-bar.hidden-system-bar {
  height: 0;
  transition: height .1 ease;
}

.v-app-bar-wrap {
  transition: 0.1s all ease-out;
  width: 100vw;
}

.v-app-bar-wrap.hidden-system-bar {
  margin-top: 0 !important;
  transition: height .1s ease;

  .logo {
    width: 45px;
  }

  .logo-content {
  position: relative;
  top: -10px;

  span {
    display: block;
  }

  span:first-child {
    font-size: .70rem;
    top: 24px;
    position: relative;
  }

  span:nth-child(2) {
    font-size: 1.2rem; 
    top: 16px;
    position: relative;
  }

  span:last-child {
    font-size: 1.2rem; 
    top: 5px;
    position: relative;
  }
}
}

.main-menu {
  padding: 0;
  width: 100vw;
}

.child-item {
  padding-left: 24px;
}

.v-list--dense .v-list-item .v-list-item__title {
  font-size: 1rem;
  line-height: 1.2rem;
}

.v-list--dense .v-list-item .v-list-item__icon {
  margin-top: 6px;
  margin-right: 16px;
}

</style>