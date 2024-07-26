<template>
    <component :is="listType === 'unordered' ? 'ul' : 'ol'">
        <li v-for="item in items" :key="getKey(item)">
            <div v-html="item.content"></div>
            <NestedList v-if="item.items" :items="item.items" :listType="listType" />
        </li>
    </component>
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

<style scoped>
ol {
  counter-reset: item;
  list-style: none;
}

ol > li {
  counter-increment: item;
  position: relative;
}

ol > li:before {
  content: counters(item, '.') '. ';
  position: absolute;
  left: -1em;
}

ol ol {
  counter-reset: subitem;
}

ol ol > li {
  counter-increment: subitem;
  margin-left: 0.85em;
}

ol ol > li:before {
  content: counters(item, '.') '.' counters(subitem, '.') '. ';
  position: absolute;
  left: -1.9em;
}

ol ol ol {
  counter-reset: subsubitem;
}

ol ol ol > li {
  counter-increment: subsubitem;
  margin-left: 0.85em;
}

ol ol ol > li:before {
  content: counters(item, '.') '.' counters(subitem, '.') '.'
    counters(subsubitem, '.') '. ';
  position: absolute;
  left: -1em;
}
</style>