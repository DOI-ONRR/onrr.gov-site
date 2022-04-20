<template>
  <div>
    <v-autocomplete
      v-model="field.model"
      :items="field.items"
      :label="field.label"
      :color="field.color"
      :append-icon="field.icon"
      outlined
      multiple>
      <template v-slot:selection="{ item }">
        <v-list-item-content>
          <v-list-item-title v-html="getHeader(item)"></v-list-item-title>
          <v-list-item-subtitle v-for="(contact,i) in item.text.contacts" :key="i">
            <v-chip
              v-if="contact.contact">
              <v-avatar left>
                <v-icon
                  large
                  color="secondary">
                  mdi-contacts
                </v-icon>
              </v-avatar>
              <span v-if="contact.contact">{{ contact.contact }}</span>
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>
      </template>
      <template v-slot:item="{ item }">
        <v-list-item-content>
          <v-list-item-title v-html="getHeader(item)"></v-list-item-title>
          <v-list-item-subtitle v-for="(contact,i) in item.text.contacts" :key="i">
            <v-chip v-if="contact.contact">
              <v-avatar left>
                <v-icon
                  large
                  color="secondary">
                  mdi-contacts
                </v-icon>
              </v-avatar>
              <!-- <span v-if="contact.role"><v-chip>{{ contact.role }}</v-chip></span> -->
              <span v-if="contact.contact">{{ contact.contact }}</span>
              <!-- <span v-if="contact.email">{{ contact.email }}</span> -->
              <!-- <span v-if="contact.phone">{{ contact.phone }}</span>
              <span v-if="contact.fax">{{ contact.fax }}</span> -->
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
export default {
    name: 'AutocompleteField',
    props: ['fields'],
    data() {
      return {
        field: this.fields
      }
    },
    methods: {
      addParamsToLocation(params) {
        const query = { path: this.$route.fullPath, ...this.$route.query, query: params }
        this.$router.push(query).catch(() => {})
      },
      getHeader(item) {
        const agency = item.text.agency ? item.text.agency : ''
        const operatorNum = item.text.operatorNumber ? `(Operator #: ${ item.text.operatorNumber })` : ' '
        const header = `${ item.text.header } ${ agency } ${ operatorNum }`
        return header
      }
    },
    created() {
      this.$emit('fields', this.field)
    }
}
</script>

<style lang="scss" scoped>
.v-list-item__subtitle {
  max-width: 275px;
  margin-right: 8px;
  align-items: top !important;
}

.v-list-item__subtitle span {
  display: inline-block;
}
</style>