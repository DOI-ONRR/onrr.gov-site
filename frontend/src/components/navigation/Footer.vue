<template>
  <v-footer
    padless
    class="footer">
    <v-toolbar 
      tag="div"
      dense
      elevation="0"
      class="top">
      <v-toolbar-items>
        <v-btn
          v-for="item in menuItemsTop"
          :key="item.id"
          :to="item.link_to_page && item.link_to_page.url"
          :href="item.custom_url && item.custom_url"
          :target="`${ item.custom_url ? '_blank' : '_self' }`"
          plain
          color="white">
          {{ item.menu_label }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-toolbar
      dense
      elevation="0"
      tag="div"
      class="bottom">
      <v-toolbar-items>
        <v-btn
          v-for="item in menuItemsBottom"
          :key="item.id"
          :to="item.link_to_page && item.link_to_page.url"
          :href="item.custom_url && item.custom_url"
          :target="`${ item.custom_url ? '_blank' : '_self' }`"
          plain
          color="white">
          {{ item.menu_label }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-toolbar
      tag="div"
      height="120px"
      elevation="0"
      class="abs-bottom">
      <v-toolbar-title>
        <div class="footer-logo-wrap">
          <router-link to="/">
            <v-img
              alt="ONNR Logo"
              class="shrink mr-2"
              contain
              src="../../assets/images/logos/ONRR-mark-200x200.png"
              transition="scale-transition"
              width="70"
            />
          </router-link>
          <router-link to="/">
            <div class="logo-content">
              <span>U.S. Department of the Interior</span>
              <span>Office of Natural Resources Revenue (ONRR)</span>
              <span>PO Box 25165</span>
              <span>Denver, CO 80225-0165</span>
            </div>
          </router-link>
        </div>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items
      class="social-menu">
        <v-btn
          v-for="item in socialMenuItems"
          :key="item.id"
          :to="item.link_to_page && item.link_to_page.url"	
          :href="item.custom_url && item.custom_url"
          text
          dark
          :target="`${ item.custom_url ? '_blank' : '_self' }`"
          class="no-btn-hover"
          :aria-label="`${item.menu_label} link`"
          >
          <span class="v-btn__content">
            <v-icon color="white" v-if="item.menu_icon">{{ item.menu_icon }}</v-icon>
            <span class="mr-2" v-if="item.menu_label === 'Contacts'" style="color: white;">{{ item.menu_label }}</span>
          </span>
        </v-btn> 
      </v-toolbar-items>
    </v-toolbar>
  </v-footer>
</template>

<script>
import { MENU_QUERY } from '@/graphql/queries'
export default {
  name: 'FooterNav',
  data() {
    return {
      menus: []
    }
  },
  apollo: {
    menus: {
      query: MENU_QUERY,
      loadingKey: 'loading...'
    }
  },
  computed: {
    menuItemsTop: function () {
      const fItems = this.menus.filter(item => item.menu === 'footer')
      return fItems.filter((item, index) => index < 5)
    },
    menuItemsBottom: function () {
      const fItems = this.menus.filter(item => item.menu === 'footer')
      return fItems.filter((item, index) => index > 4)
    },
    socialMenuItems: function () {
      return this.menus.filter(item => item.menu === 'social')
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 50px;
  overflow: hidden;

  a {
    text-decoration: none;
  }
}

.footer .top {
  background-color: var(--v-neutrals-lighten1);
  padding: 0;
}

.footer .bottom {
  background-color: var(--v-neutrals-lighten1);
  padding: 0;
}

.footer .abs-bottom {
  background-color: var(--v-neutrals-base);
  padding: 0;
  width: 100%;

  a {
    color: white;
  }
}

.footer-logo-wrap {
  display: flex;
  justify-content: flex-start;
}

.footer-logo-wrap .logo-content {
  position: relative;
  top: -10px;

  span {
    display: block;
    font-size: .80rem;
  }

  span:first-child {
    top: 8px;
    position: relative;
  }

  span:nth-child(2) {
    font-size: 1.5rem; 
    top: 4px;
    position: relative;
  }
  span:last-child { 
    top: -6px;
    position: relative;
  }
}

.social-menu {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 50px;
}

.social-menu::after {
  content: '';
  flex: auto;
}

.social-menu .v-btn {
  height: 50px !important;
}

.social-menu .v-btn:last-child {
  margin-top: 6px;
}

.v-btn__content {
  flex-direction: column;
}

.no-btn-hover {
  text-transform: none;
}

.no-btn-hover::before {
  background-color: transparent !important;
}

</style>
