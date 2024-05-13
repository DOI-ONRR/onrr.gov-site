<template>
  <v-container>
    <v-row>
      <v-col
        align="center">
        <img alt="Vue logo" src="./assets/logo.png">
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <onrr-editor />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OnrrEditor from './components/OnrrEditor.vue'

export default {
  name: 'App',
  components: {
    OnrrEditor,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
pre {
  font-size: 0.675rem;
}
</style>
