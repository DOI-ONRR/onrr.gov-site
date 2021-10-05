<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12">
        <div v-if="block.block_content_column_one !== null">
          <div v-for="blockItem in block.block_content_column_one.blocks" :key="blockItem.id">
            <EditorBlock :blockContent="blockItem"></EditorBlock>
          </div>
        </div>
        <div v-else>
          <slot></slot>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { pageBlockMixin, editorBlockMixin } from '@/mixins'

export default {
  mixins: [pageBlockMixin, editorBlockMixin],
  name: 'OneColumnBlock'
}
</script>