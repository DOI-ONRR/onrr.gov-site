<template>
  <div
    :class="alignmentClasses">
    <figure class="figure-block">
      <v-img
        :src="fileSrc"
        :lazy-src="lazyImg"
        :class="['img-block', classObj]"
        :alt="altTag"
        :width="width"
        :height="height"
        max-height="100%"
        max-width="100%"
        contain
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
        <figcaption v-if="block.data.caption" :class="['font-italic', alignmentClasses]">{{ block.data.caption }}</figcaption>
    </figure>
  </div>
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
      return `${ process.env.VUE_APP_API_URL }${ this.block.data.file.url }?fit=cover`
    },
    width() {
      const w = (parseInt(this.block.data.imgWidth) === parseInt(this.block.data.file.width) || this.block.data.stretched) 
      ? '100%' : this.block.data.imgWidth
      // const w = '100%'
      return w
    },
    height() {
      const h = (parseInt(this.block.data.imgWidth) === parseInt(this.block.data.file.width) || this.block.data.stretched)
      ? 'auto' : this.block.data.imgHeight
      // const h = 'auto'
      return h
    },
    altTag() {
      return this.block.data.altTag || 'Office of Natural Resource and Revenue Image'
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
        classes +=  ' img--background'
      }
      return classes
    },
    alignmentClasses() {
      let classes = ''
      switch (this.block?.tunes?.alignmentTune?.alignment) {
        case 'left':
          classes = 'd-flex justify-start'
          break;
        case 'center':
          classes = 'd-flex justify-center'
          break;
        case 'right':
          classes = 'd-flex justify-end'
          break;
        default:
          classes = 'd-flex flex-start'
          break;
      }
      return classes
    }
  }
}
</script>

<style lang="scss" scoped>
.figure-block {
  max-width: 100%;
}

.img-block img {
  width: 100%; 
  height: auto; 
  object-fit: contain;
}
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