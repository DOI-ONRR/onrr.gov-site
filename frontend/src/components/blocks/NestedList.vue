<template>
    <ul>
        <li v-for="item in items" :key="getKey(item)">
            <div v-html="item.content"></div>
            <NestedList v-if="item.items" :items="item.items" :listType="listType"/>
        </li>
    </ul>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'NestedList',
    props: {
        items: {
            type: Array,
            required: true
        },
        listType: {
            type: String,
            required: true
        }
    },
    methods: {
        getKey() {
            return uuidv4();
        }
    }
}
</script>
