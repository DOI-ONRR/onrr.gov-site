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
const FilesCollection = () => import(/* webpackChunkName: "FilesCollection" */ '@/components/collections/Files')
const AnnouncementsCollection = () => import(/* webpackChunkName: "AnnouncementsCollection" */ '@/components/collections/Announcements')
const EventsCollection = () => import(/* webpackChunkName: "EventsCollection" */ '@/components/collections/Events')
const CompaniesCollection = () => import(/* webpackChunkName: "CompaniesCollection" */ '@/components/collections/Companies')
const ContactsCollection = () => import(/* webpackChunkName: "ContactsCollection" */ '@/components/collections/Contacts')
const NYMEXCollection = () => import(/* webpackChunkName: "NYMEXCollection" */ '@/components/collections/NYMEX')
const RulemakingsCollection = () => import(/* webpackChunkName: "Rulemakings" */ '@/components/collections/Rulemakings')
const IndexZonesCollection = () => import(/* webpackChunkName: "IndexZones" */ '@/components/collections/IndexZones')

import { 
  REPORTER_LETTERS_QUERY,
  PRESS_RELEASES_QUERY,
  ANNOUNCEMENTS_QUERY,
  CONTACTS_QUERY,
  NYMEX_QUERY,
  RULEMAKINGS_QUERY,
  INDEX_ZONES_QUERY
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
        else if (this.block.data.collection === 'NYMEX') {
          return NYMEX_QUERY
        }
        else if (this.block.data.collection === 'rulemakings') {
          return RULEMAKINGS_QUERY
        }
        else if (this.block.data.collection === 'index_zones') {
          return INDEX_ZONES_QUERY
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
        case 'NYMEX':
          collectionBlock = NYMEXCollection
          break
        case 'rulemakings':
          collectionBlock = RulemakingsCollection
          break
        case 'index_zones':
          collectionBlock = IndexZonesCollection
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