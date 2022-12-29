<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <h4 v-html="tableTitle"></h4>
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
      rightAlignedIndexes: [],
      headingCount: 0,
      tableTitleValue: ''
    }
  },
  props: {
    block: {
      type: [Object]
    },
  },
  methods: {
    isCellNumeric(str, idx) {
      
      const numPercentage = /^(?:[1-9]\d?%|0%)$/
      const isMonetary = (str.includes('$', 0) || str.match(numPercentage)) && !str.includes('(')
      const isValidNum = /^[0-9,.]*$/.test(str) && str.includes(',')

      // console.log('isCellNumeric str: ', str, isMonetary)

      if(isMonetary || isValidNum) {
        if (!this.rightAlignedIndexes.includes(idx)) {
          this.rightAlignedIndexes.push(idx)
        }
        
      }

      return str
    }
    
  },
  computed: {
    tableHeaderItems() {
      const hItems = this.block.data.content[0]
      return hItems
    },
    tableTitle() {
      console.log('the title value:- '+JSON.stringify(this.block.data.tableHeadingText));
      this.tableTitleValue = this.block.data && this.block.data.tableHeadingText ? this.block.data.tableHeadingText[this.headingCount] : ''
      if(this.headingCount <= this.block.data.tableHeadingText?.length){
      this.headingCount++;
      }
      return this.tableTitleValue;
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
    border-bottom: 1px solid var(--v-accent-base) !important;
  }
  .heading-text-title {
    font-size: xx-large;
    font-weight: 900;
  }

  
</style>