<template>
	<v-select
	  :model-value="props.value"
	  :items="items"
	  @update:model-value="(v) => emit('input', v)"
		multiple="true"
	/>
</template>

<script setup>
import { useApi } from '@directus/extensions-sdk';
import { ref, onMounted } from 'vue'

const props = defineProps({
  value: String,
});

const emit = defineEmits(['input'])

const items = ref([])

const api = useApi();

const query = `
  query {
    reporter_letters(limit: -1) {
        topics
    }
  }
`;

onMounted(async () => {
	const { data } = await api.post('/graphql', { query });
	const distinctTopics = []
	data.data.reporter_letters.forEach(letter => {
		letter.topics.forEach(topic => {
			if (!distinctTopics.includes(topic)) {
				distinctTopics.push(topic)
			}
		})
	});
	distinctTopics.sort((t1, t2) => t1.localeCompare(t2))
	items.value = distinctTopics.map(item => ({
		text: item,
		value: item
	}));
})


</script>
