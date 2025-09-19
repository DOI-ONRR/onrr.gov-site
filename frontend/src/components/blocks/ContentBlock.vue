<template>
  <div v-html="processedContent"></div>
</template>

<script>
import { editorBlockMixin, pageBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin, pageBlockMixin],
  name: 'ContentBlock',
  data () {
    return {}
  },
  props: {
    block: [Array, Object]
  },
  computed: {
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