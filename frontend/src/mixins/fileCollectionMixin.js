
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
    fileLink(item) {
      // console.log('fileLink item ----------> ', item)
      let link
      if (item.file) {
        link = `/assets/${ item.file.id }`
      } else if (item.accessible) {
        link = `${ this.API }/assets/${ item.accessible_file.id }`
      } else if (item.link ) {
        link = item.link
      }
      // console.log('fileLink ----------> ', link)
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