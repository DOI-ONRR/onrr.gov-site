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
import ImageTool from "@editorjs/image";
// import SimpleTabs from '../custom-plugins/simple-tabs'
import Collections from '../custom-plugins/plugin-collections'
import HorizontalRuleTool from '../custom-plugins/plugin-horizontal-rule'
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune'

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
            shortcut: "CMD+SHIFT+H",
            tunes: ['alignmentTune']
          },
          list: {
            class: List,
          },
          paragraph: {
            class: Paragraph,
            config: {
              placeholder: "."
            },
            tunes: ['alignmentTune']
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
          image: {
            class: ImageTool,
          },
          alignmentTune: {
            class: AlignmentTuneTool,
            // config: {
            //   default: 'left',
            //   blocks: {
            //     header: 'left',
            //     list: 'left',
            //     paragraph: 'left'
            //   }
            // }
          }
        },
        onReady: function() {
          console.log("ready")
        },
        onChange: function() {
          console.log("change")
        }
      })
    }
  },
  mounted: function() {
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