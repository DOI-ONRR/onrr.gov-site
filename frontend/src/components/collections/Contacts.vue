<template>
  <div>
    <v-container class="pa-0 mt-10">
        <v-row>
          <v-col cols="12" sm="6">
            <TextField :fields="searchInputField"></TextField>
          </v-col>
        </v-row>
 <div v-if="visibleItems.length > 0 && showResults">
        <v-row v-if="searchResults">
          <v-col cols="12" sm="4">
            <SelectField :fields="categoriesSelectField"></SelectField>
          </v-col>
          <v-col cols="12" sm="4" v-if="tabCategoriesSelectField.items.length > 1">
            <SelectField :fields="tabCategoriesSelectField"></SelectField>
          </v-col>
          <v-col cols="12" sm="4" v-if="accordionCategoriesSelectField.items.length > 1">
            <SelectField :fields="accordionCategoriesSelectField"></SelectField>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-left mt-4">
              Displaying {{ visibleItems.length }} of {{ filteredCollectionItems.length }} contacts
            </div>
          </v-col>
          <v-col>
            <div class="text-right mb-4">
              <v-pagination
              v-model="page"
              color="secondary"
              :length="Math.ceil(filteredCollectionItems.length/perPage)">
              </v-pagination>
            </div>
          </v-col>
        </v-row>
</div>
    </v-container>

    <div v-if="visibleItems.length > 0 && showResults">
      <v-fade-transition group hide-on-leave leave-absolute origin="top left">
        <div v-for="(item, i) in visibleItems" :key="i" class="mb-5">
          <div v-if="headerChange(item) > 0">
          <h3 class="collection-category pa-3 mb-3">
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
          </h3>
        </div>
        <div v-if="!headerChange(item) === 0">
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
        </div>
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
    <div v-else-if="searchInputField.text" >No contacts found.</div>
    <v-container v-if="searchInputField.text" class="pa-0">
        <v-row>
          <v-col>
            <div class="text-left mt-4">
              Displaying {{ visibleItems.length }} of {{ filteredCollectionItems.length }} contacts
            </div>
          </v-col>
          <v-col>
            <div class="text-right mb-4">
              <v-pagination
              v-model="page"
              color="secondary"
              :length="Math.ceil(filteredCollectionItems.length/perPage)">
              </v-pagination>
            </div>
          </v-col>
        </v-row>
    </v-container>
  </div>
</template>

