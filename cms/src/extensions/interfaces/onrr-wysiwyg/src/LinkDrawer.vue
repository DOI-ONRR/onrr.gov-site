<template>
  <v-drawer
    :model-value="modelValue"
    @update:model-value="v => $emit('update:modelValue', v)"
    :title="title"
    icon="link"
    cancelable="true"
    @cancel="onCancel"
  >
    <template #actions>
      <div class="flex gap-2 items-center">
        <v-button :loading="saving" :icon="true" :rounded="true" @click="onSave">
          <v-icon name="check" class="mr-1" />
        </v-button>
      </div>
    </template>

    <div class="tw-px-4">
      <div class="flex tw-gap-4 items-start border rounded tw-p-3" style="background: var(--background-subdued);">
        <div class="tw-grid tw-grid-cols-2 tw-gap-8 tw-mt-0">
          <div class="tw-col-span-2">
            <document-lookup ref="documentLookupRef" @item-selected="onDocumentSelected" />
          </div>

          <div>
            <p class="tw-font-bold tw-ml-1 tw-mb-2">URL</p>
            <v-input v-model="form.href" aria-label="Link URL" />
          </div>

          <div>
            <p class="tw-font-bold tw-ml-1 tw-mb-2">Display Text</p>
            <v-input :model-value="form.text" @update:model-value="v => form.text = v" aria-label="Link display text" />
          </div>

          <div>
            <p class="tw-font-bold tw-ml-1 tw-mb-2">Tooltip</p>
            <v-input :model-value="form.title" @update:model-value="v => form.title = v" aria-label="Link tooltip" />
          </div>

          <div>
            <p class="tw-font-bold tw-ml-1 tw-mb-2">Open link in</p>
            <v-checkbox class="block" v-model="form.openInNewTab" @update:value="v => form.openInNewTab = v">
              New Tab
            </v-checkbox>
          </div>

          <div>
            <v-checkbox class="block" v-model="form.isButton" @update:value="v => form.isButton = v">
              Style as button
            </v-checkbox>
          </div>
        </div>
      </div>
    </div>
  </v-drawer>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import DocumentLookup from './DocumentLookup.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  initialForm: {
    type: Object,
    default: () => ({ href: '', text: '', title: '', openInNewTab: false, isButton: false }),
  },
  saving: { type: Boolean, default: false },
  title: { type: String, default: 'Add/Edit Link' },
  autoFocus: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const form = ref({ ...props.initialForm })
const documentLookupRef = ref(null)

watch(() => props.modelValue, async (open) => {
  if (open) {
    form.value = { ...props.initialForm }
    if (props.autoFocus) {
      await nextTick()
      await new Promise(requestAnimationFrame)
      const root = documentLookupRef.value?.$el ?? documentLookupRef.value
      if (root) {
        const selector = [
          'input:not([disabled]):not([type="hidden"])',
          'textarea:not([disabled])',
          'select:not([disabled])',
          '[tabindex]:not([tabindex="-1"])'
        ].join(',')
        const el = root.querySelector?.(selector)
        el?.focus?.()
      }
    }
  } else {
    // reset on close
    form.value = { href: '', text: '', title: '', openInNewTab: false, isButton: false }
  }
})

function onDocumentSelected(selected) {
  form.value.href = `${selected.path}${selected.href}`
  if (!form.value.text) form.value.text = selected.name
}

function onSave() {
  // minimal validation example (optional)
  if (!form.value.href) {
    // you could emit an error, show a message, or disable button until valid
    return
  }
  emit('save', { ...form.value })
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>