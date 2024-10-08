const TextBlock = () => import(/* webpackChunkName: "TextBlock" */ '@/components/blocks/TextBlock')
const TabsBlock = () => import(/* webpackChunkName: "TabsBlock" */ '@/components/blocks/TabsBlock')
const ContentBlock = () => import(/* webpackChunkName: "ContentBlock" */ '@/components/blocks/ContentBlock')
const ListBlock = () => import(/* webpackChunkName: "ListBlock" */ '@/components/blocks/ListBlock')
const TableBlock = () => import(/* webpackChunkName: "TableBlock" */ '@/components/blocks/TableBlock')
const CodeBlock = () => import(/* webpackChunkName: "CodeBlock" */ '@/components/blocks/CodeBlock')
const ImageBlock = () => import(/* webpackChunkName: "ImageBlock" */ '@/components/blocks/ImageBlock')
const CardBlock = () => import(/* webpackChunkName: "CardBlock" */ '@/components/blocks/CardBlock')
const CollectionBlock = () => import(/* webpackChunkName: "CollectionBlock" */ '@/components/blocks/CollectionBlock')
const HorizontalRuleBlock = () => import(/* webpackChunkName: "HorizontalRuleBlock" */ '@/components/blocks/HorizontalRuleBlock')
const ExpansionPanelBlock = () => import(/* webpackChunkName: "ExpansionPanelBlock" */ '@/components/blocks/ExpansionPanelBlock')
const CustomBlock = () => import(/* webpackChunkName: "CustomBlock" */ '@/components/blocks/CustomBlock')
const FormulaBlock = () => import(/* webpackChunkName: "CardBlock" */ '@/components/blocks/FormulaBlock')


export const pageBlockMixin = {
  data() {
    return {
      content: []
    }
  },
  props: {
    blockContent: [Array, Object]
  },
  components: {
    TextBlock,
    TabsBlock,
    ListBlock,
    TableBlock,
    CodeBlock,
    ImageBlock,
    ContentBlock,
    CardBlock,
    CollectionBlock,
    HorizontalRuleBlock,
    ExpansionPanelBlock,
    CustomBlock,
    FormulaBlock
  },
  created() {
    // console.log('Hello from the pageBlockMixin!')
  },
  methods: {
    pageBlock(type) {
      // console.log('pageBlockMixin pageBlock type: ', type)
      let block
      switch (type) {
        case 'tab_blocks':
          block = TabsBlock
          break
        case 'content_blocks':
          block = ContentBlock
          break
        case 'card_blocks':
          block = CardBlock
          break
        case 'formula_blocks':
          block = FormulaBlock
          break
        case 'header':
        case 'paragraph':
          block = TextBlock
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
        case 'collection':
          block = CollectionBlock 
          break
        case 'horizontalrule':
          block = HorizontalRuleBlock 
          break
        case 'expansion_panels':
          block = ExpansionPanelBlock 
          break
        case 'customBlocks':
          block = CustomBlock 
          break
        default:
          console.warn('pageBlock not found!', type)
          block = ContentBlock
          break
      }
      return block
    }
  },
  computed: {}
}