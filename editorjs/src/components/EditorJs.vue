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
  import ColorPlugin from '../custom-plugins/editorjs-text-color-plugin/src/index';
  import Links from '../custom-plugins/plugin-links';
  import LinksInline from '../custom-plugins/plugin-links-inline';
  import LinksList from '../custom-plugins/plugin-links-list';
  import AlignmentTuneTool from 'editorjs-text-alignment-blocktune'
  import ImageTool from '../custom-plugins/plugin-image-patch';
  import CustomBlocksTool from '../custom-plugins/plugin-custom-blocks';
  import TableTool from '@editorjs/table';
  import Tooltip from 'editorjs-tooltip';

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
            tooltip: {
              class: Tooltip,
              config: {
                location: 'left',
        highlightColor: '#FFEFD5',
        backgroundColor: '#154360',
        textColor: '#FDFEFE',
        holder: "codex-editor"
              }
            },
            Color: {
            class: ColorPlugin,
            config: {
              defaultColor: "#000000",
              colorCollections: ["#71500F","#1A22FE","#000000"],
               type: 'text'
            }
          },
            collection: {
              class: Collections,
              inlineToolbar: true,
              config: {
                collectionsEndpoint: 'http://localhost:8055/collections',
                fieldsEndpoint: 'http://localhost:8055/fields',
                contactsEndpoint: 'http://localhost:8055/items/contacts?limit=-1',
                reporterLettersTopicsEndpoint: 'http://localhost:8055/items/reporter_letters?fields[]=id,title,topics',
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
            linksInline: {
              class: LinksInline,
              inlineToolbar: true,    
              config: {
                endpoint: 'http://localhost:8055/items/links?limit=-1',
                fields: 'http://localhost:8055/fields',
                icons: {
                  pdf: 'http://localhost:8055/assets/915d45f6-233d-4855-b0f9-736d2b61214a'
                } 
              }
            },
            linksList: {
              class: LinksList,
              inlineToolbar: true,    
              config: {
                endpoint: 'http://localhost:8055/items/links?limit=-1',
                fields: 'http://localhost:8055/fields',
                icons: {
                  pdf: 'http://localhost:8055/assets/915d45f6-233d-4855-b0f9-736d2b61214a'
                } 
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
            },
            customBlocks: {
              class: CustomBlocksTool
            },
            table: {
              class: TableTool, 
              inlineToolbar: true,
              tunes: ['alignmentTune']
            },
          },
          onReady: function() {
            console.log("ready 123")
          },
          onChange: function(api, event) {
            console.log("change ", api, " event ", event) 
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

  .gold-text-color {
    color: #71500F !important;
  }
  .blue-text-color {
    color: #1A22FE !important;
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
