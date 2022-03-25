
export const fileCollectionMixin = {
  data() {
    return {
      BASE_URL: process.env.VUE_APP_API_URL,
    }
  },
  props: {
    collection: [Array, Object],
    collectionName: String,
    collectionLayout: String,
  },
  methods: {
    /**
     * 
     * @param {*} url | string
     * @param {*} item | object
     * @returns 
     */
    fileLink(url, item) {
      // console.log('fileLink item ----------> ', item)
      let link
      if (item.file) {
        link = `${ url }${ item.file.filename_download }`
      } else if (item.link ) {
        link = item.link
      }

      return link
    },
    accessibleFileLink(url, item) {
      let link
      if (item.accessible_file) {
        link = `${ url }${ item.accessible_file.filename_download }`
      } 
      return link
    },
  },
  computed: {
    slicedCollection() {
      const c = this.collection && this.collection.slice(0,5)
      return c
    }
  }
}