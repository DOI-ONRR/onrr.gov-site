<template>
    <v-alert
        class="shutdown-banner"
        color="#ECB947"
      >
      <v-icon
        color="primary"
        class="shutdown-icon">mdi-information</v-icon>
       Due to the current lapse of federal appropriations: this website may not be up to date; transactions submitted via this website might not be processed until appropriations are enacted; and we may not be able to respond to inquiries until appropriations are enacted.<br>For more information, please visit The Department of the Interior shutdown page at: <a href="https://www.doi.gov/shutdown" class="usa-link usa-link--external" target="_blank">https://www.doi.gov/shutdown</a>
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
