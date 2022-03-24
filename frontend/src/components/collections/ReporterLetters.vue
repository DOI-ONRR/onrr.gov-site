<template>
  <div>
    <div v-if="collectionLayout === 'basic'">
      <v-list dense>
        <v-list-item-group
            color="secondary"
          >
            <v-list-item
              v-for="(item, i) in slicedCollection"
              :key="i"
              :href="fileLink('/reporter-letters/', item)"
              class="pa-0"
              target="_blank"
            >
              <v-list-item-icon class="mr-1">
                <v-icon color="secondary">mdi-file-pdf-box</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title" class="secondary--text text-body-1 text-wrap text-decoration-underline"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
        </v-list-item-group>
      </v-list>
      <div class="text-center">
        <v-btn
          color="secondary"
          href="/references/reporter-letters"
          class="mx-auto">View All</v-btn>
      </div>
    </div>
    <div v-if="collectionLayout === 'full'">
      <v-card>
        <v-data-table
            :headers="headers"
            :items="collection"
            item-key="title">
            <template v-slot:top>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <MultipleSelectField :fields="topicsInputField"></MultipleSelectField>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <TextField :fields="titleInputField"></TextField>
                        </v-col>
                    </v-row>
                </v-container>
            </template>
            <template v-slot:header.title="{ header }">
                <div class="text-h6 text-capitalize">{{ header.text}}</div>
            </template>
            <template v-slot:header.date="{ header }">
                <div class="text-h6 text-capitalize">{{ header.text }}</div>
            </template>
            <template v-slot:header.topics="{ header }">
                <div class="text-h6 text-capitalize">{{ header.text }}</div>
            </template>
            <template v-slot:item.title="{ item }">
                <a :href="fileLink('/reporter-letters/',item)" target="_blank">{{ item.title }}</a><v-icon right color="secondary">mdi-file-pdf-box</v-icon>
                <div v-if="item.accessible_file"><a :href="fileLink('/reporter-letters/',item)" target="_blank">{{ item.title }}</a>&nbsp;(Accessible.docx)</div>
            </template>
            <template v-slot:item.date="{ item }">
                {{ formatNiceDate(item.date) }}
            </template>
            <template v-slot:item.topics="{ item }">
                {{ getTopics(item.topics) }}
            </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script>
import { 
  fileCollectionMixin,
  dateMixin
} from '@/mixins'
import { formatToSlug } from '@/js/utils'
const MultipleSelectField = () => import(/* webpackChunkName: "MultipleSelectField" */ '@/components/inputs/MultipleSelectField')
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')

export default {
  name: 'ReporterLettersCollection',
  mixins: [fileCollectionMixin, dateMixin],
  data: () => ({
    titleInputField: {
      label: 'Search',
      text: '',
      ref: 'searchInput',
      color: 'secondary',
      icon: 'mdi-magnify',
    },
    topicsInputField: {
      items: [],
      label: 'All Topics',
      ref: 'topicSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'topic'
    }
  }),
  props: {
    // collection: [Array, Object],
    // collectionName: String,
    // collectionLayout: String,
  },
  components: {
    MultipleSelectField,
    TextField,
  },
  methods: {
    getTopics(topicsArr) {
      let topics
      if(topicsArr.length > 1) {
        topics = topicsArr.join(', ')
      } else {
        topics = topicsArr[0]
      }
      return topics
    },
    topicList() {
      let topicArr = []
      this.collection.map(item => {
        if (item.topics && item.topics.length > 0) {
          item.topics.map(topic => {
            if (!topicArr.includes(topic)) {
              topicArr.push(topic)
            }
          })
        } else if (!topicArr.includes(item)) {
            topicArr.push(item)
        }
        
      })

      this.topicsInputField.items = [...topicArr.sort()]
    },
    titleFilter(value) {
      if (!this.titleInputField.text) {
        return true
      }

      return value.toLowerCase().includes(this.titleInputField.text.toLowerCase())
    },
    topicsFilter(value) {
        // console.log('topcis filter value --------> ', value)
        if (!this.topicsInputField.selected || this.topicsInputField.selected === null || this.topicsInputField.selected.length === 0) {
            return true
        }

        return value.some(item => this.topicsInputField.selected.indexOf(item) >= 0)
    },
    addParamsToLocation(params) {
      const query = { path: this.$route.fullPath, ...this.$route.query, query: params }
      this.$router.push(query).catch(() => {})
    },
    formattedLabel(label) {
      return formatToSlug(label)
    },
  },
  computed: {
    headers()  {
      return [
        {
          text: 'Reporter Letters',
          align: 'start',
          sortable: false,
          value: 'title',
          filter: this.titleFilter,
        },
        {
          text: 'Date',
          align: 'start',
          sortable: true,
          value: 'date'
        },
        {
          text: 'Topics',
          align: 'start',
          sortable: false,
          value: 'topics',
          filter: this.topicsFilter,
        }
      ]
    },
  },
  created() {
    setTimeout(function () { this.topicList() }.bind(this), 500)
  },
  mounted() {
    const topics = this.$route.query.topic && this.$route.query.topic.split(',')
    this.topicsInputField.selected = topics || null
  }
}
</script>

<style lang="scss" scoped>
.v-card__title {
  align-items: flex-start;
}

.v-list-item--active:before {
  opacity: 0;
  background-color: none;
}

.v-list-item--link:before {
  background-color: none;
}
</style>