<template>
	<v-select
	  :model-value="props.value"
	  :items="items"
	  @update:model-value="(v) => emit('input', v)"
		showDeselect="true"
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
		contacts: contacts_aggregated(groupBy: ["accordion"], filter: { accordion: { _nnull: true } }, limit: -1) {
        group
    }
	}
`;

onMounted(async () => {
	const { data } = await api.post('/graphql', { query });
	items.value = data.data.contacts.map(item => ({
		text: item.group.accordion,
		value: item.group.accordion
	}));
})


</script>
