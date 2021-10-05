const OneColumnBlock = () => import(/* webpackChunkName: "ThreeColumnBlock" */ '@/components/blocks/OneColumnBlock')
const TwoColumnBlock = () => import(/* webpackChunkName: "ThreeColumnBlock" */ '@/components/blocks/TwoColumnBlock')
const ThreeColumnBlock = () => import(/* webpackChunkName: "ThreeColumnBlock" */ '@/components/blocks/ThreeColumnBlock')

export const pageLayoutMixin = {
  methods: {
    pageLayout(type) {
      let layout 
      switch (type) {
        case 'three_column':
          layout = ThreeColumnBlock
          break
        case 'two_column':
          layout = TwoColumnBlock
          break
        case 'one_column':
          layout = OneColumnBlock
          break
        default:
          layout = OneColumnBlock
          break
      }
      return layout
    }
  }
}