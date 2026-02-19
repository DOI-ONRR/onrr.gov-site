<template>
  <nav class="usa-nav onrr-nav sticky">
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
</script>

<style lang="scss" scoped>                                                                                                                                                                                                                                   
  @use "uswds-core" as *;                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                               
  .onrr-nav {                                                                      
    @include grid-container('none'); 
    float: none;
  }
</style>
