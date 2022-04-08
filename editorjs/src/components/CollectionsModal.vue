<template>
   <v-dialog :ref="ref" :model-value="modelValue" @esc="escValue"> 
    <v-card>
      <v-card-title>
        <v-select
          :items="items"
          :modelValue="items[0]"
          placeholder="Choose collection"
          label="true"
          @change="getSelectedValue($event)">
        </v-select>
      </v-card-title>
      <v-card-text>
        Some content here...
      </v-card-text>
      <v-card-actions>
        <v-button secondary @click="escValue">
          <i18n-t keypath="Cancel" />
        </v-button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CollectionsModal',
  data: () => ({
    items: [
      'announcements',
      'companies',
      'contact_categories',
      'contacts',
      'events',
      'ibmp',
      'index_zones',
      'indian_gas_major_portion',
      'NYMEX',
      'press_releases',
      'reporter_letters',
      'rulemakings',
    ],
    selected: null
  }),
  props: {
    ref: {
      type: String
    },
    modelValue: {
      type: Boolean
    },
    escValue: {
      type: Boolean
    }
  },
  methods: {
    getSelectedValue(e) {
      console.debug('getSelectedValue e: ', e)
    }
  }
}
</script>