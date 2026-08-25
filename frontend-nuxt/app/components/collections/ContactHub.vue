<script setup>
/*
  Contact hub topic router (mockup: contact/index.html .topic-grid). Renders the
  contact_topics collection as cards; each links to its per-topic contacts page.
  Dropped on /about/contact via a Collection block (collection = contact_topics).
*/
import getContactTopics from '@/graphql/queries/collections/contacts/getContactTopics.gql'

const { data } = await useAsyncQuery(getContactTopics)
const topics = computed(() => data.value?.contact_topics ?? [])

// Per-topic contacts page lives under the hub, keyed by slug.
const topicUrl = (slug) => `/about/contact/${slug}`
</script>

<template>
  <div class="topic-grid">
    <div v-for="topic in topics" :key="topic.id" class="topic-card">
      <h3 class="topic-card__title">
        <NuxtLink :to="topicUrl(topic.slug)" class="usa-link">{{ topic.title }}</NuxtLink>
      </h3>
      <p v-if="topic.description" class="topic-card__desc">{{ topic.description }}</p>
      <NuxtLink :to="topicUrl(topic.slug)" class="usa-button usa-button--outline">View contacts</NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;
@use "onrr-colors" as *;

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.5rem;
}

.topic-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-navy;
  border-radius: 0 0 4px 4px;
  background: #fff;
  padding: 1.25rem 1.25rem 1rem;
}

.topic-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  line-height: 1.25;
}

.topic-card__desc {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #3d4551;
  flex: 1 1 auto;
}

.topic-card .usa-button {
  margin: 0;
  align-self: flex-start;
}
</style>
