<template>
  <v-container>
    <v-row>
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
  </v-container>
</template>

<script>
import { pageBlockMixin, editorBlockMixin } from '@/mixins'

export default {
  mixins: [pageBlockMixin, editorBlockMixin],
  name: 'TwoColumnBlock'
}
</script>