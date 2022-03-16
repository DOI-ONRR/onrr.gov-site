<template>
  <div>
    <v-card 
      elevation="1"
      v-for="(contact, i) in collection"
      :key="i"
      class="ml-1 mr-1 mt-1 mb-4 text-wrap">
      <v-list>
        <v-subheader class="text-wrap">
          Category: Paying > Federal accounts receivable, billing, and finance > Company Contact
        </v-subheader>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title v-text="contact.primary_contact">{{ contact.primary_contact }}</v-list-item-title>
            <v-list-item-icon v-if="contact.primary_email">
              <v-icon>
                mdi-email
              </v-icon>
              <span>{{ contact.primary_email }}</span>
            </v-list-item-icon>

            <v-list-item-icon v-if="contact.primary_phone">
              <v-icon>
                mdi-phone
              </v-icon>
              <span>{{ contact.primary_phone }}</span>
            </v-list-item-icon>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'ContactsCollection',
  props: {
    collection: [Object, Array],
    collectionName: String,
    collectionLayout: String,
    showToolbar: Boolean,
  },
}
</script>

<style lang="scss" scoped>

</style>