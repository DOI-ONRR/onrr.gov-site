<template>
  <v-drawer
    :model-value="modelValue"
    title="Add/Edit Image"
    icon="image"
    cancelable="true"
    @update:model-value="v => $emit('update:modelValue', v)"
    @cancel="$emit('update:modelValue', false)"
  >
    <template #actions>
      <div class="flex gap-2 items-center">
        <v-button
          :loading="saving"
          :icon="true"
          :rounded="true"
          @click="$emit('save')"
        >
          <v-icon name="check" class="mr-1" />
        </v-button>
      </div>
    </template>

    <div v-if="!selectedImage" class="onrr-image-upload">
      <v-upload
        :from-library="true"
        :from-url="false"
        :from-user="true"
        :folder="folder"
        @input="handleUploadInput"
      />
    </div>

    <div v-else class="tw-px-4" style="overflow: auto;">
      <div class="flex tw-gap-4 items-start border rounded tw-p-3" style="background: var(--background-subdued);">
        <img
          :src="thumbnailUrl"
          class="tw-border-solid tw-border-2 tw-border-slate-200 tw-p-2 tw-rounded-md tw-mb-4 tw-w-64 tw-h-auto tw-object-cover tw-mx-auto tw-block"
        />
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-8">
          <div>
            <p class="tw-font-bold tw-ml-1">Alternative Text</p>
            <v-input v-model="localForm.alt" />
          </div>
          <div>
            <p class="tw-font-bold tw-ml-1">Image URL</p>
            <v-input v-model="localForm.href" />
          </div>
          <div>
            <p class="tw-font-bold tw-ml-1">Width</p>
            <v-input
              v-model.number="localForm.width"
              type="number"
              min="1"
            />
          </div>
          <div>
            <p class="tw-font-bold tw-ml-1">Height</p>
            <v-input
              v-model.number="localForm.height"
              type="number"
              min="1"
            />
          </div>
        </div>
      </div>

      <div class="tw-flex tw-justify-between tw-items-center tw-mt-4 tw-px-4">
        <v-button @click="$emit('clear')">
          Clear selection
        </v-button>
      </div>
    </div>
  </v-drawer>
</template>

<script setup>
import { computed, watch, ref, toRaw } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  form: {
    type: Object,
    default: () => ({ id: '', alt: '', width: undefined, height: undefined, href: '' }),
  },
  selectedImage: { type: Object, default: null },
  folder: { type: [String, Object], default: null },
  saving: { type: Boolean, default: false },
  // function prop from parent to generate asset URLs: (idOrFilename: string) => string
  assetUrl: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue', 'update:form', 'upload-input', 'clear', 'save'])

// local copy so we can debounce/validate before syncing, but we keep it simple and sync immediately
const localForm = ref({ ...props.form })

watch(() => props.modelValue, (open) => {
  if (open) {
    // refresh local form from parent each time drawer opens
    localForm.value = { ...props.form }
  }
})

watch(localForm, (v) => {
  // Only sync when the drawer is open to avoid unintentional writes
  if (!props.modelValue) return
  // Emit a plain object (no proxies/refs) to the parent to avoid accidental prop reassignments upstream
  const raw = toRaw(v)
  emit('update:form', {
    id: raw.id || '',
    alt: raw.alt || '',
    width: raw.width,
    height: raw.height,
    href: raw.href || '',
  })
}, { deep: true })

// When a user picks an image from the uploader, update our local form fields
// (and still bubble the raw payload up so the parent can keep selectedImage in sync)
const handleUploadInput = (payload) => {
  const asset = Array.isArray(payload) ? payload[0] : payload
  if (!asset) return

  // Prefer direct id, fallback to filename_disk or nested file object keys some uploaders return
  const key = asset?.id ?? asset?.filename_disk ?? asset?.file?.id ?? asset?.file?.filename_disk

  if (key) {
    localForm.value.id = asset.id || ''
    localForm.value.href = props.assetUrl(key)
  }

  if (asset.width) localForm.value.width = asset.width
  if (asset.height) localForm.value.height = asset.height

  // Only auto-fill alt if user hasn't typed one yet
  if (!localForm.value.alt) {
    localForm.value.alt = asset.title || asset.description || asset.filename_download || ''
  }

  // Keep existing parent behavior
  emit('upload-input', payload)
}

// If the parent updates selectedImage (e.g., from library pick), reflect it into the form
watch(() => props.selectedImage, (img) => {
  if (!img) return
  const key = img.id ?? img.filename_disk
  localForm.value = {
    ...localForm.value,
    id: img.id || '',
    href: key ? props.assetUrl(key) : localForm.value.href,
    width: img.width ?? localForm.value.width,
    height: img.height ?? localForm.value.height,
    alt: localForm.value.alt || img.title || img.description || img.filename_download || '',
  }
}, { immediate: false })

const thumbnailUrl = computed(() => {
  if (!props.selectedImage) return ''
  // prefer id for the /assets endpoint, fallback to filename_disk if needed
  const key = props.selectedImage.id ?? props.selectedImage.filename_disk
  return props.assetUrl(key) + '?width=360&format=auto'
})
</script>

<style scoped>
.onrr-image-upload {
  margin: 0 2rem;
}
.onrr-image-upload:hover {
  border-color: var(--theme--form--field--input--border-color-hover);
}
</style>