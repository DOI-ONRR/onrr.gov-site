<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th 
            v-for="(item, index) in tableHeaderItems"
            :key="index" class="text-left">
            <strong>{{ item }}</strong>
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
            {{ item }}
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
    tableContent: {
      type: [Array]
    },
  },
  methods: {
  },
  computed: {
    tableHeaderItems() {
      const hItems = this.tableContent[0]
      return hItems
    },
    tableRowItems() {
      const rItems = this.tableContent.filter((item, index) => index > 0)
      return rItems
    }
  }
}
</script>