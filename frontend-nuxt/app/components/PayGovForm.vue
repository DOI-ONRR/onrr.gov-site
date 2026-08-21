<script setup>
/*
  Pay.gov form card — a page_blocks item referencing one row of the `pay_gov_forms`
  collection (the ~4 canonical Pay.gov forms). Renders the mockup's .form-card:
  title, a description / form-number list, and a "Submit form on Pay.gov" button.
*/
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="form-card">
    <h3>{{ block.title }}</h3>
    <dl>
      <template v-if="block.description">
        <dt>Description</dt>
        <dd>{{ block.description }}</dd>
      </template>
      <template v-if="block.form_number">
        <dt>Form number</dt>
        <dd>{{ block.form_number }}</dd>
      </template>
    </dl>
    <a
      v-if="block.pay_gov_url"
      class="usa-button usa-button--outline"
      :href="block.pay_gov_url"
      target="_blank"
      rel="noopener"
    >
      Submit form on Pay.gov
      <svg class="ext-sm" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5V3H3v18h18v-7h-2v5H5V5z" />
      </svg>
      <span class="usa-sr-only"> (external)</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.form-card {
  border: 1px solid #dfe1e2;
  border-left: 4px solid $onrr-blue;
  border-radius: 0 4px 4px 0;
  background: #fff;
  padding: 1.1rem 1.25rem;
  margin: 1rem 0;
  max-width: 40rem;

  h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }

  dl { margin: 0 0 0.75rem; font-size: 0.93rem; }
  dt {
    font-weight: 700;
    color: #565c65;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-top: 0.5rem;
  }
  dd { margin: 0.1rem 0 0; }
}

.ext-sm {
  width: 0.7em;
  height: 0.7em;
  margin-left: 0.15em;
  fill: currentColor;
}
</style>
