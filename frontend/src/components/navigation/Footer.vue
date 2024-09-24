<template>
  <footer class="usa-footer">
    <div class="usa-footer__primary-section">
      <nav class="usa-footer__nav" aria-label="Footer navigation">
        <ul class="grid-row grid-gap">
          <li class="mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
            v-for="item in menuItemsTop"
            :key="item.id">
            <a class="usa-footer__primary-link"
              :href="`${item.link_to_page ? item.link_to_page.url : item.custom_url}`"
              :target="`${ item.custom_url ? '_blank' : '_self' }`">{{ item.menu_label }}</a></li>
        </ul>
        <ul class="grid-row grid-gap">
          <li class="mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
            v-for="item in menuItemsBottom"
            :key="item.id">
            <a class="usa-footer__primary-link"
              :href="`${item.link_to_page ? item.link_to_page.url : item.custom_url}`"
              :target="`${ item.custom_url ? '_blank' : '_self' }`">{{ item.menu_label }}</a></li>
        </ul>
      </nav>
    </div>
    <div class="usa-footer__secondary-section">
    <div class="grid-container">
      <div class="grid-row grid-gap">
        <div
          class="usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2"
        >
          <div class="mobile-lg:grid-col-auto">
            <router-link to="/" class="override-overflow-hidden">
              <v-img
                alt="ONNR Logo"
                class="shrink"
                contain
                src="../../assets/images/logos/ONRR-mark-200x200.png"
                transition="scale-transition"
                width="75"
              />
            </router-link>
          </div>
          <div class="mobile-lg:grid-col-auto display-flex flex-align-top">
            <router-link to="/" class="ml-2">
              <div class="logo-content text-white">
                <div class="font-ui-3xs margin-top-neg-05">U.S. Department of the Interior</div>
                <div class="font-sans-md margin-top-neg-05">Office of Natural Resources Revenue (ONRR)</div>
                <div class="font-sans-3xs margin-top-neg-05">PO Box 25165</div>
                <div class="font-sans-3xs margin-top-neg-05">Denver, CO 80225-0165</div>
              </div>
            </router-link>
          </div>
        </div>
        <div class="usa-footer__contact-links mobile-lg:grid-col-6 display-flex flex-align-center flex-justify-end">
          <div class="usa-footer__social-links grid-row grid-gap">
            <div v-for="item in socialMenuItems"
              :key="item.id"
              class="grid-col-auto text-center">
              <a :href="`${item.link_to_page ? item.link_to_page.url : item.custom_url}`"
                :target="`${ item.custom_url ? '_blank' : '_self' }`"
                :aria-label="`${item.menu_label} link`">
                <svg class="onrr-social-icon" aria-hidden="true" focusable="false" role="img">
                  <use :href="`/uswds/img/sprite.svg#${item.menu_icon}`"></use>
                </svg>
                <div v-if="item.menu_label === 'Contacts'" class="font-ui-3xs text-white">Contacts</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </footer>
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