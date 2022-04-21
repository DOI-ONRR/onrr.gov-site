<template>
  <div>
    <v-container class="pa-0 mt-10">
        <v-row>
          <v-col cols="12" sm="6">
            <TextField :fields="searchInputField"></TextField>
          </v-col>
          <v-col cols="12" sm="6" v-if="searchResults">
            <SelectField :fields="categoriesSelectField" @change="collectionItems"></SelectField>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-left mt-4">
              Displaying {{ visibleItems.length }} of {{ collectionItems.length }} contacts
            </div>
          </v-col>
          <v-col>
            <div class="text-right mb-4">
              <v-pagination
              v-model="page"
              color="secondary"
              :length="Math.ceil(collectionItems.length/perPage)">
              </v-pagination>
            </div>
          </v-col>
        </v-row>
    </v-container>
    <div v-if="visibleItems.length > 0">
      <v-fade-transition group hide-on-leave leave-absolute origin="top left">
        <div v-for="(item, i) in visibleItems" :key="i" class="mb-5">
          <h2 class="collection-category pa-3 mb-3">
            <span v-if="!searchResults">
              {{ item.header }} 
              <span v-if="item.agency !== null">({{ item.agency }})</span>
              <span v-if="item.operatorNumber !== null">(Operator #: {{ item.operatorNumber }})</span>
            </span>
            <span v-if="searchResults">
              {{ item.page }} {{ item.tab && `> ${ item.tab }` }} {{ item.accordion && `> ${ item.accordion }` }} {{ item.header && `> ${ item.header }` }} 
              <span v-if="item.agency !== null">({{ item.agency }})</span>
              <span v-if="item.operatorNumber !== null">(Operator #: {{ item.operatorNumber }})</span>
            </span>
          </h2>
          <v-container class="pa-0">
            <v-row>
              <v-col v-for="(contact, i) in item.contacts" :key="i" cols="12" sm="4">
                <v-card
                  elevation="1"
                  class="text-wrap contact-card"
                  v-if="contact.contact">
                    <v-card-title
                      :class="[formatToSlug(contact.role).toLowerCase(), 'contact-title']">{{ contact.role }}</v-card-title>
                    <v-card-text
                      class="pa-4">
                      <div class="contact contact-row" v-if="contact.contact">{{ contact.contact }}</div>
                      <div class="contact-row" v-if="contact.email">
                        <v-icon color="secondary" class="mr-1">mdi-email</v-icon>
                        <a :href="`mailto:${ contact.email }`">{{ contact.email }}</a>
                      </div>
                      <div class="contact-row" v-if="contact.phone">
                        <v-icon color="secondary" class="mr-1">mdi-phone</v-icon>
                        <a :href="`tel:${ contact.phone }`">{{ contact.phone }}</a>
                      </div>
                      <div class="contact-row" v-if="contact.fax">
                        <v-icon color="secondary" class="mr-1">mdi-fax</v-icon>
                        <a :href="`tel:${ contact.fax }`">{{ contact.fax }}</a>
                      </div>
                    </v-card-text>
                </v-card>
              </v-col>  
            </v-row>
          </v-container>
        </div>
      </v-fade-transition>
    </div>
    <div v-else>No contacts found.</div>
    <v-container class="pa-0">
        <v-row>
          <v-col>
            <div class="text-left mt-4">
              Displaying {{ visibleItems.length }} of {{ collectionItems.length }} contacts
            </div>
          </v-col>
          <v-col>
            <div class="text-right mb-4">
              <v-pagination
              v-model="page"
              color="secondary"
              :length="Math.ceil(collectionItems.length/perPage)">
              </v-pagination>
            </div>
          </v-col>
        </v-row>
    </v-container>
  </div>
</template>

<script>
import { formatToSlug } from '@/js/utils'
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')
const SelectField = () => import(/* webpackChunkName: "SelectField" */ '@/components/inputs/SelectField')

export default {
  name: 'ContactsCollection',
  data() {
    return {
      page: 1,
      perPage: 5,
      searchInputField: {
        label: 'Search contacts',
        text: null,
        ref: 'searchContactsInput',
        color: 'secondary',
        icon: 'mdi-magnify',
      },
      categoriesSelectField: {
        items: [],
        label: 'All Categories',
        ref: 'categoriesSelectInput',
        selected: null,
        color: 'secondary',
        icon: 'mdi-chevron-down',
        params: 'category'
      },
      filterBy: this.filter,
      searchResults: false,
      contactsByCompanyPage: false,
    }
  },
  props: {
    collection: [Object, Array],
    collectionName: String,
    collectionLayout: String,
    collectionPage: String,
    collectionTab: String,
    collectionAccordion: String,
    showToolbar: Boolean,
    filter: String,
  },
  components: {
    TextField,
    SelectField
  },
  methods: {
    formatToSlug: formatToSlug,
    resetPagination() {
      return this.page = 1
    },
    findSearchValue(item) {
      return this.searchInputField.text
        .toLowerCase()
        .split(' ')
        .every(v => item && item.toLowerCase().includes(v))
    },
    filterProperties(items) {
      console.log('filteredProperties items: ', items)
      const filteredItems = items
        .filter(({ page, letter, header, operatorNumber, companyName, agency }) => {        
          return this.findSearchValue(letter) ||
            this.findSearchValue(header) ||
            this.findSearchValue(operatorNumber) ||
            this.findSearchValue(companyName) ||
            this.findSearchValue(agency) ||
            this.findSearchValue(page)
        })
      console.log('filterProperties filteredItems: ', filteredItems)
      return filteredItems || items
    },
    filterContacts(items) {
      // console.log('filterContacts -------> ', items)
      const filteredItems = items.map(item => {
        return { ...item, contacts: item.contacts.filter(contact => {
         
          if (contact.contact !== null) {
            // console.log('filter contact: ', contact)
            // console.log('found match: ', contact.contact.toLowerCase().includes(this.searchInputField.text.toLowerCase()))
            return this.findSearchValue(contact.contact) ||
              this.findSearchValue(contact.email) ||
              this.findSearchValue(contact.role)
          }
        })}
      }).filter(item => item.contacts.length > 0)

      // console.log('wtf filteredItems --------> ', filteredItems)

      return filteredItems || items
    },
    filterByCategory(items) {
      // console.log('filterByCategory items ----> ', items)
      let filteredItems
      if (this.categoriesSelectField.selected !== 'All Categories') {
        filteredItems = items.filter(item => (
          item.page === this.categoriesSelectField.selected ||
          item.tab === this.categoriesSelectField.selected ||
          item.accordion === this.categoriesSelectField.selected
        ))
      }
      return filteredItems || items
    },
    searchCategoriesItems() {
      let categories = []
      Array.from(new Set(this.collection && this.collection.map(item => {
        if (item.page) {
          categories.push(item.page)
        }

        if (item.tab) {
          categories.push(item.tab)
        }

        if (item.accordion) {
          categories.push(item.accordion)
        }
      })))
      return ['All Categories', ...categories.sort((a, b) =>(a < b) ? -1 : 1)]
    },
    createContactItem(item) {
      let nObj = {}
      nObj.__typename = item.__typename
      nObj.id = item.id
      nObj.status = item.status
      nObj.page = item.page
      nObj.tab = item.tab
      nObj.accordion = item.accordion
      nObj.company = item.company_yn
      nObj.letter = item.letter
      nObj.header = item.header
      nObj.companyName = item.company_name,
      nObj.operatorNumber = item.operator_number
      nObj.agency = item.agency,
      nObj.contacts = [
        {
          contact: item.primary_contact,
          role: item.primary_role,
          email: item.email,
          phone: item.phone,
          fax: item.fax,
        },
        {
          contact: item.contact_2,
          role: item.role_2,
          email: item.email_2,
          phone: item.phone_2,
        },
        {
          contact: item.contact_3,
          role: item.role_3,
          email: item.email_3,
          phone: item.phone_3,
        },
        {
          contact: item.contact_4,
          role: item.role_4,
          email: item.email_4,
          phone: item.phone_4,
        },
        {
          contact: item.contact_5,
          role: item.role_5,
          email: item.email_5,
          phone: item.phone_5,
        },
        {
          contact: item.contact_6,
          role: item.role_6,
          email: item.email_6,
          phone: item.phone_6,
        }
      ]
      return nObj
    },
    filterByPage(items) {
      return items.filter(item => item.page === this.collectionPage)
    },
    filterByTab(items) {
      return items.filter(item => item.tab === this.collectionTab)
    },
    filterByAccordion(items) {
      return items.filter(item => item.accordion === this.collectionAccordion)
    },
  },
  computed: {
    collectionItems() {
      let collectionItems = []
      this.collection && this.collection.filter(item => {
        let nObj = this.createContactItem(item)
        collectionItems.push(nObj)        
      })

      const filteredItems = this.collectionPage
        ? this.filterByPage(this.filterByTab(this.filterByAccordion(collectionItems))) 
        : this.filterByCategory(collectionItems)

      if (this.searchInputField.text) {
        this.resetPagination()
        let filteredProperties = this.filterProperties(filteredItems)
        return filteredProperties.length === 0 ? this.filterContacts(filteredItems) : this.filterProperties(filteredItems)
      } else {
        return filteredItems
      }

    },
    visibleItems() {
      return this.collectionItems.slice((this.page - 1) * this.perPage, this.page * this.perPage)
    },
  },
  watch: {},
  created() {
    setTimeout(() => {
      this.categoriesSelectField.items = this.searchCategoriesItems()
      this.categoriesSelectField.selected = this.$route.query.category ? decodeURI(this.$route.query.category) : 'All Categories'
    }, 500);
  },
  mounted() {
    const category = this.$route.query.category && decodeURI(this.$route.query.category)
    const query = this.$route.query.q && decodeURI(this.$route.query.q)
    const searchResultsRoute = this.$route.params.slug2 === "search-results"
    const contactsByCompanyPage = this.$route.params.slug2 === 'company-contacts'


    if (category) {
      this.categoriesSelectField.selected = category
    }
    
    if (query || searchResultsRoute) {
      this.searchResults = true
      this.searchInputField.text = query
    }

    if (contactsByCompanyPage) {
      this.contactsByCompanyPage = true
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-category {
  border-top: 2px solid var(--v-purple-base);
  background-color: var(--v-purple-lighten2);
}
.contact-card {
  min-height: 165px;
}

.contact-title {
  padding: 0px 8px;
  min-height: 36px;
  color: white !important;
  font-size: 1rem !important;
}

.contact-row {
  margin-bottom: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.primary-contact {
  background-color: var(--v-primary-base);
}

.back-up-contact {
  background-color: var(--v-purple-lighten1);
}

.supervisor,
.manager {
  background-color: var(--v-yellow-lighten1);
  color: var(--v-black) !important;
}

.contact {
  background-color: var(--v-neutrals-lighten2);
  padding: 2px 4px;
}
</style>