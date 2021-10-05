const EditorBlock = () => import(/* webpackChunkName: "EditorBlock" */ '@/components/blocks/EditorBlock')

export const editorBlockMixin = {
  props: {
    block: Object
  },
  components: {
    EditorBlock
  }
}