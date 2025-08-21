<script setup>
import { computed, ref, watch, reactive } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { createTinyConfig } from './tinymce/config'
import InputCodeMirror from './InputCodeMirror.vue';

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
const tinyRef = ref(null)
const codeRef = ref(null)
const lastAppliedFromProps = ref(null)
const folder = ref(null)
const selectedImage = ref(null)
const form = reactive({
  alt: '',
  caption: '',
  width: undefined,
  height: undefined,
  href: '',
  className: '',
})

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

      editor.on('init', () => {
        const incoming = props.value ?? ''
        if (incoming && editor.getContent({ format: 'html' }) !== incoming) {
          editor.setContent(incoming, { format: 'html' })
        }
        sourceCode.value = editor.getContent({ format: 'html' })
        lastAppliedFromProps.value = sourceCode.value
      })

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

      editor.on('input change Undo Redo KeyUp', () => {
        const html = editor.getContent({ format: 'html' })
        sourceCode.value = html
        // If this content matches the last programmatic value, do not emit
        if (lastAppliedFromProps.value === html) return
        // From this point, treat it as a user change
        lastAppliedFromProps.value = null
        emit('input', html)
      })

      editor.on('BeforeExecCommand', (e) => {
        if (e.command === 'mceCodeEditor') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          sourceCode.value = editor.getContent({ format: 'html' })
          codeEditorDrawerOpen.value = true
        }
      })
    },
  }
})

watch(() => props.value, (val) => {
  const html = val ?? ''
  sourceCode.value = html
  lastAppliedFromProps.value = html
  const ed = getTinyEditorInstance()
  if (ed && ed.getContent({ format: 'html' }) !== html) {
    ed.setContent(html, { format: 'html' })
    ed.nodeChanged?.()
  }
})

function getTinyEditorInstance() {
  const comp = tinyRef.value
  if (!comp) return null
  if (comp.editor) return comp.editor
  if (typeof comp.getEditor === 'function') return comp.getEditor()
  return null
}

function applyCodeToEditor(html) {
  const ed = getTinyEditorInstance()
  if (!ed) return

  ed.undoManager?.transact(() => {
    const bm = ed.selection?.getBookmark?.(2, true)
    ed.setContent(html, { format: 'html' })
    if (bm) ed.selection?.moveToBookmark?.(bm)
  })

  ed.nodeChanged?.()
  ed.dispatch?.('change')
  ed.dispatch?.('input')
}

function onSaveFromDrawer() {
  applyCodeToEditor(sourceCode.value)
  codeEditorDrawerOpen.value = false
}

function initFormFromFile(f) {
  selectedImage.value = f
  form.alt = f.title || ''
  form.width = f.width || undefined
  form.height = f.height || undefined
  form.href = `${assetUrl(f.filename_disk)}`
}

function clearSelectedImage() {
  selectedImage.value = null
  form.alt = ''
  form.caption = ''
  form.width = undefined
  form.height = undefined
  form.href = ''
  form.className = ''
}

function escapeAttr(str) {
  return String(str ?? '').replaceAll('"', '&quot;');
}

function handleUploadInput(payload) {
  if (!payload) {
    imageDrawerOpen.value = false
    return
  }
  const f = Array.isArray(payload) ? payload[0] : payload
  if (!f) return
  initFormFromFile(f)
}

function insertReviewedImage() {
  const ed = getTinyEditorInstance()
  const f = selectedImage.value
  if (!ed || !f) return

  const alt = escapeAttr(form.alt ?? f.title ?? '')
  const cls = form.className ? ` class="${escapeAttr(form.className)}"` : ''
  const w = form.width ? ` width="${Number(form.width)}"` : ''
  const h = form.height ? ` height="${Number(form.height)}"` : ''
  const src = assetUrl(f.id)
  const img = `<img src="${src}" alt="${alt}"${w}${h}${cls}>`
  const wrapped = form.href ? `<a href="${escapeAttr(form.href)}">${img}</a>` : img

  const html = form.caption && String(form.caption).trim()
    ? `<figure>${wrapped}<figcaption>${escapeAttr(form.caption)}</figcaption></figure>`
    : `<p>${wrapped}</p>`

  ed.insertContent(html)
  clearSelectedImage()
  imageDrawerOpen.value = false
}

