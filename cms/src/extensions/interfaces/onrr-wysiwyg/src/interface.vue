<template>
  <main class="onrr-editor">
    
    <link-drawer 
      v-model="linkDrawerOpen" 
      :initial-form="linkInitialForm" 
      :saving="saving" 
      @save="onLinkSave" />

    <code-editor-drawer
      v-model="codeEditorDrawerOpen"
      v-model:code="sourceCode"
      :saving="saving"
      :disabled="disabled"
      @save="onSaveFromDrawer"
    />

    <image-drawer
      v-model="imageDrawerOpen"
      :form="imageForm"
      :selected-image="selectedImage"
      :folder="folder"
      :saving="saving"
      :asset-url="assetUrl"
      @update:form="onUpdateImageForm"
      @upload-input="handleUploadInput"
      @clear="clearSelectedImage"
      @save="insertImage"
      @cancel="cancelImage"
    />

    <glossary-drawer
      v-model="glossaryDrawerOpen"
      :selection-text="glossarySelectionText"
      @select="onGlossarySave"
      @cancel="() => (glossaryDrawerOpen = false)"
    />

    <Editor
      :key="editorKey"
      api-key="no-api-key"
      tinymce-script-src="/wysiwyg-static/tinymce/tinymce.min.js"
      content_css="default"
      license-key="gpl"
      :init="config"
      :initial-value="value"
      ref="tinyRef"
    />
  </main>
</template>

<script setup>
import { computed, ref, watch, reactive, onBeforeUnmount } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { createTinyConfig } from './tinymce/config'
import CodeEditorDrawer from './CodeEditorDrawer.vue'
import LinkDrawer from './LinkDrawer.vue';
import ImageDrawer from './ImageDrawer.vue'
import GlossaryDrawer from './GlossaryDrawer.vue'
import beautify from 'js-beautify'

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
const glossaryDrawerOpen = ref(false)
const glossarySelectionText = ref('')
let glossaryBookmark = null
const sourceCode = ref('')
const tinyRef = ref(null)
const lastAppliedFromProps = ref(null)
const lastEmittedToParent = ref(null)
const folder = ref(null)
const selectedImage = ref(null)
const editorKey = ref(0)
const imageForm = reactive({
  id: '',
  alt: '',
  width: undefined,
  height: undefined,
  href: '',
})

function normalizeNbsp(html) {
  // Normalize TinyMCE/DOM non-breaking spaces so comparisons are stable.
  // - `&nbsp;` (named) and `&#160;` (numeric) often round-trip differently.
  // - `\u00A0` is the raw NBSP character.
  return String(html ?? '')
    .replaceAll('&nbsp;', '\u00A0')
    .replaceAll('&#160;', '\u00A0')
}

function bumpEditorKey() { 
  editorKey.value += 1 
}

function onUpdateImageForm(payload) {
  // Merge incoming changes into our reactive object rather than reassigning the binding
  if (payload && typeof payload === 'object') {
    Object.assign(imageForm, payload)
  }
}

