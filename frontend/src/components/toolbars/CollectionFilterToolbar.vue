<template>
  <v-form>
    <v-container class="pa-0">
      <!-- {{search}} -- {{ color }} -- {{ email }} -->
      <!-- <CustomInput v-model="color" label="Select color" type="color" inputType="text" />
      <CustomInput v-model="email" label="Email" type="email" inputType="text" /> -->
      <v-row>
        <v-col
          cols="12"
          sm="4"
        >
          <CustomInput 
            v-model="search"
            label="Search"
            type="search"
            inputType="text"
            icon="mdi-magnify"
            @update="onUpdateStore('searchQuery', $event)" />
        </v-col>
        <!-- <v-col
          cols="12"
          sm="4"
        >
          <CustomInput 
            v-model="getYear"
            label="Year"
            type="text"
            :items="items"
            inputType="select"
            @update="onUpdateStore('year', $event)" />
        </v-col> -->
        <v-col
          cols="12"
          sm="4"
          class="mt-1"
        >
          <v-chip>{{ (collection.length > 1) ? `${ collection.length } items` : `${ collection.length } item` }}</v-chip>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import { store, mutations } from '@/store'
const CustomInput = () => import(/* webpackChunkName: "CustomInput" */ '@/components/inputs/CustomInput')
export default {
  name: 'CollectionFilterToolbar',
  data() {
    return {
      search: store.collections.searchQuery,
      color: '',
      email: '',
      items: [2021, 2020, 2019, 2018], 
    }
  },
  props: {
    collection: {
      type: [Object, Array]
    },
    showToolbar: {
      type: Boolean,
    }
  },
  components: {
    CustomInput
  },
  methods: {
     onUpdateStore(key, value) {
        mutations.updateCollections(key, value)
     }
  },
  computed: {
    year() {
      return store.collections.year
    },
    getYear() {
      return this.year || this.items[0]
    },
    getItems() {
      return this.collection(item => item.date)
    }
  }
}
</script>