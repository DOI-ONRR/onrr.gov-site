<template>
  <div class="text-center">
    <v-pagination
      v-model="page"
      :length="6"
      color="secondary"
    ></v-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      page: 1,
    }
  }
}
</script>