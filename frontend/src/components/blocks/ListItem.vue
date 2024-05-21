<template>
    <span>
        <li v-html="content"></li>
        <component 
            v-if="items.length > 0"
            :is="listStyle === 'unordered' ? 'ul' : 'ol'"
        >
            <list-item v-for="item in items" :content="item.content" :items="item.items" :listStyle="listStyle" :key="getUuid(item)"/>
        </component>
    </span>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
    name: "ListItem",
    props: {
        content: {
            type: String,
            required: true
        },
        items: {
            type: Array
        },
        listStyle: {
            type: String,
            default: 'unordered'
        }
    },
    methods: {
        getUuid() {
            return uuidv4();
        }
    }
}
</script>
