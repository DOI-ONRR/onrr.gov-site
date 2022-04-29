<template>
  <div>
    <v-card>
        <v-data-table
            :headers="headers"
            :items="collection"
            :search="searchInputField.text">
            <template v-slot:top>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <TextField :fields="searchInputField"></TextField>
                        </v-col>
                    </v-row>
                </v-container>
            </template>
            <template v-slot:[`item.toc_page`]="{ item }">
                <div><a :href="handbookLink(item.url, item.actual_page)" target="_blank">{{ item.toc_page }}</a></div>
            </template>
        </v-data-table>
    </v-card>
  </div>
</template>

<script>
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')
export default {
  name: 'HandbooksCollection',
  data: () => ({
    searchInputField: {
      label: 'Search table of contents',
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
  methods: {
    searchFilter(value) {
      if (!this.searchInputField.text) {
          return true
      }

      return value.toLowerCase().includes(this.searchInputField.text.toLowerCase())
    },
    handbookLink(url, page) {
      return page ? `${ url }?page=${ page }` : url
    }
  },
  computed: {
    headers()  {
      return [
        {
          text: 'Chapter',
          align: 'start',
          sortable: false,
          value: 'chapter',
        },
        {
          text: 'Section',
          align: 'start',
          sortable: false,
          value: 'section'
        },
        {
          text: 'Title',
          align: 'start',
          sortable: true,
          value: 'title',
          // filter: this.searchFilter
        },
        {
          text: 'Page',
          align: 'start',
          sortable: false,
          value: 'toc_page',
        }
      ]
    }
  },
}
</script>