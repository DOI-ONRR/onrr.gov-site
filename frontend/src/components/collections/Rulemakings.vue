<template>
    <div class="pt-4">
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
                <template v-slot:item.rule_title="{ item }">
                    <a :href="item.webpage_link">{{ item.rule_title }}</a><br>
                    <span v-if="item.informal_title">"{{ item.informal_title }}"</span>
                </template>
                <template v-slot:item.date="{ item }">
                    {{ formatNiceDate(item.date) }}
                </template>
                <template v-slot:item.commodity_subject_matter="{ item }">
                    {{ getTopics(item.commodity_subject_matter) }}
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>

<script>
const MultipleSelectField = () => import(/* webpackChunkName: "MultipleSelectField" */ '@/components/inputs/MultipleSelectField')
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')

import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'

export default {
    name: 'RulemakingsCollection',
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
    components: {
        MultipleSelectField,
        TextField
    },
    props: {
        collection: [Array, Object]
    },
    methods: {
        getFullDate: getFullDate,
        getYear: getYear,
        getMonth: getMonth,
        getDay: getDay,
        topicList() {
            let topicArr = []
            this.collection.map(item => {
                if (item.commodity_subject_matter && item.commodity_subject_matter.length > 0) {
                item.commodity_subject_matter.map(topic => {
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
        getTopics(topicsArr) {
            let topics
            if(topicsArr.length > 1) {
                topics = topicsArr.join(', ')
            } else {
                topics = topicsArr[0]
            }
            return topics
        },
        titleFilter(value) {
            if (!this.titleInputField.text) {
                return true
            }

            return value.toLowerCase().includes(this.titleInputField.text.toLowerCase())
        },
        topicsFilter(value) {
            if (!this.topicsInputField.selected || this.topicsInputField.selected === null || this.topicsInputField.selected.length === 0) {
                return true
            }

            return value.some(item => this.topicsInputField.selected.indexOf(item) >= 0)
        },
        formatNiceDate(d) {
            return `${ getMonth(d, 'numeric') }/${ getDay(d, 'numeric') }/${ getYear(d) }`
        }
    },
    computed: {
        headers()  {
            return [
                {
                    text: 'Final Publication Date',
                    align: 'start',
                    sortable: true,
                    value: 'final_publication_date',
                    // filter: this.titleFilter,
                },
                {
                    text: 'RIN',
                    align: 'start',
                    sortable: true,
                    value: 'rin'
                },
                {
                    text: 'Rule Title',
                    align: 'start',
                    sortable: true,
                    value: 'rule_title',
                    filter: this.titleFilter,
                },
                {
                    text: 'Topics',
                    align: 'start',
                    sortable: false,
                    value: 'commodity_subject_matter',
                    filter: this.topicsFilter,
                }
            ]
        }
    },
    created() {
        setTimeout(function () { this.topicList() }.bind(this), 500)
    },
    mounted() {
        const topics = this.$route.query.topic.split(',')
        this.topicsInputField.selected = topics || null
    }
}
</script>

<style lang="scss" scoped>
</style>