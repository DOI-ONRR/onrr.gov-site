<template>
  <div class="masthead">
    <div class="grid-container">
      <NuxtLink class="agency-logo" to="/" title="ONRR.gov home">
        <img src="/img/onrr_seal_logo.svg" alt="" class="agency-logo__seal">
        <span class="agency-logo__name">Office of Natural<br>Resources Revenue (ONRR)</span>
      </NuxtLink>
      <ul class="masthead-utility">
        <li v-for="item in menuItems" :key="item.id">
          <NuxtLink :to="itemUrl(item)">{{ item.menu_label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import getMenus from '@/graphql/queries/collections/menus/getMenus.gql'

const { data } = await useAsyncQuery(getMenus, { menu: 'header' })

const menuItems = computed(() => data.value?.menus ?? [])

// Same URL resolution as NavigationMenu: prefer a custom URL, then the linked page.
function itemUrl(item) {
  return item.custom_url || item.link_to_page?.url || '#'
}
</script>