function defaultLinkForm() {
  return {
    href: '',
    text: '',
    title: '',
    openInNewTab: false,
    isButton: false
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

      let alive = true
      editor.on('Remove', () => { alive = false })

      const onlyIfAlive = (fn) => (...args) => { if (alive) fn(...args) }

      editor.on('init', onlyIfAlive(() => {
        const incoming = props.value ?? ''
        if (incoming && editor.getContent({ format: 'html' }) !== incoming) {
          editor.setContent(incoming, { format: 'html' })
        }
        sourceCode.value = editor.getContent({ format: 'html' })
        lastAppliedFromProps.value = sourceCode.value
      }))

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

      editor.on('input change Undo Redo KeyUp', onlyIfAlive(() => {
        const html = editor.getContent({ format: 'html' })
        sourceCode.value = html

        // If this content matches the last programmatic value, do not emit
        if (lastAppliedFromProps.value === html) return

        // From this point, treat it as a user change
        lastAppliedFromProps.value = null

        // Track the exact string we emitted so the prop watcher can avoid re-setting
        // editor content (which can reset the caret) when the parent simply echoes it back.
        lastEmittedToParent.value = html

        emit('input', html)
      }))

      editor.on('BeforeExecCommand', onlyIfAlive((e) => {
        if (e.command === 'mceCodeEditor') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          // Pretty-print with 2-space indent for the source view. TinyMCE re-normalizes
          // the whitespace on save (applyCodeToEditor -> setContent), so this is display-only.
          sourceCode.value = beautify.html(editor.getContent({ format: 'html' }), {
            indent_size: 2,
            wrap_line_length: 0,
            preserve_newlines: true,
          })
          codeEditorDrawerOpen.value = true
        }
        else if (e.command === 'mceOnrrLink') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          linkDrawerOpen.value = true
        }
        else if (e.command === 'mceOnrrGlossary') {
          if (typeof e.preventDefault === 'function') e.preventDefault()
          // Capture the current selection (text + a restorable bookmark) before the drawer
          // takes focus, so we can wrap exactly what the editor highlighted. When the caret
          // is already inside a tagged term (Change term), seed the search with its text.
          const existingTerm = editor.dom.getParent(editor.selection.getNode(), 'span.term')
          glossarySelectionText.value = existingTerm
            ? (existingTerm.textContent || '')
            : (editor.selection.getContent({ format: 'text' }) || '')
          glossaryBookmark = editor.selection.getBookmark?.(2, true)
          glossaryDrawerOpen.value = true
        }
        else if (e.command === 'mceOnrrTable') {
          editor.insertContent(generateTable(), { format: 'html' })
        }
        else if (e.command === 'mceTableProps') {
          e.preventDefault();
          e.stopPropagation?.();
          editor.notificationManager.open({
            text: 'The ONRR WYSIWYG editor does not support editing table properties.',
            type: 'info'
          });
        }
      }))
    },
  }
})

