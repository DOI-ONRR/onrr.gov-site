<template>
    <v-alert
        class="shutdown-banner"
        color="#ECB947"
      >
      <v-icon
        color="primary"
        class="shutdown-icon">mdi-information</v-icon>
      Due to the government shutdown, we are not able to update this site. We will resume work on the site when the shutdown ends.
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
