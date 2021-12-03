<template>
  <div class="d-none d-lg-block">
    <v-btn
      v-for="item in menuItems"
      :key="item.id"
      :to="item.link_to_page && item.link_to_page.url"
      :href="item.custom_url && item.custom_url"
      text
      dark
      class="no-btn-hover"
    >
      <span class="v-btn__content">
        <v-icon color="white" v-if="item.menu_icon">{{ item.menu_icon }}</v-icon>
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