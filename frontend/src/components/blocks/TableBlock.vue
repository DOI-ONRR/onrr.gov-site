<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th 
            v-for="(item, index) in tableHeaderItems"
            :key="index"
            :class="[textClass, 'black--text','pa-2']">
            <span v-html="item"></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(items, index) in tableRowItems"
            :key="index"
            :class="[textClass, 'black--text']">
          <td
            v-for="(item, index) in items"
            :key="index"
            :class="[textClass, 'black--text', 'pa-2']">
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
    },
    textClass() {
      let alignmentClass = `text-${ this.block?.tunes?.alignmentTune?.alignment }` || 'text-left'
      return alignmentClass
    }
  }
}
</script>

<style lang="scss" scoped>
.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th {
  border-bottom: 3px solid var(--v-accent-base) !important;
  vertical-align: bottom;
}

.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  font-size: 1rem;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:hover {
  background-color: transparent !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:nth-child(even) {
  background-color: var(--v-neutrals-lighten3) !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  vertical-align: top;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:not(:last-child) > td:not(.-data-table__mobile-row) {
  border-bottom: 1px solid var(--v-accent-base) !important;
}


</style>