<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col cols="12" sm="10" class="mr-1">
        <v-autocomplete
          v-model="contactsSearchField.select"
          :items="contactsSearchField.items"
          :label="contactsSearchField.label"
          :color="contactsSearchField.color"
          :append-icon="contactsSearchField.icon"
          :search-input.sync="contactsSearchField.search"
          :loading="loading"
          outlined
          clearable
          hide-no-data
          @change="submitSearch($event, contactsSearchField.select)">
          <template v-slot:selection="{ item }">
            <v-list-item-content>
              <v-list-item-title v-html="item"></v-list-item-title>
            </v-list-item-content>
          </template>
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title v-html="item"></v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" sm="1">
        <v-btn 
          large
          color="secondary"
          class="contacts-search-button"
          @click="submitSearch($event, contactsSearchField.select)">
          <v-icon>
            mdi-magnify
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ContactsSearch',
  data: () => ({
    contactsSearchField: {
      items: [],
      select: null,
      search: null,
      label: 'Search by operator or payor company, contact name, or category',
      ref: 'contactsSearchInput',
      color: 'secondary',
      icon: 'mdi-chevron-down',
    },
    loading: false
  }),
  props: {
    blockItems: [Object, Array],
  },
  computed: {
    searchItems() {
      let itemsArr = []

      this.blockItems && this.blockItems.contacts.map(item => {

        if (item?.header) {
          itemsArr.push(item.header)
        }

        if (item?.company_name) {
          itemsArr.push(item.company_name)
        }

        if (item?.operator_number) {
          itemsArr.push(item.operator_number)
        }

        if (item?.agency) {
          itemsArr.push(item.agency)
        }

        if (item?.page) {
          itemsArr.push(item.page)
        }

        if (item?.primary_contact) {
          itemsArr.push(item.primary_contact)
        }

        if (item?.contact_2) {
          itemsArr.push(item.contact_2)
        }

        if (item?.contact_3) {
          itemsArr.push(item.contact_3)
        }

        if (item?.contact_4) {
          itemsArr.push(item.contact_4)
        }

        if (item?.contact_5) {
          itemsArr.push(item.contact_5)
        }

        if (item?.contact_6) {
          itemsArr.push(item.contact_6)
        }

        
      })
      
      return itemsArr
    },
  },
  watch: {
    'contactsSearchField.search': function(val) {
      val && val !== this.contactsSearchField.select && this.querySelections(val)
    },
    searchItems: {
      deep: true,
      handler: function(newVal) {
        this.contactsSearchField.search = newVal[0]
        this.contactsSearchField.items = newVal
      }
    }
  },
  methods: {
    querySelections(v) {
      // console.log('querySelections val -------> ', v)
      this.loading = true
      // simulate ajax loading
      setTimeout(() => {
        this.contactsSearchField.items = this.searchItems.filter(e => {
          // console.log('querySelections e ------> ', e)
          return (e || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
        })
         this.loading = false
      }, 500);
    },
    submitSearch(e, v) {
      console.log('submit search yo -------> ', e, v)
      const query = { 
        path: '/about/contact/search-results', 
        ...this.$route.query, query:  { q: encodeURIComponent(v) || undefined } 
      }
      this.$router.push(query).catch(() => {})
    }
  },
}
</script>

<style lang="scss" scoped>
.contacts-search-button {
  min-height: 55px;
}
</style>