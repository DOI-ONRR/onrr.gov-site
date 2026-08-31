<script setup>
/*
  Homepage announcements — the three most recent published announcements, stacked in a
  single 7-column column below the page bands. The query already filters to
  status=published, orders by the collection's manual `sort`, and caps at 3; the whole
  section is omitted when none are published.
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
      <div class="grid-row margin-top-3">
        <div class="tablet:grid-col-8">
          <div
            v-for="item in announcements"
            :key="item.id"
            class="announcement"
          >
            <svg class="usa-icon announcement__icon" aria-hidden="true" role="img">
              <use href="/uswds/img/sprite.svg#campaign" />
            </svg>
            <div class="announcement__content">
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
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;
@use "onrr-colors" as *;
// Full-width subtle band. index.vue renders this <section> at the top level of
// #main-content, so the background spans the viewport; the inner .grid-container
// re-constrains the content.
.announcements-band {
  background: #f9fafb;
  border-top: 1px solid #dfe1e2;
}

// Stacked items — megaphone icon beside the content, separated by a hairline rule
// between each (not above the first).
.announcement {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.announcement + .announcement {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #dfe1e2;
}

.announcement__icon {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  color: $onrr-blue;
  // Nudge down to sit against the heading's cap height rather than its line box.
  margin-top: 0.15rem;
}

.announcement__content { min-width: 0; }

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
