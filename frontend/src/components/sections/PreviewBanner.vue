<!--
  Preview-mode banner. Shown whenever a Directus preview token is active (the
  router keeps it on `?token=` as the editor navigates) so an editor always knows
  they're viewing draft content, and — importantly — has a one-click, non-technical
  way OUT of preview. Clicking "Exit preview" clears the persisted token and
  reloads the current path clean, so the API returns published-only content.
-->
<template>
  <div v-if="isPreview" class="preview-banner" role="status">
    <span class="preview-banner__label">
      <span aria-hidden="true">&#128065;&nbsp;</span>
      Preview mode — showing unpublished draft content
    </span>
    <button type="button" class="preview-banner__exit" @click="exitPreview">
      Exit preview
    </button>
  </div>
</template>

<script>
import { PREVIEW_TOKEN_KEY } from '@/router';

export default {
  name: 'PreviewBanner',
  computed: {
    isPreview() {
      return !!this.$route.query.token;
    }
  },
  methods: {
    exitPreview() {
      // Drop the persisted token so the router's re-attach guard won't add it back.
      sessionStorage.removeItem(PREVIEW_TOKEN_KEY);
      // Full reload of the clean path (no token in storage or URL) → the API
      // authorizes anonymously and returns published-only content.
      window.location.assign(this.$route.path);
    }
  }
};
</script>

<style scoped>
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
  background-color: #fef0c8; /* USWDS warning-lighter */
  border-bottom: 2px solid #ffbe2e; /* USWDS warning */
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
