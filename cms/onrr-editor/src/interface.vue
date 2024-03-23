<script setup>
  import { computed } from 'vue'
  import Editor from '@tinymce/tinymce-vue'
  import { default as myConfig } from './tinymce/config'

  const config = computed(() => {
    return myConfig.config
  })
</script>

<template>
  <main id="sample">
    <editor
      api-key="1hrdiaheqykohhfo7c2kwhm7i3anqrhnr1njlltbu38hfxtx"
      :init="config"
    />
  </main>
</template>

<script>
export default {
	props: {
		value: {
			type: String,
			default: null,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		return { handleChange };

		function handleChange(value) {
			emit('input', value);
		}
	},
};
</script>

<style scoped>
@media (min-width: 1024px) {
  #sample {
    width: 100%;
  }
}
</style>
