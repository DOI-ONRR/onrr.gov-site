<template>
  <div>
    <component 
      :is="collectionBlock(this.block.data.collection)" 
      :collection="collectionItems[collection]" 
      :collectionName="collection"
      :collectionLayout="collectionLayout"></component>
  </div>
  
</template>

<script>
const FilesBlock = () => import(/* webpackChunkName: "FilesBlock" */ '@/components/blocks/FilesBlock')

import { 
  REPORTER_LETTERS_QUERY,
  PRESS_RELEASES_QUERY 
} from '@/graphql/queries'

export default {
  name: 'CollectionBlock',
  props: {
    block: [Array, Object],
  },
  apollo: {
    collectionItems: {
      query() {
        if (this.block.data.collection === 'reporter_letters') {
          return REPORTER_LETTERS_QUERY
        }
        else if (this.block.data.collection === 'press_releases') {
          return PRESS_RELEASES_QUERY
        }
      },
      update: data => data
    }
  },
  methods: {
    collectionBlock(type) {
      let collectionBlock
      switch (type) {
        case 'reporter_letters':
        case 'press_releases':
          collectionBlock = FilesBlock
          break
        default:
          collectionBlock = undefined
          break
      }
      return collectionBlock
    },
    
  },
  computed: {
    collection() {
      return this.block.data.collection
    },
    collectionLayout() {
      return this.block.data.layout
    }
  }
}
</script>