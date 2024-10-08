<template>
  <div>
    <v-card>
        <v-data-table
            :headers="headers"
            :items="handbook"
            :search="searchInputField.text"
            hide-default-header
            class="onrr-data-table">
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
              <thead>
                <tr>
                    <th v-for="h in headers" :key="h.title" scope="col">
                      <span class="black--text text-h5">{{ h.text }}</span>
                    </th>
                </tr>
              </thead>
            </template>
            <template v-slot:[`item.chapter`]="{ item }">
              <th scope="row">
                <span v-if="item.sr_chapter" class="usa-sr-only">
                  {{ item.chapter }}
                </span>
                <span v-else>
                  {{ item.chapter }}
                </span>
              </th>
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
    handbook: []
  }),
  props: {
    collection: [Array, Object],
  },
  components: {
    TextField
  },
  created() {
    if (this.collection) {
      this.makeHandbook();
    }
  },
  watch: {
    collection(newValue) {
      if (newValue) {
        this.makeHandbook();
      }
    }
  },
  methods: {
    handbookLink(url, page) {
      return page ? `${ url }#page=${ page }` : url
    },
    makeHandbook() {
      this.handbook = this.collection.map(item => {
        return {
          ...item,
          sr_chapter: !item.chapter,
          chapter: item.chapter ? item.chapter : this.getChapterFromSection(item.section),
        }
      });
    },
    getChapterFromSection(section) {
      if (typeof section !== 'string' || section.length === 0) {
        return 'Invalid chapter';
      }

      const firstChar = section.charAt(0);
      return `Chapter ${firstChar}`;
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
    },
  },
}
</script>