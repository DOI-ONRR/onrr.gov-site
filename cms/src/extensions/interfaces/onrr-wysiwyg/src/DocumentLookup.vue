<template>
  <div>
    <p class="tw-font-bold tw-ml-1 tw-mb-2">Document Lookup</p>
    <v-input id="documentLookup" type="text" ref="documentLookupRef"/>
    <p class="help-text tw-mt-2 tw-ml-1">Start typing to find and select a document from the list.</p>
  </div>
</template>

<script setup>
import { useApi } from '@directus/extensions-sdk';
import autoComplete from "@tarekraafat/autocomplete.js";
import { ref, onMounted } from "vue";

const documentLookupRef = ref(null)

const emit = defineEmits(["item-selected"])

function focus() { documentLookupRef.value?.focus() }

defineExpose({ focus })

const api = useApi();


const config = {
  selector: "#documentLookup",
  wrapper: false,
  data: {
    src: async (searchTerm) => {
      const { data } = await api.get('/link-autocomplete', { params: { term: searchTerm } });
      // Support either `{ items: [...] }` or `{ data: { items: [...] } }` from the endpoint
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data?.items) ? data.data.items : [];
      return items;
    },
    keys: ['name', 'href']
  },
  resultItem: {
    class: 'result-item',
    highlight: 'content-item-highlight',
    element: (item, data) => {
      item.innerHTML = `<div><div>${data.value.name}</div><div>${data.value.href}</div></div>`
    }
  }
}

onMounted(async () => {
  const autoCompleteJS = new autoComplete(config);

  document.querySelector("#documentLookup").addEventListener("selection", function (event) {
    const feedback = event.detail;
    const selection = feedback.selection.value[feedback.selection.key];
    autoCompleteJS.input.blur();
    autoCompleteJS.input.value = selection;
    autoCompleteJS.input.value = selection;
    emit("item-selected", feedback.selection.value)
  });
})

</script>

<style>
  #documentLookup + ul {
    position: absolute;
    top: 100%;
    left: -2px;
    right: 0;
    background: white;
    border: var(--theme--border-width) solid var(--v-input-border-color, var(--theme--form--field--input--border-color));
    border-radius: var(--v-input-border-radius, var(--theme--border-radius));
    z-index: 1000;
    width: calc(100% + 4px);
    list-style: none;
    padding-left: 0;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .result-item {
    font-size: 1rem;
    padding-left: 1rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem
  }

  .result-item:hover {
    background-color: var(--theme--background-subdued);
  }

  .content-item-highlight {
    font-weight: bold;
    background-color: transparent;
  }

  .help-text {
    color: var(--theme--foreground-subdued);
    font-size: 0.975rem;
  }
</style>