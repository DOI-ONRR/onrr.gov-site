<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th 
            v-for="(item, index) in tableHeaderItems"
            :key="index" class="text-left">
            <span v-html="item"></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(items, index) in tableRowItems"
            :key="index" class="text-left">
          <td
            v-for="(item, index) in items"
            :key="index" class="text-left"
          >
            <span v-html="item"></span>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  name: 'TableBlock',
  data() {
    return {}
  },
  props: {
    block: {
      type: [Object]
    },
  },
  methods: {
  },
  computed: {
    tableHeaderItems() {
      const hItems = this.block.data.content[0]
      return hItems
    },
    tableRowItems() {
      const rItems = this.block.data.content.filter((item, index) => index > 0)
      return rItems
    }
  }
}
</script>