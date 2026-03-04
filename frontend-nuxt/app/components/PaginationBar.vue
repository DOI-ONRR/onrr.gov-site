<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  visiblePages: { type: Array, required: true },
  rangeStart: { type: Number, default: null },
  rangeEnd: { type: Number, default: null },
  totalItems: { type: Number, default: null },
  label: { type: String, default: null },
})

const emit = defineEmits(['page-change'])

const showInfo = computed(() => props.label && props.rangeStart != null)
</script>

<template>
  <div v-if="totalPages > 1" :class="['pagination-bar', { 'pagination-bar--with-info': showInfo }]">
    <span v-if="showInfo" class="pagination-bar__info">
      Displaying {{ rangeStart }} - {{ rangeEnd }} of {{ totalItems }} {{ label }}
    </span>
    <nav aria-label="Pagination" class="usa-pagination">
      <ul class="usa-pagination__list">
        <li v-if="currentPage > 1" class="usa-pagination__item usa-pagination__arrow">
          <a
            href="javascript:void(0)"
            class="usa-pagination__link usa-pagination__previous-page"
            aria-label="Previous page"
            @click="emit('page-change', currentPage - 1)"
          >
            <svg class="usa-icon" aria-hidden="true" role="img">
              <use href="/uswds/img/sprite.svg#navigate_before" />
            </svg>
            <span class="usa-pagination__link-text">Previous</span>
          </a>
        </li>
        <template v-for="(page, i) in visiblePages" :key="i">
          <li v-if="page === '...'" class="usa-pagination__item usa-pagination__overflow" aria-label="ellipsis indicating non-visible pages">
            <span>&hellip;</span>
          </li>
          <li v-else class="usa-pagination__item usa-pagination__page-no">
            <a
              href="javascript:void(0)"
              class="usa-pagination__button"
              :class="{ 'usa-current': page === currentPage }"
              :aria-label="`Page ${page}`"
              :aria-current="page === currentPage ? 'page' : undefined"
              @click="emit('page-change', page)"
            >
              {{ page }}
            </a>
          </li>
        </template>
        <li v-if="currentPage < totalPages" class="usa-pagination__item usa-pagination__arrow">
          <a
            href="javascript:void(0)"
            class="usa-pagination__link usa-pagination__next-page"
            aria-label="Next page"
            @click="emit('page-change', currentPage + 1)"
          >
            <span class="usa-pagination__link-text">Next</span>
            <svg class="usa-icon" aria-hidden="true" role="img">
              <use href="/uswds/img/sprite.svg#navigate_next" />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.pagination-bar--with-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-bar--with-info .usa-pagination {
  margin: 0;
}

.pagination-bar__info {
  font-size: size('sans', 'sm');
  color: color('base-dark');
}
</style>
