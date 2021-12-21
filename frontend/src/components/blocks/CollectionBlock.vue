<template>
  <div>
    <keep-alive>
      <component 
        :is="collectionBlock(collection)" 
        :collection="items" 
        :collectionName="collection"
        :collectionLayout="collectionLayout"></component>
    </keep-alive>
  </div>
</template>

<script>
const FilesCollection = () => import(/* webpackChunkName: "FilesCollection" */ '@/components/collections/FilesCollection')
const AnnouncementsCollection = () => import(/* webpackChunkName: "AnnouncementsCollection" */ '@/components/collections/AnnouncementsCollection')
const EventsCollection = () => import(/* webpackChunkName: "EventsCollection" */ '@/components/collections/EventsCollection')
const CompaniesCollection = () => import(/* webpackChunkName: "CompaniesCollection" */ '@/components/collections/CompaniesCollection')
const ContactsCollection = () => import(/* webpackChunkName: "ContactsCollection" */ '@/components/collections/ContactsCollection')

import { 
  REPORTER_LETTERS_QUERY,
  PRESS_RELEASES_QUERY,
  ANNOUNCEMENTS_QUERY,
  CONTACTS_QUERY
} from '@/graphql/queries'

export default {
  name: 'CollectionBlock',
  props: {
    block: [Array, Object, String],
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
        else if (this.block.data.collection === 'announcements') {
          return ANNOUNCEMENTS_QUERY
        }
        else if (this.block.data.collection === 'events') {
          // Do events query stuff
        }
        else if (this.block.data.collection === 'companies') {
          // Do companies query stuff
        }
        else if (this.block.data.collection === 'contacts') {
          return CONTACTS_QUERY
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
          collectionBlock = FilesCollection
          break
        case 'announcements':
          collectionBlock = AnnouncementsCollection
          break
        case 'events':
          collectionBlock = EventsCollection
          break
        case 'companies':
          collectionBlock = CompaniesCollection
          break
        case 'contacts':
          collectionBlock = ContactsCollection
          break
        default:
          console.warn('No collection block found.')
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
    },
    items() {
      const items = this.collectionItems && this.collectionItems[this.block.data.collection].filter(item => item.status === this.block.data.status)
      return items
    }
  }
}
</script>