<script>
import { formatToSlug, groupBy } from '@/js/utils'
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
        params: 'category',
        clearable: true
      },
      tabCategoriesSelectField: {
        items: [],
        label: 'All Subcategories',
        ref: 'tabCateegoriesSelectInput',
        selected: null,
        color: 'secondary',
        icon: 'mdi-chevron-down',
        params: 'topic',
        clearable: true
      },
      accordionCategoriesSelectField: {
        items: [],
        label: 'All Subcategories',
        ref: 'accordionCateegoriesSelectInput',
        selected: null,
        color: 'secondary',
        icon: 'mdi-chevron-down',
        params: 'subtopic',
        clearable: true
      },
      filterBy: this.filter,
      searchResults: false,
      contactsByCompanyPage: false,
      filteredResults: null,
      contactsCollection: null
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
    groupBy: groupBy,
    resetPagination() {
      return this.page = 1
    },
    findSearchValue(item) {
      // console.log('findSearchValue item, searchfield: ', item, this.searchInputField.text)
      if (item !== null && (this.searchInputField.text !== undefined && this.searchInputField.text !== null)) {
        return this.searchInputField.text
        .toLowerCase()
        .split(' ')
        .every(v => item && item.toLowerCase().includes(v))
      }
    },
    filterProperties(items) {
      // console.log('filteredProperties items: ', items)

      const filteredItems = items
        .filter(({ page, tab, accordion, letter, header, operatorNumber, companyName, agency }) => {
          return this.findSearchValue(letter) ||
            this.findSearchValue(header) ||
            this.findSearchValue(operatorNumber) ||
            this.findSearchValue(companyName) ||
            this.findSearchValue(agency) ||
            this.findSearchValue(page) ||
            this.findSearchValue(tab) ||
            this.findSearchValue(accordion)
        })
      // console.log('filterProperties filteredItems: ', filteredItems)
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

      return filteredItems
    },
    filterByCategory(items) {
      // console.log('filterByCategory items ----> ', items)
      let filteredItems
      if (this.categoriesSelectField.selected !== null) {
        filteredItems = items.filter(item => (
          item.page === this.categoriesSelectField.selected
        ))
      }
      return filteredItems || items
    },
    headerChange(item){
      const tabsPresent = document.querySelectorAll('.v-tabs-slider-wrapper');
      console.log('the value of tabsPresent length :- '+JSON.stringify(tabsPresent.length));
      console.log('the value of tabsPresent:- '+JSON.stringify(tabsPresent));
      console.log('the header value:- h'+tabsPresent.length);
      if(tabsPresent && tabsPresent.length > 0){
        console.log('the lenght greater value '+JSON.stringify(item));
        return tabsPresent.length;
      }
      return 0;
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
      const page = this.collectionPage || this.categoriesSelectField.selected
      const results  = (page !== null) ? items.filter(item => item.page === page) : items
      // console.log('filterByPage results -----> ', results)
      return results
    },
    filterByTab(items) {
      // console.log('filterByTab items -----> ', items)
      const tab = this.collectionTab
      || this.tabCategoriesSelectField.selected
      const results = (tab !== null) ? items.filter(item => item.tab === tab) : items
      // console.log('filterByTab results -----> ', results)
      return results
    },
    filterByAccordion(items) {
      // console.log('filterByAccordion items -----> ', items)
      const accordion = this.collectionAccordion
      || this.accordionCategoriesSelectField.selected
      const results = (accordion !== null) ? items.filter(item => item.accordion === accordion) : items
      // console.log('filterByAccordion results ------> ', results)
      return results
    },
    categoryItems() {
      let categoryArr = []
      this.collection && this.collection.map(item => {
        if (!categoryArr.includes(item.page)) {
          categoryArr.push(item.page)
        }
      })

      this.categoriesSelectField.items = categoryArr
    }

  },
  computed: {
    formattedContactsCollection() {
      let formattedItems = []

      this.collection && this.collection.map(item => {
        let nObj = this.createContactItem(item)
         formattedItems.push(nObj)
      })

      return formattedItems
    },
    visibleItems() {
      return this.filteredCollectionItems.slice((this.page - 1) * this.perPage, this.page * this.perPage)
    },
    showResults() {
     if ( this.collectionPage.length > 0 ) {
     return  true
     }else if  ( this.searchInputField.text.length > 0) {
     return true
     } else {
        return false
     }
    },
    filteredCollectionItems() {
      this.resetPagination()
      const filteredList= (this.collectionPage || this.searchResults)
      ? this.filterByPage(this.filterByTab(this.filterByAccordion(this.formattedContactsCollection)))
      : this.filterProperties(this.formattedContactsCollection)

      if (this.categoriesSelectField.selected === null && this.searchInputField.text === null) {
        return this.formattedContactsCollection
      } else {
        console.log('filteredList yo ------> ', filteredList)
        if (this.searchInputField.text) {
          const filteredProperties = this.filterProperties(filteredList)
          return (filteredProperties.length === 0)
            ? this.filterContacts(filteredList)
            : this.filterProperties(filteredList)
        } else {
          return filteredList || this.formattedContactsCollection
        }
      }
    },

  },
  watch: {
    'searchInputField.text': function() {
      return this.categoryItems()
    },
    'categoriesSelectField.selected': function(newVal) {
      let tabCategoriesArr = []
      this.collection && this.collection.map(item => {
        if (item.page === newVal) {
          if(!tabCategoriesArr.includes(item.tab)) {
            tabCategoriesArr.push(item.tab)
          }
        }
      })
      this.tabCategoriesSelectField.items = tabCategoriesArr
    },
    'tabCategoriesSelectField.selected': function(newVal) {
      let accordionCategoriesArr = []
      this.collection && this.collection.map(item => {
        if (item.tab === newVal) {
          if(!accordionCategoriesArr.includes(item.accordion)) {
            accordionCategoriesArr.push(item.accordion)
          }
        }
      })
      this.accordionCategoriesSelectField.items = accordionCategoriesArr
    },
  },
  created() {
    setTimeout(() => {
      this.categoryItems()
    }, 250);

    const searchResultsRoute = this.$route.params.slug2 === "search-results"
    const contactsByCompanyPage = this.$route.params.slug2 === 'company-contacts'

    if (searchResultsRoute) {
      this.searchResults = true
    }

    if (contactsByCompanyPage) {
      this.contactsByCompanyPage = true
    }
  },
  mounted() {
    setTimeout(() => {
      this.categoriesSelectField.selected = this.$route.query.category ? decodeURI(this.$route.query.category) : null
      this.tabCategoriesSelectField.selected = this.$route.query.topic ? decodeURI(this.$route.query.topic) : null
      this.accordionCategoriesSelectField.selected = this.$route.query.subtopic ? decodeURI(this.$route.query.subtopic) : null
      this.searchInputField.text = this.$route.query.q ? decodeURI(this.$route.query.q) : ''
    }, 250);
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

.primary-contact,
.primary-contact-federal,
.primary-contact-indian {
  background-color: var(--v-primary-base);
}

.back-up-contact,
.back-up-contact-federal,
.back-up-contact-indian {
  background-color: var(--v-purple-lighten1);
}

.supervisor,
.supervisor-federal,
.supervisor-indian,
.manager {
  background-color: var(--v-yellow-lighten1);
  color: var(--v-black) !important;
}

.contact {
  background-color: var(--v-neutrals-lighten2);
  padding: 2px 4px;
}
</style>
