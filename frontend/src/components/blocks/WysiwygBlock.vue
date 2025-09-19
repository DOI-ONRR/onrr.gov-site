<template>
  <div v-html="processedContent"></div>
</template>

<script>
export default {
  name: 'WysiwygBlock',
  data () {
    return {}
  },
  props: {
    block: [Array, Object]
  },
  computed: {
    processedContent() {
      if (!this.block.item.content) return "";

      const parser = new DOMParser();
      const doc = parser.parseFromString(this.block.item.content, "text/html");
      const baseUrl = process.env.VUE_APP_API_URL;

      console.log('baseUrl', baseUrl)

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