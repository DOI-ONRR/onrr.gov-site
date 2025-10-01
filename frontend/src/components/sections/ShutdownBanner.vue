<template>
    <v-alert
        class="shutdown-banner"
        color="#ECB947"
      >
      <v-icon
        color="primary"
        class="shutdown-icon">mdi-information</v-icon>
        Because of the federal government shutdown, onrr.gov is not being updated and the agency will not be able to respond to inquiries until appropriations are enacted. For more information please visit: <a href="https://www.doi.gov/shutdown" class="usa-link usa-link--external" target="_blank">https://www.doi.gov/shutdown</a>
      </v-alert>
</template>

<script>
export default {

}
</script>

<style scoped>
    .shutdown-banner {
        margin-bottom: 0;
        border-radius: 0 !important;
        text-align: center;
    }

    .shutdown-icon {
        margin-right: .25em;
    }
</style>
