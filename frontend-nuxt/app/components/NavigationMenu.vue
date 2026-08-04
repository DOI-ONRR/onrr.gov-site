<template>
  <nav class="usa-nav">
    <div class="navrow">
      <ul class="usa-nav__primary usa-accordion" aria-label="Primary site navigation">
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
              <svg class="nav-caret" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <path d="M2 4l4 4 4-4z" />
              </svg>
            </button>
            <div
              :id="`nav-section-${item.id}`"
              class="usa-nav__submenu usa-megamenu"
              :hidden="openMenuId !== item.id"
            >
              <!-- The panel background is full-bleed (position:absolute left/right:0 on
                   .usa-nav); this inner .grid-container re-constrains the link columns to
                   the site width so they line up under the nav labels, masthead, and body. -->
              <div class="grid-container">
                <div class="grid-row grid-gap">
                  <div
                    v-for="(column, colIndex) in sectionColumns(item)"
                    :key="colIndex"
                    class="usa-col"
                  >
                    <ul class="usa-nav__submenu-list">
                      <li
                        v-for="link in column"
                        :key="link.url"
                        class="usa-nav__submenu-item"
                      >
                        <NuxtLink :to="link.url">{{ link.title }}</NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
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

// Megamenu columns for a section: the section "Home" link first, then each child
// page, chunked into columns of three links each.
function sectionColumns(item) {
  const links = []
  if (item.link_to_page?.url) {
    links.push({ url: item.link_to_page.url, title: `${item.menu_label} Home` })
  }
  for (const child of item.menu_children ?? []) {
    if (child.pages_id?.url) {
      links.push({ url: child.pages_id.url, title: child.pages_id.title })
    }
  }
  const columns = []
  for (let i = 0; i < links.length; i += 3) {
    columns.push(links.slice(i, i + 3))
  }
  return columns
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
  if (item.menu_children?.some((child) => {
    const childUrl = child.pages_id?.url
    if (!childUrl) return false
    return path === childUrl || path.startsWith(childUrl + '/')
  })) return true
  return false
}
</script>

<style lang="scss" scoped>
  @use "onrr-colors" as *;

  .usa-current::after {
    background-color: $onrr-navy !important;
  }

  // Desktop only: below 64em the `.usa-nav` is USWDS's fixed off-canvas mobile drawer.
  // These megamenu overrides must NOT apply there — `position: relative` in particular
  // cancels the drawer's `position: fixed`, dropping it beneath the full-screen overlay.
  @media (min-width: 64em) {
    // Full-bleed megamenu: anchor the panel to the full-width .usa-nav (its offset
    // parent) with left/right: 0 so its background spans the whole page — cleaner
    // than USWDS's -33% breakout. The inner .grid-container (in the template)
    // constrains the links to the navbar width.
    .usa-nav {
      position: relative;
    }

    .usa-megamenu.usa-nav__submenu {
      left: 0;
      right: 0;
      width: auto;
    }

    // Columns hug their content and pack next to each other, rather than each
    // stretching to fill the row (USWDS default is flex: 4 1 0%).
    .usa-megamenu .usa-col {
      flex: 0 1 auto;
    }
  }
</style>
