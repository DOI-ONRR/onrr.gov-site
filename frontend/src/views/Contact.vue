<template>
  <div class="contacts-wrap">
    <Breadcrumbs />
    <v-card
    class="mx-auto v-card"
    max-width="100%"
    v-for="contact in contacts"
    :key="contact.id"
  >
    <v-list>
      <v-subheader>
        Category: Paying > Federal accounts receivable, billing, and finance > Company Contact
      </v-subheader>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title v-text="contact.primary_contact">{{ contact.primary_contact }}</v-list-item-title>
        </v-list-item-content>

        <v-list-item-icon v-if="contact.primary_email">
          <v-icon>
            mdi-email
          </v-icon>
          <span style="margin-left: 8px;">{{ contact.primary_email }}</span>
        </v-list-item-icon>

        <v-list-item-icon v-if="contact.primary_phone">
          <v-icon>
            mdi-phone
          </v-icon>
          <span style="margin-left: 8px;">{{ contact.primary_phone }}</span>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-card>
  </div>
</template>

<script>
import { CONTACTS_QUERY } from '@/graphql/queries'
import Breadcrumbs from '@/components/sections/Breadcrumbs'

export default {
  name: 'Contact',
  metaInfo: {
  title: 'Contact',
  },
  data () {
    return {
      contacts: []
    }
  },
  components: {
    Breadcrumbs
  },
  apollo: {
    contacts: {
      query: CONTACTS_QUERY,
      loadingKey: 'loading...',
      result ({ data }) {
        if (data) {
          console.log('contacts data yo-------> ', data)
          this.contacts = data.contacts
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.contacts-wrap {
  padding-top: 25px;
}
.v-card {
  margin-bottom: 16px;
}
</style>