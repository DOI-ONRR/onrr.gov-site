<template>
  <v-drawer
    :model-value="modelValue"
    :title="title"
    icon="code"
    @update:model-value="v => $emit('update:modelValue', v)"
    @cancel="$emit('update:modelValue', false)"
    cancelable="true"
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

    <InputCodeMirror
      v-model="localCode"
      language="html"
      :height="height"
      :tabSize="tabSize"
      :softWrap="softWrap"
      :disabled="disabled"
    />
  </v-drawer>
</template>

<script setup>
import { computed } from 'vue'
import InputCodeMirror from './InputCodeMirror.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },     // drawer open/close
  code: { type: String, default: '' },               // source code
  saving: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: 'Edit Source Code' },
  height: { type: Number, default: 260 },
  tabSize: { type: Number, default: 2 },
  softWrap: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'update:code', 'save'])

const localCode = computed({
  get: () => props.code,
  set: (v) => emit('update:code', v),
})
</script>