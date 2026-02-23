<template>
  <nav class="usa-nav onrr-nav">
    <ul class="usa-nav__primary usa-accordion">
      <li
        v-for="item in mainMenuItems"
        :key="item.id"
        class="usa-nav__primary-item"
      >
        <!-- Item with children: dropdown -->
        <template v-if="item.menu_children?.length">
          <button
            type="button"
            class="usa-accordion__button usa-nav__link"
            :class="{ 'usa-current': isCurrentItem(item) }"
            :aria-expanded="openMenuId === item.id"
            :aria-controls="`nav-section-${item.id}`"
            @click="toggle(item.id)"
          >
            <span>{{ item.menu_label }}</span>
          </button>
          <ul
            :id="`nav-section-${item.id}`"
            class="usa-nav__submenu"
            :hidden="openMenuId !== item.id"
          >
            <li class="usa-nav__submenu-item">
              <NuxtLink :to="item.link_to_page.url">
                {{ item.menu_label }} Home
              </NuxtLink>
            </li>
            <li
              v-for="child in item.menu_children"
              :key="child.pages_id?.id"
              class="usa-nav__submenu-item"
            >
              <NuxtLink :to="child.pages_id?.url">
                {{ child.pages_id?.title }}
              </NuxtLink>
            </li>
          </ul>
        </template>

        <!-- Item without children: plain link -->
        <template v-else>
          <NuxtLink
            class="usa-nav__link"
            :class="{ 'usa-current': isCurrentItem(item) }"
            :to="itemUrl(item)"
          >
            <span>{{ item.menu_label }}</span>
          </NuxtLink>
        </template>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import getMenus from '@/graphql/queries/collections/menus/getMenus.gql'

const { data } = await useAsyncQuery(getMenus, { menu: 'main' })

const openMenuId = ref(null)

const mainMenuItems = computed(() => {
  return data.value?.menus ?? []
})

function itemUrl(item) {
  return item.custom_url || item.link_to_page?.url || '#'
}

function toggle(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

const route = useRoute()

watch(() => route.path, () => {
  openMenuId.value = null
})

function isCurrentItem(item) {
  const path = route.path
  if (item.link_to_page?.url && path === item.link_to_page.url) return true
  if (item.custom_url && path === item.custom_url) return true
  return item.menu_children?.some((child) => child.pages_id?.url === path) || false
}
</script>

<style lang="scss" scoped>
  @use "uswds-theme" as *;

  .onrr-nav {
    @include grid-container('none');
    float: none;
  }

  .usa-current::after {
    background-color: $color-medium-green !important;
  }
</style>
