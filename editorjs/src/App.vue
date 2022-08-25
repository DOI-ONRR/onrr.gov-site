<template>
  <EditorJs />
</template>

<script>
import EditorJs from './components/EditorJs.vue'

export default {
  name: 'App',
  components: {
    EditorJs
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.block-container .block-component {
  display: flex;
  flex-wrap: wrap;
}
</style>
