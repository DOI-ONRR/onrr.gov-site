export function usePagination(sourceItems, pageSize = 15) {
  const currentPage = ref(1)

  const totalPages = computed(() => Math.ceil(sourceItems.value.length / pageSize))

  const displayedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return sourceItems.value.slice(start, start + pageSize)
  })

  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages = []
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
  })

  const rangeStart = computed(() => (currentPage.value - 1) * pageSize + 1)
  const rangeEnd = computed(() => Math.min(currentPage.value * pageSize, sourceItems.value.length))
  const totalItems = computed(() => sourceItems.value.length)

  function goToPage(page) {
    currentPage.value = page
  }

  function resetPage() {
    currentPage.value = 1
  }

  return {
    currentPage,
    totalPages,
    displayedItems,
    visiblePages,
    rangeStart,
    rangeEnd,
    totalItems,
    goToPage,
    resetPage,
  }
}
