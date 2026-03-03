<script setup>
import getPressReleasesByStatus from '@/graphql/queries/collections/press_releases/getPressReleasesByStatus.gql'
import getReporterLetters from '@/graphql/queries/collections/reporter_letters/getReporterLetters.gql'
import getAnnouncements from '@/graphql/queries/collections/announcements/getAnnouncements.gql'

const props = defineProps({
  block: { type: Object, required: true },
})

const { assetUrl, resolveImages } = useCmsContent()

const collection = computed(() => props.block.collection)

const viewAllConfig = {
  reporter_letters: { label: 'View All Reporter Letters', url: '/references/reporter-letters' },
  press_releases: { label: 'View All Press Releases', url: '/about/public-affairs' },
}

const viewAll = computed(() => viewAllConfig[collection.value] || null)

const { data: pressData } = collection.value === 'press_releases'
  ? await useAsyncQuery(getPressReleasesByStatus, { status: 'published' })
  : { data: ref(null) }

const { data: lettersData } = collection.value === 'reporter_letters'
  ? await useAsyncQuery(getReporterLetters)
  : { data: ref(null) }

const { data: announcementsData } = collection.value === 'announcements'
  ? await useAsyncQuery(getAnnouncements)
  : { data: ref(null) }

const items = computed(() => {
  let all = []
  if (collection.value === 'press_releases') {
    all = pressData.value?.press_releases ?? []
  } else if (collection.value === 'reporter_letters') {
    all = lettersData.value?.reporter_letters ?? []
  } else if (collection.value === 'announcements') {
    all = announcementsData.value?.announcements ?? []
  }
  return all.slice(0, 5)
})
</script>

<template>
  <Contacts
    v-if="collection === 'contacts'"
    :page="block.page"
    :tab="block.tab"
    :accordion="block.accordion"
  />
  <template v-else-if="collection === 'announcements'">
    <div v-for="item in items" :key="item.id" class="usa-card margin-bottom-3">
      <div class="usa-card__container">
        <div class="usa-card__header">
          <h3 class="usa-card__heading">{{ item.title }}</h3>
        </div>
        <div v-if="item.content" class="usa-card__body" v-html="resolveImages(item.content)" />
      </div>
    </div>
  </template>
  <template v-else>
    <ul class="usa-list usa-list--unstyled">
      <li v-for="item in items" :key="item.id" class="margin-bottom-1">
        <a
          v-if="item.file?.id"
          :href="assetUrl(item.file.id)"
          target="_blank"
          class="usa-link"
        >
          {{ item.title }}
        </a>
        <a
          v-else-if="item.link"
          :href="item.link"
          target="_blank"
          class="usa-link"
        >
          {{ item.title }}
        </a>
        <span v-else>{{ item.title }}</span>
      </li>
    </ul>
  </template>
  <div v-if="viewAll" class="display-flex flex-justify-center margin-top-2">
    <NuxtLink :to="viewAll.url" class="usa-button">
      {{ viewAll.label }}
    </NuxtLink>
  </div>
</template>