function assetUrl(id) {
  return `/assets/${id}`
}

</script>

<template>
  <main class="onrr-editor">
    <v-drawer
      v-model="codeEditorDrawerOpen"
      title="Edit Source Code"
      icon="code"
      @cancel="codeEditorDrawerOpen = false"
      cancelable="true"
    >
      <template #actions>
        <div class="flex gap-2 items-center">
          <v-button 
            :loading="saving" 
            :icon="true"
            :rounded="true"
            @click="onSaveFromDrawer">
            <v-icon name="check" class="mr-1" />
          </v-button>
        </div>
      </template>
      <InputCodeMirror
        ref="codeRef"
        v-model="sourceCode"
        language="html"
        :height="260"
        :tabSize="2"
        :softWrap="true"
        :disabled="disabled"
      />
    </v-drawer>

    <v-drawer
      v-model="imageDrawerOpen"
      title="Add/Edit Image"
      icon="image"
      @cancel="imageDrawerOpen = false"
      cancelable="true"
    >
      <template #actions>
        <div class="flex gap-2 items-center">
          <v-button 
            :loading="saving" 
            :icon="true"
            :rounded="true"
            @click="insertImage">
            <v-icon name="check" class="mr-1" />
          </v-button>
        </div>
      </template>

      <div v-if="!selectedImage">
        <v-upload 
          :from-library="true"
          :from-url="false"
          :from-user="true"
          :folder="folder"
          @input="handleUploadInput"
          class="onrr-image-upload"
        />
      </div>
      <div v-else class="tw-p-4 space-y-4" style="overflow: auto;">
        <div class="flex tw-gap-4 items-start border rounded tw-p-3" style="background: var(--background-subdued);">
          <img
            :src="assetUrl(selectedImage.id) + '?width=360&format=auto'"
            alt=""
            style="width: 160px; height: auto; border-radius: 6px; object-fit: cover;"
          />

          <div class="tw-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
            <v-input
              :model-value="form.alt"
              label="Alt text"
              name="Alt text"
              placeholder="Describe the image"
              @update:model-value="v => form.alt = v"
            />
            <v-input
              :model-value="form.href"
              label="Link (optional)"
              placeholder="https://example.com"
              @update:model-value="v => form.href = v"
            />
            <v-input
              :model-value="form.width"
              type="number"
              min="1"
              label="Width (px)"
              @update:model-value="v => form.width = v"
            />
            <v-input
              :model-value="form.height"
              type="number"
              min="1"
              label="Height (px)"
              @update:model-value="v => form.height = v"
            />
            <v-input
              :model-value="form.className"
              label="CSS class (optional)"
              placeholder="e.g. img-responsive"
              @update:model-value="v => form.className = v"
            />
            <v-textarea
              :model-value="form.caption"
              label="Caption (optional)"
              placeholder="Short caption under the image"
              @update:model-value="v => form.caption = v"
              :rows="2"
            />
          </div>
        </div>
      </div>
    </v-drawer>

    <Editor
      api-key="no-api-key"
      tinymce-script-src="/tinymce-static/tinymce/tinymce.min.js"
      content_css="default"
      license-key="gpl"
      :init="config"
      :initial-value="value"
      ref="tinyRef"
    />
  </main>
</template>

<style scoped>
  .onrr-editor {
    background-color: var(--background-page);
    border: var(--border-width) solid var(--border-normal);
    border-radius: var(--border-radius);
  }.onrr-editor:focus-within {
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

<style>
@import "./styles/tailwind.css";
</style>