watch(() => props.value, (val) => {
  const html = val ?? ''
  sourceCode.value = html

  const ed = getTinyEditorInstance()
  if (!ed) {
    lastAppliedFromProps.value = html
    return
  }

  // If the parent is simply echoing the latest user edit back into the prop,
  // avoid setContent() to prevent caret resets. Normalize NBSP to handle
  // &nbsp; vs \u00A0 vs &#160; differences.
  const emitted = lastEmittedToParent.value
  if (emitted != null && normalizeNbsp(emitted) === normalizeNbsp(html)) {
    // Clear once we've observed the echo.
    lastEmittedToParent.value = null
    return
  }

  // Apply true external changes (record switches, programmatic updates, etc.)
  lastAppliedFromProps.value = html

  if (normalizeNbsp(ed.getContent({ format: 'html' })) !== normalizeNbsp(html)) {
    ed.setContent(html, { format: 'html' })
    ed.dispatch?.('change')
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
      if (tinymce.activeEditor.dom.hasClass(selectedNode, 'usa-button')) {
        linkInitialForm.value.isButton = true
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

onBeforeUnmount(() => {
  bumpEditorKey()
  const ed = getTinyEditorInstance()
  try {
    ed?.off?.()
    // If the editor is already removed, ed.remove() is a no-op in current Tiny builds
    ed?.remove?.()
  } catch {}
  tinyRef.value = null
});

function getTinyEditorInstance() {
  const comp = tinyRef.value
  if (!comp) return null
  const inst = comp.editor || (typeof comp.getEditor === 'function' ? comp.getEditor() : null)
  // Treat falsy, removed, or missing containers as dead
  if (!inst || inst.removed || !inst.getContainer?.()) return null
  return inst
}

function applyCodeToEditor(html) {
  const ed = getTinyEditorInstance()
  if (!ed) return
  ed.undoManager?.transact(() => {
    const bm = ed.selection?.getBookmark?.(2, true)
    ed.setContent(html, { format: 'html' })
    if (bm) ed.selection?.moveToBookmark?.(bm)
  })
  
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
  
  const html = `
<div class="d-flex justify-start">
  <figure class="figure-block">
    <img
      src="${src}"
      alt="${alt}"
      ${w}
      ${h}
      class="img-block"
      loading="lazy"
      data-id="${imageForm.id}" 
      data-filename-disk="${f.filename_disk}" />
  </figure>
</div>`.trim();

  ed.insertContent(html)
  clearSelectedImage()
  imageDrawerOpen.value = false
}

function cancelImage() {
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
    const target = linkForm.openInNewTab ? '_blank' : linkForm.href.toLowerCase().endsWith('pdf') ? '_blank' : '_self'
    var classes = 'usa-link'
    const match = linkForm.href.toLowerCase().match(/\.([^\.]+)$/);
    if (match) {
      switch (match[1]) {
        case 'pdf':
          classes += ' onrr-link-pdf';
          break;
      
        case 'pptx':
          classes += ' onrr-link-powerpoint';
          break;

        case 'docx':
          classes += ' onrr-link-word';
          break;
        
        case 'xlsx':
          classes += ' onrr-link-excel';
          break;
        
        case 'txt':
          classes += ' onrr-link-text';
          break;
        
        default:
          break;
      }
    }

    if (linkForm.isButton) {
      classes += ' usa-button'
    }

    const targetUrl = new URL(linkForm.href, window.location.href);
    const browserHost = window.location.host;

    if (targetUrl.host !== browserHost) {
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

  })
}

// Slug scheme must match the frontend (glossary.vue / useGlossary.js) so data-term
// resolves to the right glossary entry at render time.
function glossarySlug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Wrap the highlighted text in <span class="term" data-term="slug">…</span>. The definition
// is NOT stored here — it's resolved from glossary_terms on the frontend. If nothing was
// selected, the term's own name is inserted.
function onGlossarySave(term) {
  const editor = getTinyEditorInstance()
  if (!editor) {
    glossaryDrawerOpen.value = false
    return
  }
  editor.undoManager.transact(() => {
    if (glossaryBookmark) editor.selection.moveToBookmark(glossaryBookmark)
    const slug = glossarySlug(term.term)
    const existing = editor.dom.getParent(editor.selection.getNode(), 'span.term')
    if (existing) {
      // Already tagged (Change term) — re-point this span instead of nesting a new one.
      editor.dom.setAttrib(existing, 'data-term', slug)
      editor.selection.select(existing)
    } else {
      const text = editor.selection.getContent({ format: 'text' }) || term.term
      const span = `<span class="term" data-term="${slug}">${editor.dom.encode(text)}</span>`
      editor.insertContent(span)
    }
  })
  editor.dispatch?.('change')
  glossaryBookmark = null
  glossarySelectionText.value = ''
  glossaryDrawerOpen.value = false
}

function assetUrl(filenameDisk) {
  return `/assets/${filenameDisk}`
}

function generateTable() {
  return `
    <table class="usa-table usa-table--borderless usa-table--striped">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row"></th>
          <td></td>
        </tr>
        <tr>
          <th scope="row"></th>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

</script>

<style scoped>
  .onrr-editor {
    background-color: var(--background-page);
    border: var(--theme--border-width) solid var(--theme--form--field--input--border-color);
    border-radius: var(--theme--border-radius);
  }
  
  .onrr-editor:focus-within {
    border-color: var(--primary);
  }

</style>

<style>
@import "./styles/tailwind.css";

/* Match the native Directus WYSIWYG (Tiptap) toolbar: subdued background + subtle divider.
   Non-scoped so the rules reach TinyMCE's dynamically-created .tox toolbar elements. */
.onrr-editor .tox .tox-editor-header,
.onrr-editor .tox .tox-toolbar-overlord,
.onrr-editor .tox .tox-toolbar__primary {
  background-color: var(--theme--background-subdued, #f7fafc);
}
.onrr-editor .tox .tox-editor-header {
  border-bottom: 1px solid var(--theme--border-color, #e4eaf1) !important;
  padding: 0px !important;
  box-shadow: none !important;
}

.onrr-editor .tox .tox-tbtn {
  background: none !important;
}

.onrr-editor .tox-tinymce {
  border: none;
}
</style>