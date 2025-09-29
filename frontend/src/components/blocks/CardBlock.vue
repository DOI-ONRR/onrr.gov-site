<template>
  <v-card class="card v-card__item card-block" :class="blockColor">
    <v-card-title v-if="cardTitle" class="text-h5 black--text">
      {{ cardTitle }}
    </v-card-title>
    <v-card-subtitle v-if="cardSubtitle" class="v-card__subtitle black--text">
      {{ cardSubtitle }}
    </v-card-subtitle>
    <v-icon v-if="blockIcon === 'alert'" class="alert-color mdi mdi-alert " :class="blockColor"></v-icon> 
    <v-icon v-if="blockIcon === 'info'" class="info-color mdi mdi-information" :class="blockColor"></v-icon> 
    <v-card-text class="text--primary body-1">
      <div v-html="processedContent"></div>
      <LayoutBlock :layoutBlocks="blockItems" v-if="blockItems.length > 0"></LayoutBlock>
    </v-card-text>
  </v-card>
</template>

<script>
import { editorBlockMixin, pageBlockMixin } from '@/mixins'
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')
export default {
  mixins: [editorBlockMixin, pageBlockMixin],
  name: 'CardBlock',
  data () {
    return {
      data: {}
    }
  },
  props: {
    cardTitle: {
      type: String
    },
    cardSubtitle: {
      type: String
    },
    cardContent: {
      type: [String, Array]
    },
    block: [Array, Object],
  },
  components: {
    LayoutBlock
  },
  computed: {
    blocks() {
      const blocks = this.block.block_content.blocks
      return blocks
    },
    blockColor() {
      return this.block.item.block_color
    },
   iconColor() {
      return this.block.item.block_color + '-text'
    },
    blockIcon() {
      return this.block.item.block_icon
    },
    blockItems() {
      const blocks = [...this.block.item.card_content_blocks.filter(block => block.item !== null)]
      return blocks
    },
    processedContent() {
      if (!this.block.item.block_content_html) return "";

      const parser = new DOMParser();
      const doc = parser.parseFromString(this.block.item.block_content_html, "text/html");
      const baseUrl = process.env.VUE_APP_API_URL;

      doc.querySelectorAll("img").forEach(img => {
        const originalSrc = img.getAttribute("src");
        if (originalSrc && originalSrc.startsWith("/")) {
          img.setAttribute("src", `${baseUrl}${originalSrc}`);
        }
      });

      return doc.body.innerHTML;
    }
  }
}
</script>

<style lang="scss" scoped>

.v-card-text {
  margin-top: 50px;
}

.card {
  border-top-width: 6px;
  border-top-style: solid;
  width: 100%;
}

.none {
  border: none;
}

.anchor--color {
  border-top-color: var(--v-secondary-base);
}

.primary--color {
  border-top-color: var(--v-primary-base);
}

.secondary--color {
  border-top-color: var(--v-secondary-base);
}

.green--color {
  border-top-color: var(--v-green-lighten1);
}

.purple--color {
  border-top-color: var(--v-purple-base);
}
.alert-color {
  color: #ecb947;
}
.info-color {
  color: #650d79;
}

.yellow--color {
  border-top-color: var(--v-yellow-lighten1)
}

</style>