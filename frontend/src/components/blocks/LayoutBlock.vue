<template>
  <div>
    <v-row v-if="layout === 'one_column'">
      <v-col cols="12" sm="12">
        <div v-if="block.column_one && block.column_one !== null">
          <div v-for="blockItem in block.column_one.blocks" :key="blockItem.id">
            <EditorBlock :blockContent="blockItem"></EditorBlock>
          </div>
        </div>
        <div v-else>
          <slot></slot>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="layout === 'two_column'">
      <v-col cols="12" sm="6">
        <div v-for="blockItem in block.column_one.blocks" :key="blockItem.id">
          <EditorBlock :blockContent="blockItem"></EditorBlock>
        </div>
      </v-col>
      <v-col cols="12" sm="6">
        <div v-for="blockItem in block.column_two.blocks" :key="blockItem.id">
          <EditorBlock :blockContent="blockItem"></EditorBlock>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="layout === 'three_column'">
      <v-col cols="12" sm="4">
        <div v-for="blockItem in block.column_one.blocks" :key="blockItem.id">
          <EditorBlock :blockContent="blockItem"></EditorBlock>
        </div>
      </v-col>
      <v-col cols="12" sm="4">
        <div v-for="blockItem in block.column_two.blocks" :key="blockItem.id">
          <EditorBlock :blockContent="blockItem"></EditorBlock>
        </div>
      </v-col>
      <v-col cols="12" sm="4">
        <div v-for="blockItem in block.column_three.blocks" :key="blockItem.id">
          <EditorBlock :blockContent="blockItem"></EditorBlock>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { editorBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin],
  name: 'LayoutBlock',
  data() {
    return {}
  },
  props: {
    layout: String,
    block: Object
  },
  mounted() {
    this.pageLayout(this.layout)
  },
  methods: {
    pageLayout: function(type) {
      let layout
      switch (type) {
        case 'three_column':
          layout = type
          break
        case 'two_column':
          layout = type
          break
        case 'one_column':
          layout = type
          break
        default:
          layout = 'one_column'
          break
      }
      return layout
    }
  }
}
</script>