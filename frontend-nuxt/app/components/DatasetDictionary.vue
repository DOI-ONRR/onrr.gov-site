<script setup>
/*
  DatasetDictionary — the "Data dictionary" section for a dataset page, rendered by
  DatasetView. Content comes from dataset_metadata.data_dictionary (O2M to
  data_dictionary_fields; each field has an ordered O2M `values`). Three row shapes:
    - simple field: field_name + definition
    - value_style "rows": the field, then an indented sub-row per value (term + definition)
    - value_style "tags": the field, with its values shown as a comma-separated chip list
  A jump-nav above the table anchors to each top-level field.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})

const fields = computed(() => props.dataset.data_dictionary || [])

// Anchor id for a field's row / jump link (mirrors the mockup's dict-<slug>).
const slug = (s) =>
  'dict-' + String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
</script>

<template>
  <section v-if="fields.length" class="grid-row grid-gap margin-bottom-4" aria-labelledby="dict-heading">
    <div class="grid-col-12">
      <h2 id="dict-heading" class="font-heading-lg">Data dictionary</h2>
      <p v-if="dataset.data_dictionary_intro" class="dict-intro line-height-sans-5">{{ dataset.data_dictionary_intro }}</p>
      <p>Jump to a field, or scroll through the full list below.</p>
      <nav class="dict-jump-nav" aria-label="Jump to data dictionary field">
        <a v-for="f in fields" :key="f.id" :href="`#${slug(f.field_name)}`">{{ f.field_name }}</a>
      </nav>

      <div >
        <table class="usa-table usa-table--compact width-full margin-top-0 dict-table">
          <caption class="usa-sr-only">
            Data dictionary: field names and definitions for the {{ dataset.name }} dataset.
          </caption>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Definition</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="f in fields" :key="f.id">
              <tr class="dict-parent">
                <th :id="slug(f.field_name)" scope="row" class="dict-term">{{ f.field_name }}</th>
                <td>
                  <span v-if="f.definition">{{ f.definition }}</span>
                  <div v-if="f.value_style === 'tags' && f.values?.length" class="dict-chips">
                    {{ f.values.map((v) => v.term).join(', ') }}
                  </div>
                </td>
              </tr>
              <template v-if="f.value_style !== 'tags'">
                <tr v-for="v in f.values" :key="v.id" class="dict-sub">
                  <th scope="row" class="dict-term dict-term--sub">{{ v.term }}</th>
                  <td>{{ v.definition }}</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

// Intro paragraph under the section heading (plain multiline text → keep line breaks).
.dict-intro { white-space: pre-line; }

// Jump nav: wrapped blue-outlined pills (USWDS primary) above the table.
.dict-jump-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;

  a {
    display: inline-block;
    padding: 0.15rem 0.75rem;
    border: 1px solid $onrr-violet;
    border-radius: 999px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: $onrr-violet;
    text-decoration: none;

    &:hover { background: rgba($onrr-violet, 0.1); text-decoration: none; }
    &:focus-visible { outline: 2px solid $onrr-violet; outline-offset: 2px; }
  }
}

.data-table-wrap {
  overflow-x: auto;
  border: 1px solid #dfe1e2;
  contain: layout; // keep the (potentially tall) table from leaking height past the footer
}

.dict-table {
  th, td { vertical-align: top; }
  // Field column: hold a readable, consistent width; definitions get the rest.
  .dict-term { width: 20rem; font-weight: 700; }
  td { max-width: 46rem; }
}

// Sub-value rows: indented term, muted, lighter weight.
.dict-sub .dict-term--sub {
  padding-left: 2rem;
  font-weight: 400;
  color: #3d4551;
}
.dict-sub > td { color: #3d4551; }

// Chip list (e.g. commodities) under a field's definition.
.dict-chips {
  margin-top: 0.5rem;
  color: #565c65;
  font-size: 0.93rem;
}
</style>
