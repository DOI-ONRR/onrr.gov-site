<script setup>
/*
  TopicView — renders a "topic" page (pages.template === 'topic'), modeled on the
  learn-page mockup: a 3-col "On this page" left rail beside a 9-col content column.
  Chosen in [...slug].vue by the page's template field; the standard sidenav is
  dropped there. Content is the page's page_blocks (same block types as the default
  renderer); the in-page nav is derived from the <h2> headings in that content.
*/
const props = defineProps({
  page: { type: Object, required: true },
})

const { resolveImages } = useCmsContent()
const { enhance: enhanceGlossary } = useGlossary()

const blocks = computed(() => props.page?.page_blocks ?? [])
// Eyebrow = parent topic name (e.g. "How revenue works"); optional.
const eyebrow = computed(() => props.page?.parent?.title || null)

// 'sections' variant (payment-method / stacked-reference pages): no eyebrow, and
// compact sans section headings with extra separation between sections. Scoped so
// default topic pages (learn-page, etc.) are unchanged.
const isSections = computed(() => props.page?.topic_variant === 'sections')

// Content column width beside the fixed 3-col rail. Default 7 (learn-page reading
// measure); up to 9 (full row, no right gutter) for wide/data pages like references.
const contentCols = computed(() => props.page?.content_columns || 7)
// Optional "Related" box (WYSIWYG). The component owns the box + "Related" heading;
// the editor just writes the list of links, so every topic's box looks the same.
const relatedContent = computed(() => props.page?.related_content || null)

// --- "On this page" in-page nav -----------------------------------------------
// Built from the <h2>s inside the rendered content. Headings without an id get a
// slugified one so the anchors resolve; runs after mount and when content changes.
const contentEl = ref(null)
const sections = ref([]) // [{ id, text }]

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

function buildSections() {
  const root = contentEl.value
  if (!root) return
  const used = new Set()
  const out = []
  for (const h of root.querySelectorAll('h2')) {
    const text = h.textContent.trim()
    if (!text) continue
    let id = h.id || slugify(text)
    while (used.has(id)) id = `${id}-1`
    used.add(id)
    h.id = id
    // Offset scroll target so a fixed/anchored heading isn't hidden under the header.
    h.style.scrollMarginTop = '1rem'
    out.push({ id, text })
  }
  sections.value = out
}

// Active-section indicator (scroll spy): the active section is the last heading that
// has scrolled to within ~120px of the top, matching the mockup's behavior.
const activeId = ref(null)
function spy() {
  let current = sections.value[0]?.id ?? null
  for (const s of sections.value) {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top < 120) current = s.id
  }
  activeId.value = current
}

