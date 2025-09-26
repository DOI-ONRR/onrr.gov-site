<template>
  <div>
    <keep-alive>
      <component 
        :is="collectionBlock()" 
        :collection="items" 
        :collectionName="collection"
        :collectionLayout="collectionLayout"
        :collectionPage="collectionPage"
        :collectionTab="collectionTab"
        :collectionAccordion="collectionAccordion"
        :apolloLoading="$apolloData.loading"></component>
    </keep-alive>
  </div>
</template>

<script>
// const FilesCollection = () => import(/* webpackChunkName: "FilesCollection" */ '@/components/collections/Files')
const ReporterLettersCollection = () => import(/* webpackChunkName: "ReporterLettersCollection" */ '@/components/collections/ReporterLetters')
const PressReleasesCollection = () => import(/* webpackChunkName: "ReporterLettersCollection" */ '@/components/collections/PressReleases')
const AnnouncementsCollection = () => import(/* webpackChunkName: "AnnouncementsCollection" */ '@/components/collections/Announcements')
const EventsCollection = () => import(/* webpackChunkName: "EventsCollection" */ '@/components/collections/Events')
const CompaniesCollection = () => import(/* webpackChunkName: "CompaniesCollection" */ '@/components/collections/Companies')
const ContactsCollection = () => import(/* webpackChunkName: "ContactsCollection" */ '@/components/collections/Contacts')
const NYMEXCollection = () => import(/* webpackChunkName: "NYMEXCollection" */ '@/components/collections/NYMEX')
const RulemakingsCollection = () => import(/* webpackChunkName: "Rulemakings" */ '@/components/collections/Rulemakings')
const IndexZonesCollection = () => import(/* webpackChunkName: "IndexZones" */ '@/components/collections/IndexZones')
const IBMPCollection = () => import(/* webpackChunkName: "IBMPCollection" */ '@/components/collections/IBMP')
const IndianGasMajorPortionCollection = () => import(/* webpackChunkName: "IndianGasMajorPortion" */ '@/components/collections/IndianGasMajorPortion')
const InterestOilGas = () => import(/* webpackChunkName: "InterestOilGas" */ '@/components/collections/InterestOilGas')
const InterestSolids = () => import(/* webpackChunkName: "InterestSolids" */ '@/components/collections/InterestSolids')
const HandbooksCollection = () => import(/* webpackChunkName: "SolidMineralsReporterHandbook" */ '@/components/collections/Handbooks')
const PlantSpecificUCAsCollection = () => import(/* webpackChunkName: "PlantSpecificUCAsCollection" */ '@/components/collections/PlantSpecificUCAs')

import { 
  REPORTER_LETTERS_QUERY,
  PRESS_RELEASES_QUERY,
  ANNOUNCEMENTS_QUERY,
  CONTACTS_QUERY,
  NYMEX_QUERY,
  RULEMAKINGS_QUERY,
  INDEX_ZONES_QUERY,
  IBMP_QUERY,
  INDIAN_GAS_MAJOR_PORTION_QUERY,
  INTEREST_OIL_AND_GAS_QUERY,
  INTEREST_SOLIDS_QUERY,
  SOLID_MINERALS_HANDBOOK_QUERY,
  PRODUCTION_HANDBOOK_QUERY,
  REVENUE_HANDBOOK_QUERY,
  GEOTHERMAL_CLASS_1_QUERY,
  GEOTHERMAL_CLASS_2_3_QUERY,
  PLANT_SPECIFIC_UCAS_QUERY
} from '@/graphql/queries'

export default {
  name: 'CollectionBlock',
  props: {
    block: [Array, Object, String],
  },
  apollo: {
    collectionItems: {
      query() {

        switch (this.block.item?.collection) {
          case 'reporter_letters':
            return REPORTER_LETTERS_QUERY;
          case 'press_releases':
            return PRESS_RELEASES_QUERY;
          case 'announcements':
            return ANNOUNCEMENTS_QUERY;
          case 'contacts':
            return CONTACTS_QUERY;
          case 'NYMEX':
            return NYMEX_QUERY;
          case 'rulemakings':
            return RULEMAKINGS_QUERY;
          case 'index_zones':
            return INDEX_ZONES_QUERY;
          case 'ibmp':
            return IBMP_QUERY;
          case 'indian_gas_major_portion':
            return INDIAN_GAS_MAJOR_PORTION_QUERY;
          case 'Interest_Oil_and_Gas':
            return INTEREST_OIL_AND_GAS_QUERY;
          case 'Interest_Solids':
            return INTEREST_SOLIDS_QUERY;
          case 'solid_minerals_handbook':
            return SOLID_MINERALS_HANDBOOK_QUERY;
          case 'production_handbook':
            return PRODUCTION_HANDBOOK_QUERY;
          case 'revenue_handbook':
            return REVENUE_HANDBOOK_QUERY;
          case 'geothermal_class_1':
            return GEOTHERMAL_CLASS_1_QUERY;
          case 'geothermal_class_2_3':
            return GEOTHERMAL_CLASS_2_3_QUERY;
          case 'plant_specific_ucas':
            return PLANT_SPECIFIC_UCAS_QUERY;
          default:
            return null;
        }
      },
      update: data => data
    }
  },
  methods: {
    collectionBlock() {
      let collectionBlock
      switch (this.block.item.collection) {
        case 'reporter_letters':
          collectionBlock = ReporterLettersCollection
          break
        case 'press_releases':
          collectionBlock = PressReleasesCollection
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
        case 'ibmp':
          collectionBlock = IBMPCollection
          break
        case 'indian_gas_major_portion':
          collectionBlock = IndianGasMajorPortionCollection
          break
        case 'Interest_Oil_and_Gas':
          collectionBlock = InterestOilGas
          break
        case 'Interest_Solids':
          collectionBlock = InterestSolids
          break
        case 'solid_minerals_handbook':
        case 'production_handbook':
        case 'revenue_handbook':
        case 'geothermal_class_1':
        case 'geothermal_class_2_3':
          collectionBlock = HandbooksCollection
          break
        case 'plant_specific_ucas':
          collectionBlock = PlantSpecificUCAsCollection
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
      return this.block.item.collection
    },
    collectionLayout() {
      return this.block.item.layout
    },
    collectionPage() {
      return this.block.item.page
    },
    collectionTab() {
      return this.block.item.tab || null
    },
    collectionAccordion() {
      return this.block.item.accordion || null
    },
    items() {
      const items = this.collectionItems && this.collectionItems[this.block.item.collection].filter(item => item.status === this.block.item.status)
      return items
    }
  }
}
</script>