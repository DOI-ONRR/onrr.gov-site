<template>
  <div class="d-none d-lg-block">
    <v-btn
      text
      dark
      to="/about-onrr/contact-us"
      class="no-btn-hover"
    >
      <span class="v-btn__content">
        <v-icon color="white">mdi-phone</v-icon>
        <span class="mr-2">Contact Us</span>
      </span>
      
    </v-btn>
    <v-btn
      text
      dark
      to="/references/reporter-training"
      class="no-btn-hover"
    >
      <span class="v-btn__content">
        <v-icon color="white">mdi-calendar</v-icon>
        <span class="mr-2">Events</span>
      </span>
    </v-btn>
    <v-btn
      href="https://revenuedata.doi.gov"
      target="_blank"
      text
      dark
      class="no-btn-hover"
    >
      <span class="v-btn__content">
        <v-icon color="white">mdi-chart-bar</v-icon>
        <span class="mr-2">Revenue Data</span>
      </span>
    </v-btn>
    <v-btn 
      plain
      v-if="hostname === 'localhost' || hostname === '192.168.0.22'">
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
export default {
  name: 'HeaderMenu',
  data () {
    return {
      hostname: location.hostname,
      themeSwitch: false,
      // TODO: get menu items from api
      // menuItems: []
    }
  },
  watch: {
    themeSwitch () {
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