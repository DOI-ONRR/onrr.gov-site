<template>
    <div class="pt-4">
        <v-card>
            <v-card-title>
            <SelectField :fields="topicsInputField"></SelectField>
            <v-spacer></v-spacer>
            <TextField :fields="titleInputField"></TextField>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="collection"
                item-key="title">
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
const SelectField = () => import(/* webpackChunkName: "SelectField" */ '@/components/inputs/SelectField')
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')

import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'

export default {
    name: 'Rulemakings',
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
        SelectField,
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

            this.topicsInputField.items = ["All", ...topicArr.sort()]
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
            if (!this.topicsInputField.selected || this.topicsInputField.selected === 'All') {
                return true
            }

            return value.includes(this.topicsInputField.selected)
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
}
</script>

<style lang="scss" scoped>
</style>