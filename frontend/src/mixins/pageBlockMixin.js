const TextBlock = () => import(/* webpackChunkName: "TextBlock" */ '@/components/blocks/TextBlock')
const TabsBlock = () => import(/* webpackChunkName: "TabsBlock" */ '@/components/blocks/TabsBlock')
const ContentBlock = () => import(/* webpackChunkName: "ContentBlock" */ '@/components/blocks/ContentBlock')
const ListBlock = () => import(/* webpackChunkName: "ListBlock" */ '@/components/blocks/ListBlock')
const TableBlock = () => import(/* webpackChunkName: "TableBlock" */ '@/components/blocks/TableBlock')
const CodeBlock = () => import(/* webpackChunkName: "CodeBlock" */ '@/components/blocks/CodeBlock')
const ImageBlock = () => import(/* webpackChunkName: "ImageBlock" */ '@/components/blocks/ImageBlock')

export const pageBlockMixin = {
  props: {
    blockContent: [Array, Object]
  },
  components: {
    TextBlock,
    TabsBlock,
    ListBlock,
    TableBlock,
    CodeBlock,
    ImageBlock
  },
  created() {
    console.log('Hello from the pageBlockMixin!')
  },
  methods: {
    pageBlock(type) {
      // console.log('pageBlockMixin pageBlock type: ', type)
      let block
      switch (type) {
        case 'header':
        case 'paragraph':
          block = TextBlock
          break
        case 'tab_block':
          block = TabsBlock
          break
        case 'content_block':
          block = ContentBlock
          break
        case 'list':
          block = ListBlock 
          break
        case 'table':
          block = TableBlock 
          break
        case 'code':
          block = CodeBlock
          break
        case 'image':
          block = ImageBlock 
          break
        default:
          block = TextBlock
          break
      }
      return block
    }
  }
}