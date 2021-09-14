<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <EditorJs />
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import EditorJs from './components/EditorJs.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld,
    EditorJs
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
