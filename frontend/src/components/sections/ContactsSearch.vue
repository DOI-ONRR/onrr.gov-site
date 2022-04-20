<template>
  <div>
    <AutocompleteField
      :fields="contactsSearchField">
    </AutocompleteField>
  </div>
</template>

<script>
import { groupBy } from '@/js/utils'
const AutocompleteField = () => import(/* webpackChunkName: "Autocomplete" */ '@/components/inputs/Autocomplete')

export default {
  name: 'ContactsSearch',
  data: () => ({
    contactsSearchField: {
      items: [],
      model: null,
      label: 'Search by operator or payor company, contact name, or category',
      ref: 'contactsSearchInput',
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'q'
    }
  }),
  props: {
    blockItems: [Object, Array],
  },
  components: {
    AutocompleteField
  },
  methods: {
    groupBy: groupBy,
    searchItems() {
      let itemsArr = []

      this.blockItems && this.blockItems.contacts.map(item => {
      
        let nObj = {}
        let sObj = {}
        // nObj.__typename = item.__typename
        // nObj.id = item.id
        // nObj.status = item.status
        // nObj.page = item.page
        // nObj.tab = item.tab
        // nObj.accordion = item.accordion
        nObj.header = item.header
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

        sObj.text = nObj
        sObj.value = nObj.header

        itemsArr.push(sObj)
      })

      this.contactsSearchField.items = itemsArr
    },
  },
  computed: {
    // fields() {
    //   if(!this.contactsSearchField.model) return []

    //   return Object.keys(this.contactsSearchField.model).map(key => {
    //     return {
    //       key,
    //       value: this.model[key] || 'n/a',
    //     }
    //   })
    // }
  },
  created() {
     setTimeout(function () {
        this.searchItems()
     }.bind(this), 500)
  }
}
</script>