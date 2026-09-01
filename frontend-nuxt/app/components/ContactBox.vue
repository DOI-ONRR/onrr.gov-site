<script setup>
/*
  Contact box — a page_blocks item referencing one row of the `contact_boxes`
  collection. Renders the mockup's .contact-box: a bold heading (the question)
  plus a WYSIWYG body (email + name/phone lines). The person lines live in the
  body for now; a later pass can split them into a contact_persons relation.
*/
defineProps({
  block: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()
</script>

<template>
  <div class="contact-box">
    <p v-if="block.heading" class="margin-top-0 margin-bottom-1 text-bold">{{ block.heading }}</p>
    <div v-if="block.body" class="contact-box__body" v-html="resolveImages(block.body)" />
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.contact-box {
  border-left: 4px solid $onrr-blue;
  background: $onrr-blue-light;
  border-radius: 0 4px 4px 0;
  padding: 1.1rem 1.25rem;
  max-width: 40rem;
}

// body is WYSIWYG (email + name/phone lines) — tighten paragraph spacing.
.contact-box__body :deep(p) { margin: 0; }
.contact-box__body :deep(p + p) { margin-top: 0.15rem; }
</style>
