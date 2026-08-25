<script setup>
/*
  Per-topic contacts page (/about/contact/<slug>) — the destination of the contact
  hub's topic cards. Resolves the topic by slug for the heading, then lists its
  contacts (filtered through the contacts <-> contact_topics M2M) via ContactDirectory.
  A dedicated route (not a CMS page) since every topic shares one directory layout.
*/
import getContactTopics from '@/graphql/queries/collections/contacts/getContactTopics.gql'
import getContactsByTopic from '@/graphql/queries/collections/contacts/getContactsByTopic.gql'

// Re-mount on slug change so both queries refetch when navigating between topics.
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const slug = String(route.params.slug)

const { data: topicsData } = await useAsyncQuery(getContactTopics)
const topic = computed(() => (topicsData.value?.contact_topics ?? []).find((t) => t.slug === slug) ?? null)

const { data } = await useAsyncQuery(getContactsByTopic, { slug })
const groups = computed(() => data.value?.contacts ?? [])

if (!topic.value) {
  throw createError({ statusCode: 404, statusMessage: 'Contact topic not found', fatal: true })
}

useHead({ title: `${topic.value.title} contacts` })
</script>

<template>
  <div class="margin-top-4">
    <div class="grid-container">
      <Breadcrumbs
        :page="{ title: `${topic.title} contacts` }"
        :parent-link="{ title: 'Contact', url: '/about/contact' }"
      />
    </div>

    <div class="grid-container padding-bottom-6">
      <h1 class="margin-bottom-1">{{ topic.title }} contacts</h1>
      <p v-if="topic.description" class="usa-intro">{{ topic.description }}</p>

      <ContactDirectory :groups="groups" />
    </div>
  </div>
</template>
