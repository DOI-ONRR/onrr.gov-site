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

onMounted(async () => {
	const { data } = await api.get('/contacts/accordions');
	items.value = data.accordions.map(item => ({
		text: item,
		value: item
	}));
})


</script>
