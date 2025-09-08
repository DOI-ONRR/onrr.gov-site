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
        @input="payload => $emit('upload-input', payload)"
        class="onrr-image-upload"
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
            <v-input
              :model-value="localForm.href"
              @update:model-value="v => (localForm.href = v)"
            />
          </div>
          <div>
            <p class="tw-font-bold tw-ml-1">Width</p>
            <v-input
              :model-value="localForm.width"
              type="number"
              min="1"
              @update:model-value="v => (localForm.width = v)"
            />
          </div>
          <div>
            <p class="tw-font-bold tw-ml-1">Height</p>
            <v-input
              :model-value="localForm.height"
              type="number"
              min="1"
              @update:model-value="v => (localForm.height = v)"
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
import { computed, watch, ref } from 'vue'

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
  emit('update:form', { ...v })
}, { deep: true })

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
  border: var(--theme--border-width) dashed var(--theme--form--field--input--border-color);
  border-radius: var(--theme--border-radius);
}
.onrr-image-upload:hover {
  border-color: var(--theme--form--field--input--border-color-hover);
}
</style>