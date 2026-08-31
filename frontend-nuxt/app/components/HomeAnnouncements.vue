<script setup>
/*
  Homepage announcements — the three most recent published announcements, rendered as
  a 3-up card grid below the page bands. The query already filters to status=published,
  orders by the collection's manual `sort`, and caps at 3; the whole section is omitted
  when none are published.
*/
import getRecentAnnouncements from '@/graphql/queries/collections/announcements/getRecentAnnouncements.gql'

const { resolveImages } = useCmsContent()

const { data } = await useAsyncQuery(getRecentAnnouncements)
const announcements = computed(() => data.value?.announcements ?? [])
</script>

<template>
  <section
    v-if="announcements.length"
    class="announcements-band padding-y-4"
    aria-labelledby="announcements-heading"
  >
    <div class="grid-container">
      <h2 id="announcements-heading" class="font-heading-lg margin-top-0">Announcements</h2>
      <div class="grid-row grid-gap margin-top-3">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="tablet:grid-col-4 margin-bottom-2"
        >
          <div class="usa-card__container height-full">
            <div class="usa-card__header">
              <h3 class="usa-card__heading font-heading-md margin-bottom-105">{{ item.title }}</h3>
            </div>
            <div
              v-if="item.content"
              class="usa-card__body"
              v-html="resolveImages(item.content)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;
// Full-width subtle band. index.vue renders this <section> at the top level of
// #main-content, so the background spans the viewport; the inner .grid-container
// re-constrains the content.
.announcements-band {
  background: #f9fafb;
  border-top: 1px solid #dfe1e2;
}

// Match the announcement cards to the homepage `.page-band__card` look: a hairline
// #dfe1e2 border, 4px radius, and a single `padding-3` (1.5rem) on the container —
// so the USWDS header/body padding is zeroed and the container padding governs.
.usa-card__container {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.usa-card__header,
.usa-card__body {
  padding: 0;
}

// `content` is WYSIWYG injected via v-html, so scoped styles need :deep to reach it.
.usa-card__body :deep(p),
.usa-card__body :deep(div),
.usa-card__body :deep(ul) {
  @include u-font('body', '2xs');
}

.usa-card__heading { margin-top: 0; }
</style>
