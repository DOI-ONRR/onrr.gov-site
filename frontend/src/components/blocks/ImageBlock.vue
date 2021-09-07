<template>
  <figure>
    <v-img
      :aspect-ratio="16/9"
      :width="width"
      :src="fileSrc"
      :lazy-src="lazyImg"
      :class="['img-block', classObj]"
      >
        <template v-slot:placeholder>
          <v-row
            class="fill-height ma-0"
            align="center"
            justify="center">
            <v-progress-circular 
              indeterminate
              color="grey lighten-5"></v-progress-circular>  
          </v-row>
        </template>
      </v-img>
      <figcaption v-if="block.data.caption">{{ block.data.caption }}</figcaption>
  </figure>
</template>

<script>
export default {
  name: 'ImageBlock',
  data: () => ({
  }),
  props: {
    block: {
      type: Object
    }
  },
  computed: {
    fileSrc() {
      return `${ process.env.VUE_APP_API_URL }${ this.block.data.file.url }`
    },
    lazyImg() {
      return `${ process.env.VUE_APP_API_URL }${ this.block.data.file.url }?fit=cover&width=50`
    },
    width() {
      const w = (this.block.data.stretched) ? '100%' : 'auto'
      return w
    },
    classObj() {
      let classes = ''
      // if (this.block.data.stretched) {
      //   classes += ' img--stretched'
      // }
      if (this.block.data.withBorder) {
        classes += ' img--border'
      }
      if (this.block.data.withBackground) {
        classes += ' img--background'
      }
      return classes
    }
  }
}
</script>

<style lang="scss" scoped>
.img--border {
  border-style: solid;
  border-width: 2px;
  border-color: var(--v-neutrals-lighten2);
}

.img--background {
  background-color: var(--v-neutrals-lighten2);
}

.img--background .v-image__image {
  max-width: 80%;
  margin: 0 auto;
}

.img--background .v-image__image--cover {
  background-size: inherit;
}
</style>