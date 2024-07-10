<template>
  <div>
    <v-card>
        <v-data-table
            :headers="headers"
            :items="collection"
            :search="searchInputField.text"
            class="plant-specific-ucas-table"
            hide-default-header>
            <template v-slot:top>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <TextField :fields="searchInputField"></TextField>
                        </v-col>
                    </v-row>
                </v-container>
            </template>
            <template v-slot:[`header`]="{ props: { headers } }">
              <thead class="table-header">
                <tr>
                    <th v-for="h in headers" :key="h.title">
                      <span class="black--text text-h5">{{ h.text }}</span>
                    </th>
                </tr>
              </thead>
            </template>
            <template v-slot:[`item.transportation_system_or_gas_plant`]="{ item }">
                <div v-if="item.file === null">
                  {{ item.transportation_system_or_gas_plant }}
                </div>
                <div v-else>
                  <a :href="`/unbundling/${ item.file.filename_download }`" target="_blank"
                    :class="fileIconClass(item.file.filename_download)">
                    {{ item.transportation_system_or_gas_plant }}
                  </a>
                </div>
            </template>
            <template v-slot:[`item.doc_date`]="{ item }">
                <div>{{ formatNiceDate(item.doc_date) }}</div>
            </template>
        </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { 
  dateMixin,
  iconMixin,
} from '@/mixins'
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')
export default {
  name: 'PlantSpecificUCAsCollection',
  mixins: [dateMixin, iconMixin],
  data: () => ({
    searchInputField: {
      label: 'Search table',
      text: '',
      ref: 'searchInput',
      color: 'secondary',
      icon: 'mdi-magnify',
    },
  }),
  props: {
    collection: [Array, Object],
  },
  components: {
    TextField
  },
  computed: {
    headers()  {
      return [
        {
          text: 'Transportation system or gas plant',
          align: 'start',
          sortable: false,
          value: 'transportation_system_or_gas_plant',
        },
        {
          text: 'Type',
          align: 'start',
          sortable: false,
          value: 'type'
        },
        {
          text: 'Operator',
          align: 'start',
          sortable: true,
          value: 'operator',
        },
        {
          text: 'Location',
          align: 'start',
          sortable: false,
          value: 'location',
        },
        {
          text: 'Doc Date',
          align: 'start',
          sortable: false,
          value: 'doc_date',
        }
      ]
    }
  },
}
</script>