<template>
  <v-drawer
    :model-value="modelValue"
    @update:model-value="v => $emit('update:modelValue', v)"
    title="Tag glossary term"
    icon="bookmark"
    cancelable="true"
    @cancel="onCancel"
  >
    <div class="tw-px-4">
      <div class="border rounded tw-p-3" style="background: var(--background-subdued);">
        <p v-if="selectionText" class="tw-mb-3">
          Tagging: <strong>&ldquo;{{ selectionText }}&rdquo;</strong>
        </p>
        <p v-else class="help-text tw-mb-3">
          No text is selected — the term's name will be inserted.
        </p>

        <p class="tw-font-bold tw-ml-1 tw-mb-2">Search glossary</p>
        <v-input
          ref="searchRef"
          :model-value="query"
          placeholder="Start typing a term…"
          @update:model-value="onQuery"
        >
          <template #prepend><v-icon name="search" /></template>
        </v-input>

        <v-progress-linear v-if="loading" indeterminate class="tw-mt-2" />

        <ul v-if="results.length" class="glossary-results tw-mt-3">
          <li
            v-for="t in results"
            :key="t.id"
            class="glossary-result"
            tabindex="0"
            @click="choose(t)"
            @keydown.enter.prevent="choose(t)"
          >
            <div class="glossary-result__term">{{ t.term }}</div>
            <div class="glossary-result__def">{{ truncate(t.definition) }}</div>
          </li>
        </ul>
        <p v-else-if="query && !loading" class="help-text tw-mt-3">
          No matching terms found.
        </p>
      </div>
    </div>
  </v-drawer>
</template>

<script setup>
import { useApi } from '@directus/extensions-sdk'
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  selectionText: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'select', 'cancel'])

const api = useApi()
const query = ref('')
const results = ref([])
const loading = ref(false)
const searchRef = ref(null)
let debounceId = null

watch(() => props.modelValue, async (open) => {
  if (open) {
    query.value = props.selectionText || ''
    await nextTick()
    const root = searchRef.value?.$el ?? searchRef.value
    root?.querySelector?.('input')?.focus?.()
    search(query.value)
  } else {
    results.value = []
    query.value = ''
    clearTimeout(debounceId)
  }
})

function onQuery(v) {
  query.value = v
  clearTimeout(debounceId)
  debounceId = setTimeout(() => search(v), 200)
}

async function search(term) {
  loading.value = true
  try {
    const params = { fields: 'id,term,definition', sort: 'term', limit: 25 }
    if (term) params.search = term
    const { data } = await api.get('/items/glossary_terms', { params })
    results.value = data?.data ?? []
  } catch (e) {
    results.value = []
  } finally {
    loading.value = false
  }
}

function choose(t) {
  emit('select', t)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function truncate(s, n = 120) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n).trimEnd()}…` : s
}
</script>

<style>
.glossary-results {
  list-style: none;
  padding-left: 0;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;
}
.glossary-result {
  padding: 0.5rem 0.75rem;
  border-radius: var(--theme--border-radius);
  cursor: pointer;
}
.glossary-result:hover,
.glossary-result:focus {
  background: var(--theme--background-subdued);
  outline: none;
}
.glossary-result__term {
  font-weight: 700;
}
.glossary-result__def {
  font-size: 0.9rem;
  color: var(--theme--foreground-subdued);
}
.help-text {
  color: var(--theme--foreground-subdued);
  font-size: 0.95rem;
}
</style>
