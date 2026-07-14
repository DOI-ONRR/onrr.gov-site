<!--
  Preview-mode banner. Shown whenever a Directus preview token is active so an
  editor always knows they're viewing draft content, and — importantly — has a
  one-click, non-technical way OUT of preview. Clicking "Exit preview" clears the
  session cookie and reloads the current path with no token, so the server
  re-renders published-only content.
-->
<template>
  <div v-if="isPreview" class="preview-banner" role="status">
    <span class="preview-banner__label">
      <span aria-hidden="true">👁&nbsp;</span>
      Preview mode — showing unpublished draft content
    </span>
    <button type="button" class="preview-banner__exit" @click="exitPreview">
      Exit preview
    </button>
  </div>
</template>

<script setup>
const { token, isPreview } = usePreview()
const route = useRoute()

async function exitPreview() {
  token.value = null            // clear the session cookie
  await nextTick()              // let the cookie write flush before we reload
  // Full reload of the clean path: cookie is gone and no `?token=` in the URL,
  // so the server renders published-only content.
  window.location.assign(route.path)
}
</script>

<style lang="scss" scoped>
.preview-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.5rem 1rem;
  background-color: #fef0c8; // USWDS warning-lighter
  border-bottom: 2px solid #ffbe2e; // USWDS warning
  color: #1b1b1b;
  font-weight: 700;
  font-size: 0.93rem;
}

.preview-banner__exit {
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  background-color: #1b1b1b;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.preview-banner__exit:hover {
  background-color: #565c65;
}
</style>
