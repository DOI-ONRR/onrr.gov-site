<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th 
            v-for="(item, index) in tableHeaderItems"
            :key="index"
            :class="[textClass(index), 'black--text','pa-2']">
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
            :class="[textClass(index), 'black--text', 'pa-2']">
            <span v-html="isCellNumeric(item, index)"></span>
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
    return {
      rightAlignedIndexes: []
    }
  },
  props: {
    block: {
      type: [Object]
    },
  },
  methods: {
    isCellNumeric(str, idx) {
      // console.log('isCellNumeric str: ', str)
      const isMonetary = (str.includes('$', 0) || str.includes('%')) && !str.includes('(')
      // const numericStr = isMonetary ? str.replace('$', '') : str

      if(isMonetary) {
        console.log('found val that appears to be a num yo: ', str, idx)
        if (!this.rightAlignedIndexes.includes(idx)) {
          this.rightAlignedIndexes.push(idx)
        }
        
      }

      return str
    },
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
      return (idx) => {
        if (this.rightAlignedIndexes.includes(idx)) {
          return 'text-right'
        } else {
          return (this.block?.tunes?.alignmentTune?.alignment) ? `text-${ this.block?.tunes?.alignmentTune?.alignment }` : 'text-left'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    vertical-align: top;
  }
</style>