onMounted(() => {
  buildSections()
  spy()
  enhanceGlossary(contentEl.value)
  window.addEventListener('scroll', spy, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', spy))
watch(blocks, () => nextTick(() => { buildSections(); spy(); enhanceGlossary(contentEl.value) }))

// Smooth-scroll to a section (and update the hash) ourselves, so the scroll works
// regardless of the client-assigned heading ids. scrollIntoView scrolls as far as it
// can — a section near the page bottom rests wherever the page bottoms out, which is
// expected. `scroll-margin-top` on the headings keeps the target clear of the top.
function goToSection(id) {
  const el = contentEl.value?.querySelector(`#${CSS.escape(id)}`)
  if (!el) return
  history.replaceState(null, '', `#${id}`)
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="grid-row grid-gap">
    <!-- On this page (left rail) — hidden below tablet -->
    <div class="tablet:grid-col-3 display-none tablet:display-block">
      <nav v-if="sections.length" class="onpage" aria-label="On this page">
        <p class="onpage-title">On this page</p>
        <ul>
          <li v-for="s in sections" :key="s.id">
            <a
              :href="`#${s.id}`"
              :class="{ active: activeId === s.id }"
              @click.prevent="goToSection(s.id)"
            >{{ s.text }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Content -->
    <div :class="`tablet:grid-col-${contentCols}`">
      <p v-if="eyebrow && !isSections" class="topic-eyebrow margin-bottom-0">{{ eyebrow }}</p>
      <h1 class="margin-top-05 margin-bottom-2">{{ page?.hero_title || page?.title }}</h1>

      <div ref="contentEl" class="topic-content" :class="{ 'topic-content--sections': isSections }">
        <div
          v-for="block in blocks"
          :key="block.id"
          class="margin-bottom-3"
        >
          <div
            v-if="block.item?.__typename === 'content_blocks'"
            class="usa-prose"
            v-html="resolveImages(block.item.block_content_html)"
          />
          <TabsBlock
            v-else-if="block.item?.__typename === 'tab_blocks'"
            :block="block.item"
          />
          <ExpansionPanelBlock
            v-else-if="block.item?.__typename === 'expansion_panels'"
            :block="block.item"
          />
          <CardBlock
            v-else-if="block.item?.__typename === 'card_blocks'"
            :block="block.item"
          />
          <CollectionBlock
            v-else-if="block.item?.__typename === 'collection_blocks'"
            :block="block.item"
          />
          <ChartCard
            v-else-if="block.item?.__typename === 'chart_cards'"
            :block="block.item"
          />
          <PayGovForm
            v-else-if="block.item?.__typename === 'pay_gov_forms'"
            :block="block.item"
          />
          <ContactBox
            v-else-if="block.item?.__typename === 'contact_boxes'"
            :block="block.item"
          />
          <DataTable
            v-else-if="block.item?.__typename === 'data_tables'"
            :block="block.item"
          />
        </div>

        <!-- Related box: component owns the heading + styling; editor supplies the
             list. Inside .topic-content so its <h2> joins the "On this page" nav. -->
        <div v-if="relatedContent" class="related-box padding-3 margin-y-4">
          <h2>Related</h2>
          <div v-html="resolveImages(relatedContent)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;
// uswds-theme forwards uswds-core (functions, mixins, and the project's theme settings)
// WITHOUT emitting USWDS component CSS. The full "uswds" bundle would compile every USWDS
// rule into this component's scoped styles — including `.grid-container { max-width: 64rem }`,
// which narrows/misaligns any grid-container inside a topic page. Match the rest of the codebase.
@use "uswds-theme" as *;

.topic-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.82rem;
  font-weight: 700;
  color: #565c65;
}

// 'sections' variant: compact sans section headings (the payment-method mockup's
// .re-section h2 — 24px sans, vs the default serif .usa-prose h2), with padding-top
// to separate the stacked sections. padding (not margin) avoids margin-collapse with
// the previous block. Scoped to .usa-prose h2 so the Related box heading is untouched.
.topic-content--sections :deep(.usa-prose h2) {
  font-family: family('sans');
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 0.25rem;
  padding-top: 1.75rem;
}

// "On this page" left rail (adopted from the learn-page mockup): sticky, with a gray
// left rail whose active-section segment turns blue via each link's own left border.
.onpage {
  position: sticky;
  top: 1rem;
  font-size: 0.9rem;
}

.onpage-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #565c65;
  margin: 0 0 0.5rem;
}

.onpage ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 3px solid #dfe1e2;
}

.onpage a {
  display: block;
  padding: 0.35rem 0.9rem;
  color: #565c65;
  text-decoration: none;
  border-left: 3px solid transparent;
  margin-left: -3px; // overlap the ul's rail so the active border replaces it
}

.onpage a:hover {
  @include u-text('primary');
  text-decoration: underline;
}

.onpage a.active {
  color: #1b1b1b;
  font-weight: 700;
  border-left-color: $onrr-blue;
}

// Related box: bordered card with a violet left accent (matches the mockup). The
// component provides the heading + box; :deep() styles the editor's list/links.
.related-box {
  border: 1px solid #dfe1e2;
  border-left: 4px solid $onrr-violet;
  border-radius: 0 4px 4px 0;
  background: #fff;

  h2 {
    margin-top: 0;
    font-size: 1rem;
  }

  :deep(ul) {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.93rem;
  }

  :deep(li) {
    margin-bottom: 0.4rem;
  }

  // Ensure links read as links even if the editor didn't add usa-link.
  :deep(a) {
    color: $onrr-violet;
    text-decoration: underline;
  }
}
</style>
