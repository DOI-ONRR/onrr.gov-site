<template>
  <div>
    <Contacts 
      :filter="query" 
      :collection="collectionItems" 
      :collectionTab="null" 
      :collectionAccordion="null">
    </Contacts>
  </div>
</template>

<script>
const Contacts = () => import(/* webpackChunkName: "Contacts" */ '@/components/collections/Contacts')
export default {
  name: 'ContactsSearchResults',
  data: () => ({
    query: null
  }),
  props: {
    blockItems: [Object, Array],
  },
  components: {
    Contacts
  },
  computed: {
    collectionItems() {
      return this.blockItems && this.blockItems.contacts
    }
  },
  created() {
    if (this.$route.query?.q) {
      this.query = decodeURI(this.$route.query.q)
    }
  }
}
</script>