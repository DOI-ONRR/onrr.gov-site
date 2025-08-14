<template>
  <main class="onrr-editor">
    <editor
      api-key="no-api-key"
      tinymce-script-src="/tinymce-static/tinymce/tinymce.min.js"
      license-key="gpl"
      :init="config"
      @change="handleDirty"
      :initial-value="value"
    />
  </main>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import { default as myConfig } from './tinymce/config'
export default {
  components: {
    Editor
  },
	props: {
		value: {
			type: String,
			default: null,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		return { handleChange, handleDirty };

		function handleChange(value) {
      emit('input', value);
		}

    function handleDirty(event, editor) {
      emit('input', editor.getContent());
    }
	},
  computed: {
    config: function() {
      return myConfig.config;
    }
  }
};
</script>

<style scoped>
  .onrr-editor {
    background-color: var(--background-page);
    border: var(--border-width) solid var(--border-normal);
    border-radius: var(--border-radius);
  }

  .onrr-editor:hover {
    border-color: var(--border-normal-alt);
  }

  .onrr-editor:focus-within {
    border-color: var(--primary);
  }
</style>