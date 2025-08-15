<template>
  <main class="onrr-editor">
    <v-drawer
      v-model="codeEditorDrawerOpen"
      title="Edit Source Code"
      icon="code"
      @cancel="codeEditorDrawerOpen = false"
      cancelable="true"
    >
      <input-code 
        :value="sourceCode"
        lineNumber="true"
      />
    </v-drawer>

    <v-drawer
      v-model="imageDrawerOpen"
      title="Add/Edit Image"
      icon="image"
      @cancel="imageDrawerOpen = false"
      cancelable="true"
    >
      <v-upload 
        :from-library="true"
			  :from-url="false"
        class="onrr-image-upload"
      />
    </v-drawer>

    <Editor
      api-key="no-api-key"
      tinymce-script-src="/tinymce-static/tinymce/tinymce.min.js"
      license-key="gpl"
      :init="config"
      @change="handleDirty"
      :initial-value="value"
    />
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { createTinyConfig } from './tinymce/config'

const props = defineProps({
  value: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['input'])

const codeEditorDrawerOpen = ref(false)

const imageDrawerOpen = ref(false)

const sourceCode = ref('')

const config = computed(() => {
  const base = createTinyConfig()

  const replaceItem = (val, from, to) => {
    if (typeof val === 'string') return val.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
    if (Array.isArray(val)) return val.map(v => replaceItem(v, from, to))
    return val
  }

  return {
    ...base,
    toolbar: replaceItem(base.toolbar ?? '', 'image', 'onrrImage'),
    quickbars_image_toolbar: replaceItem(base.quickbars_image_toolbar ?? '', 'quickimage', 'onrrQuickimage'),
    setup(editor) {
      if (typeof base.setup === 'function') base.setup(editor)

      sourceCode.value = editor.getContent({ format: 'html' })

      editor.ui.registry.addButton('onrrImage', {
        icon: 'image',
        tooltip: 'Insert / Edit Image',
        onAction: () => {
          imageDrawerOpen.value = true
        },
      })

      editor.ui.registry.addButton('onrrQuickimage', {
        icon: 'image',
        tooltip: 'Insert Image',
        onAction: () => {
          imageDrawerOpen.value = true
        },
      })

      editor.on('input change SetContent', () => {
        sourceCode.value = editor.getContent({ format: 'html' })
      })

      editor.on('BeforeExecCommand', (e) => {
        if (e.command === 'mceCodeEditor') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          sourceCode.value = editor.getContent({ format: 'html' })
          codeEditorDrawerOpen.value = true
          console.log('code:', editor.getContent({ format: 'html' }))
        }
      })
    },
  }
})

function handleDirty(event, editor) {
  emit('input', editor.getContent())
}
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

  .onrr-image-upload {
    margin: 0 2rem;
      border: var(--theme--border-width) dashed var(--theme--form--field--input--border-color);
      border-radius: var(--theme--border-radius);
  }

  .onrr-image-upload:hover {
    border-color: var(--theme--form--field--input--border-color-hover);
  }

  .onrr-editor .tox-tbtn[aria-label='Insert/edit link'] .tox-icon svg {
    display: none;
  }

  .onrr-editor .tox-tbtn[aria-label='Insert/edit link'] .tox-icon::after {
    display: inline-block;
    margin-block-start: 4px;
    color: var(--theme--form--field--input--foreground);
    font-size: 24px;
    font-family: 'Material Symbols';
    content: 'insert_link';
    font-feature-settings: 'liga';
  }
</style>