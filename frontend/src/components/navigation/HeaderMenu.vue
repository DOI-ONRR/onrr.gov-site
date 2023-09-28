<template>
  <div class="d-none d-lg-block header-menu">
    <v-btn
      v-for="item in menuItems"
      :key="item.id"
      :to="item.link_to_page && item.link_to_page.url"
      :href="item.custom_url && item.custom_url"
      text
      dark
      class="no-btn-hover"
      :target="item.custom_url && item.custom_url ? '_blank' : '_self'"
    >
      <span class="v-btn__content-btn" v-if="item.menu_label === 'Revenue Data'">
        <v-btn
          class="mb-1"
          color="primary"
          :target="_blank"
        >
          <v-icon color="white" v-if="item.menu_icon" class="mr-1">{{ item.menu_icon }}</v-icon>
          <span class="mr-2" v-if="item.menu_label">{{ item.menu_label }}</span>
        </v-btn>
      </span>

      <span class="v-btn__content" v-else>
        <v-icon color="white" v-if="item.menu_icon" class="mr-1">{{ item.menu_icon }}</v-icon>
        <span class="mr-2" v-if="item.menu_label">{{ item.menu_label }}</span>
      </span>

    </v-btn>
    <v-btn
      v-if="hostname === 'localhost' || hostname === '192.168.0.22'"
      plain>
      <v-switch
        v-model="themeSwitch"
        flat
        color="anchor"
        label="">
      </v-switch>
    </v-btn>
  </div>
</template>

<script>
import { MENU_QUERY } from '@/graphql/queries'
export default {
  name: 'HeaderMenu',
  data () {
    return {
      hostname: location.hostname,
      menus: [],
      themeSwitch: false,
      // TODO: get menu items from api
      // menuItems: []
    }
  },
  apollo: {
    menus: {
      query: MENU_QUERY,
      loadingKey: 'loading...'
    }
  },
  computed: {
    menuItems() {
      return this.menus.filter(item => item.menu === 'header')
    }
  },
  watch: {
    themeSwitch() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  },
}
</script>

<style lang="scss" scoped>
.header-menu {
  max-height: 80px;
  justify-content: flex-end;
  margin-top: 30px;
}

.no-btn-hover {
  text-transform: none;
}

.no-btn-hover::before {
  background-color: transparent !important;
}
</style>
