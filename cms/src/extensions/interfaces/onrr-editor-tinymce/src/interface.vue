<template>
  <main class="onrr-editor">
    
    <link-drawer 
      v-model="linkDrawerOpen" 
      :initial-form="linkInitialForm" 
      :saving="saving" 
      @save="onLinkSave" />

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
      <div v-else class="tw-px-4" style="overflow: auto;">
        <div class="flex tw-gap-4 items-start border rounded tw-p-3" style="background: var(--background-subdued);">
          <img
            :src="assetUrl(selectedImage.id) + '?width=360&format=auto'"
            class="tw-border-solid tw-border-2 tw-border-slate-200 tw-p-2 tw-rounded-md tw-mb-4 tw-w-64 tw-h-auto tw-object-cover tw-mx-auto tw-block"
          />

          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-8" >
            <div>
              <p class="tw-font-bold tw-ml-1">Alternative Text</p>
              <v-input
                v-model="imageForm.alt"
              />
            </div>
            <div>
              <p class="tw-font-bold tw-ml-1">Image URL</p>
              <v-input
                :model-value="imageForm.href"
                @update:model-value="v => imageForm.href = v"
              />
            </div>
            <div>
              <p class="tw-font-bold tw-ml-1">Width</p>
              <v-input
                :model-value="imageForm.width"
                type="number"
                min="1"
                @update:model-value="v => imageForm.width = v"
              />
            </div>
            <div>
              <p class="tw-font-bold tw-ml-1">Height</p>
              <v-input
                :model-value="imageForm.height"
                type="number"
                min="1"
                @update:model-value="v => imageForm.height = v"
              />
            </div>
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

<script setup>
import { computed, ref, watch, reactive, nextTick } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { createTinyConfig } from './tinymce/config'
import InputCodeMirror from './InputCodeMirror.vue';
import LinkDrawer from './LinkDrawer.vue';

const props = defineProps({
  value: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['input'])

const codeEditorDrawerOpen = ref(false)
const imageDrawerOpen = ref(false)
const linkDrawerOpen = ref(false)
const sourceCode = ref('')
const tinyRef = ref(null)
const codeRef = ref(null)
const lastAppliedFromProps = ref(null)
const folder = ref(null)
const selectedImage = ref(null)
const imageForm = reactive({
  id: '',
  alt: '',
  width: undefined,
  height: undefined,
  href: '',
})

function defaultLinkForm() {
  return {
    href: '',
    text: '',
    title: '',
    openInNewTab: false,
  }
}

const linkInitialForm = ref(defaultLinkForm())

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
          const node = editor.selection.getNode();
          if (node?.nodeName !== 'IMG') {
            imageDrawerOpen.value = true
            return;
          }

          const data = {
            href: assetUrl(editor.dom.getAttrib(node, 'data-filename-disk')) || '',
            alt: editor.dom.getAttrib(node, 'alt') || '',
            width: editor.dom.getAttrib(node, 'width') || editor.dom.getStyle(node, 'width') || '',
            height: editor.dom.getAttrib(node, 'height') || editor.dom.getStyle(node, 'height') || '',
            id: editor.dom.getAttrib(node, 'data-id') || ''
          }

          openImageDrawer(data)
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
        else if (e.command === 'mceOnrrLink') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          linkDrawerOpen.value = true
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

watch (() => linkDrawerOpen.value, async (val) => {
  if (val) {
    const ed = getTinyEditorInstance()
    const nodeType = ed.selection.getNode().nodeName
    const selectedNode = ed.selection.getNode()
    if (nodeType == 'A') {
      linkInitialForm.value.title = selectedNode.getAttribute('title')
      linkInitialForm.value.href = selectedNode.getAttribute('href')
      linkInitialForm.value.text = selectedNode.getHTML()
      const target = selectedNode.getAttribute('target')
      if (target == '_blank') {
        linkInitialForm.value.openInNewTab = true
      }
    }
    else {
      const selectedRange = ed.selection.getRng()
      if (selectedRange.startOffset !== selectedRange.endOffset) {
        const selectedText = selectedRange.commonAncestorContainer.data
        linkInitialForm.value.text = selectedText.substring(selectedRange.startOffset, selectedRange.endOffset)
      }
    }
  } else {
    linkInitialForm.value = defaultLinkForm()
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
  imageForm.id = f.id || ''
  imageForm.alt = f.title || ''
  imageForm.width = f.width || undefined
  imageForm.height = f.height || undefined
  imageForm.href = `${assetUrl(f.filename_disk)}`
}

function clearSelectedImage() {
  selectedImage.value = null
  imageForm.id = ''
  imageForm.alt = ''
  imageForm.width = undefined
  imageForm.height = undefined
  imageForm.href = ''
}

function escapeAttr(str) {
  return String(str ?? '').replaceAll('"', '&quot;');
}

function openImageDrawer(initial) {
  selectedImage.value = { ...selectedImage.value, ...initial };
  Object.assign(imageForm, initial);
  imageDrawerOpen.value = true;
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

function insertImage() {
  const ed = getTinyEditorInstance()
  const f = selectedImage.value
  if (!ed || !f) return

  const alt = escapeAttr(imageForm.alt ?? '')
  const w = imageForm.width ? ` width="${Number(imageForm.width)}"` : ''
  const h = imageForm.height ? ` height="${Number(imageForm.height)}"` : ''
  const src = imageForm.href
  const img = `<img src="${src}" alt="${alt}"${w}${h} data-id="${imageForm.id}" data-filename-disk="${f.filename_disk}">`

  const html = `<p>${img}</p>`

  ed.insertContent(html)
  clearSelectedImage()
  imageDrawerOpen.value = false
}

function onLinkSave(linkForm) {
  const editor = getTinyEditorInstance()
  if (!editor) return

  editor.undoManager.transact(() => {
    const selection = editor.selection;
    const dom = editor.dom;

    const url = linkForm.href
    const displayText = linkForm.text
    const title = linkForm.title
    const target = linkForm.openInNewTab ? '_blank' : '_self';
    var classes = 'usa-link'
    if (linkForm.openInNewTab) {
      classes += ' usa-link--external'
    }

    let anchor = dom.getParent(selection.getNode(), 'a[href]');

    if (anchor) {
      if (url != null) dom.setAttrib(anchor, 'href', url);
      dom.setAttrib(anchor, 'target', target)
      dom.setAttrib(anchor, 'title', title)
      dom.setAttrib(anchor, 'class', classes)

      if (typeof displayText === 'string') {
        const rng = dom.createRng();
        rng.selectNodeContents(anchor);
        selection.setRng(rng);
        selection.setContent(dom.encode(displayText));
      }

      selection.select(anchor);
      editor.nodeChanged();
      linkInitialForm.value = defaultLinkForm()
      linkDrawerOpen.value = false
      return;
    } 

    const link = `<a href="${url}" target="${target}" title="${title}" class="${classes}">${displayText}</a>`

    editor.insertContent(link)
    linkInitialForm.value = defaultLinkForm()
    linkDrawerOpen.value = false
    const newAnchor = dom.getParent(selection.getNode(), 'a[href]');
    if (newAnchor) selection.select(newAnchor);
    editor.nodeChanged();

  })
}

function assetUrl(filenameDisk) {
  return `/assets/${filenameDisk}`
}

</script>

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

</style>

<style>
@import "./styles/tailwind.css";
</style>