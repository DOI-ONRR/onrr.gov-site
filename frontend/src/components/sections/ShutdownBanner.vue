<template>
    <v-alert
        class="shutdown-banner"
        color="#ECB947"
      >
      <v-icon
        color="primary"
        class="shutdown-icon">mdi-information</v-icon>
        Due to the lapse in appropriations, this site is currently not being updated.
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
