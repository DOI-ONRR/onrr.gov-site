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
      target="_self"
    >
      <span class="v-btn__content" v-if="item.menu_label === 'Revenue Data'">
        <svg class="onrr-header-icon" aria-hidden="true" focusable="false" role="img">
          <use :href="`/uswds/img/sprite.svg#${item.menu_icon}`"></use>
        </svg>
        <span class="mr-2" v-if="item.menu_label">{{ item.menu_label }}</span>
        <svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use xlink:href="/uswds/img/sprite.svg#launch"></use>
        </svg>
      </span>

      <span class="v-btn__content" v-else>
        <svg class="onrr-header-icon" aria-hidden="true" focusable="false" role="img">
          <use :href="`/uswds/img/sprite.svg#${item.menu_icon}`"></use>
        </svg>
        <span class="mr-2" v-if="item.menu_label">{{ item.menu_label }}</span>
      </span>

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
