<template>
  <v-list
    nav>
    <v-list-item-group
      v-model="group">
      <v-list-item>
        <v-list-item-title>
          foo
        </v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>
          bar
        </v-list-item-title>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  name: 'MobileMenu',
  data () {
    return {}
  }
}
</script>