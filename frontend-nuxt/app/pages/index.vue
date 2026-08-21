<script setup>

import getPageBySlug from '@/graphql/queries/collections/pages/getPageBySlug.gql'

const { assetUrl } = useCmsContent()

const { data } = await useAsyncQuery(getPageBySlug, { slug: null })
const page = computed(() => data.value?.page?.[0])

const heroTitle = computed(
  () => page.value?.hero_title || '',
)

const heroDescription = computed(
  () => page.value?.hero_description,
)

// Hero CTAs from the `hero_cta` repeater ({ label, url }). The first renders as the
// primary big button; every one after it gets the outline/inverse treatment.
const heroCtas = computed(() => page.value?.hero_cta ?? [])

const pageBands = computed(() =>
  (page.value?.page_bands?.length ? page.value.page_bands : []),
)

</script>

<template>
  <div class="homepage">
    <section
      class="hero padding-y-6"
      :class="{ 'hero--has-image': page?.hero_image?.id }"
      :style="page?.hero_image?.id ? { '--hero-image': `url(${assetUrl(page.hero_image.id)})` } : null"
      aria-label="Introduction"
    >
      <div class="grid-container">
        <h1 class="font-heading-2xl margin-0">{{ heroTitle }}</h1>
        <p class="margin-top-2 measure-5">{{ heroDescription }}</p>
        <p v-if="heroCtas.length" class="margin-top-3 margin-bottom-0 hero-actions">
          <a
            v-for="(cta, i) in heroCtas"
            :key="i"
            class="usa-button usa-button--big"
            :class="{ 'usa-button--outline usa-button--inverse': i > 0 }"
            :href="cta.url"
          >{{ cta.label }}</a>
        </p>
      </div>
    </section>

    <PageBands :bands="pageBands" />
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

// Full-width bands: index.vue renders at the top level of #main-content, so each
// <section> fills the viewport width; the inner .grid-container re-constrains content.

// Hero — deep navy band with white text. When the CMS provides a hero image, its URL
// is injected inline as the `--hero-image` custom property; the directional gradient
// overlay (opaque navy on the text side, fading to reveal the photo on the right) and
// the responsive focal point live here in SCSS.
.hero {
  background-color: #1a4480;
  color: #fff;

  h1 {
    max-width: 24ch;
    text-wrap: balance;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
  p {
    max-width: 62ch;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
}

// With an image: layer the 90deg gradient over the photo. On the left (behind
// the text) it's near-opaque navy; by the right edge it's ~transparent so the photo
// shows through. `--hero-image` is set inline (dynamic CMS URL).
.hero--has-image {
  background-image:
    linear-gradient(
      90deg,
      rgba(17, 46, 88, 0.96) 0%,
      rgba(17, 46, 88, 0.86) 36%,
      rgba(17, 46, 88, 0.30) 66%,
      rgba(17, 46, 88, 0.02) 100%
    ),
    var(--hero-image);
  background-size: cover;
  background-position: center 42%;
  background-repeat: no-repeat;

  // Narrow screens: a horizontal fade leaves the text unreadable, so switch to a flat
  // overlay and shift the focal point down.
  @media (max-width: 39.99em) {
    background-image:
      linear-gradient(rgba(17, 46, 88, 0.92), rgba(17, 46, 88, 0.92)),
      var(--hero-image);
    background-position: center 58%;
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
