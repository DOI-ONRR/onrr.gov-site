<template>
  <div>
    <div>
      <h1 style="text-align:center">This is vue editor.js</h1>
    </div>

    <div class="editorx_body">
      <!--editorjs id-->
      <div class id="codex-editor"/>
    </div>
    <button style="margin-left: 30%" type="button" name="button" @click="save()">save</button>
    <div class="editorx_body">
      <pre>{{value}}</pre>
    </div>
  </div>
</template>



<script>
import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph"
import List from "@editorjs/list"
// import SimpleTabs from '../custom-plugins/simple-tabs'
import Collections from '../custom-plugins/plugin-collections'
import HorizontalRuleTool from '../custom-plugins/plugin-horizontal-rule'
import LinkAutocomplete from '../custom-plugins/plugin-link-autocomplete-patch'
import LinkTool from '@editorjs/link';
import Links from '../custom-plugins/plugin-links'

export default {
  data() {
    return {
      value: null
    }
  },
  methods: {
    save: function() {
      window.editor.save().then(savedData => {
        console.log(savedData)
        this.value = savedData
      })
    },
    myEditor: function() {
      window.editor = new EditorJS({
        holder: "codex-editor",
        autofocus: true,
        /**
         * This Tool will be used as default
         */
        initialBlock: "paragraph",
        tools: {
          header: {
            class: Header,
            shortcut: "CMD+SHIFT+H"
          },
          list: {
            class: List
          },
          paragraph: {
            class: Paragraph,
            config: {
              placeholder: "."
            }
          },
          horizontalrule: {
            class: HorizontalRuleTool,
            inlineToolbar: true,
          },
          collection: {
            class: Collections,
            inlineToolbar: true,
            config: {
              collectionsEndpoint: 'http://localhost:8055/collections',
              fieldsEndpoint: 'http://localhost:8055/fields'
            }
          },
          links: {
            class: Links,
            inlineToolbar: true,
            config: {
              linksEndpoint: 'http://localhost:8055/items/links',
              fieldsEndpoint: 'http://localhost:8055/fields'
            }
          },
          horizontalrule2: {
            class: HorizontalRuleTool,
            inlineToolbar: true,
          },
	            linkTool: {
            class: LinkTool,
              config: {
               endpoint: 'http://localhost:8055/items/links', // Your backend endpoint for url data fetching,
               headers: {
                'Access-Control-Allow-Origin': "*"
                }	       
              } 
          }, 
          link: {
            class: LinkAutocomplete,
            inlineToolbar: true,
            config: {
             endpoint: 'http://localhost:8055/items/links',
             queryParam: 'search'
            }
          },
        },
        onReady: function() {
          console.log("ready 123")
        },
        onChange: function() {
          console.log("change")
        }
      })
    }
  },
  mounted: function() {
  console.debug("DWGH: ", this)
    this.myEditor()
  }
}
</script>

<style lang="css" scoped >
.editorx_body {
  /* width: 62%
  margin-left: 15% */
  width: 60%;
  margin-left: 20%;
  border: 2px solid #f1f3f5;
  box-sizing: border-box;
}

.ce-block--focused {
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(9, 9, 121, 0.5438550420168067) 35%,
    rgba(0, 212, 255, 1) 100%
  )
}
</style>