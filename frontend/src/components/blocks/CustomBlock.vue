<template>
  <div>
    <keep-alive>
      <component 
        :is="blockType(block.data.customBlock)" 
        :blockItems="items"></component>
    </keep-alive>
  </div>
</template>

<script>
const ContactsSearch = () => import(/* webpackChunkName: ContactsSearch" */ '@/components/sections/ContactsSearch')
const ContactsSearchResults = () => import(/* webpackChunkName: ContactsSearch" */ '@/components/sections/ContactsSearchResults')

import { 
  CONTACTS_QUERY,
} from '@/graphql/queries'

export default {
  name: 'CustomBlock',
  props: {
    block: [Array, Object, String],
  },
  apollo: {
    blockItems: {
      query() {
        if (this.block.data.customBlock === 'contacts_search' || this.block.data.customBlock === 'contacts_search_results') {
          return CONTACTS_QUERY
        }
      },
      update: data => data
    }
  },
  methods: {
    blockType(type) {
      let block
      switch (type) {
        case 'contacts_search':
          block = ContactsSearch
          break
        case 'contacts_search_results':
          block = ContactsSearchResults
          break
        default:
          console.warn('No custom block found.')
          block = undefined
          break
      }
      return block
    },
    
  },
  computed: {
    items() {
      const items = this.blockItems && this.blockItems
      return items
    }
  }
}
</script>