<template>
  <div>
  <v-dialog :model-value="fileHandler" @update:model-value="unsetFileHandler" @esc="unsetFileHandler">
    <v-card>
      <v-card-title>
        <i18n-t keypath="upload_from_device" />
      </v-card-title>
      <v-card-text>
        <v-upload
          :ref="uploaderComponentElement"
          @input="handleFile"
          :multiple="false"
          :folder="folder"
          from-library
          from-url
        />
      </v-card-text>
      <v-card-actions>
        <v-button secondary @click="unsetFileHandler">
          <i18n-t keypath="cancel" />
        </v-button>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- <v-dialog :model-value="linkHandler !== null" @update:model-value="unsetLinkHandler" @esc="unsetLinkHandler">
    <v-card>
      <v-card-title>
        FOO
      </v-card-title>
      <v-card-text>
        FOO
      </v-card-text>
      <v-card-actions>
        <v-button secondary @click="unsetFileHandler">
          <i18n-t keypath="cancel" />
        </v-button>
      </v-card-actions>
    </v-card>
  </v-dialog>   -->
  <!-- <CollectionsModal ref="collectionsModal" :modelValue="collectionsHandler !== null" :escValue="unsetCollectionHandler" /> -->
  <div :class="className" ref="editorElement"></div>
  </div>
</template>

<script>
  import { defineComponent, ref, onMounted, onUnmounted, watch, inject } from 'vue';
  import debounce from 'debounce';
  import EditorJS from '@editorjs/editorjs';
  // import CollectionsModal from './components/CollectionsModal.vue';

  // Plugins
  import SimpleImageTool from '@editorjs/simple-image';
  import ParagraphTool from '@editorjs/paragraph';
  import QuoteTool from '@editorjs/quote';
  import WarningTool from '@editorjs/warning';
  import ChecklistTool from '@editorjs/checklist';
  import DelimiterTool from '@editorjs/delimiter';
  // import TableTool from '@editorjs/table';
  import TableTool from './custom-plugins/table-custom/index'
  import CodeTool from '@editorjs/code';
  import headerTool from '@editorjs/header';
  import UnderlineTool from '@editorjs/underline';
  import EmbedTool from '@editorjs/embed';
  import MarkerTool from '@editorjs/marker';
  import RawToolTool from '@editorjs/raw';
  import InlineCodeTool from '@editorjs/inline-code';
  // import TextAlignTool form '@canburaks/text/-align-editorjs';
  import AlertTool from 'editorjs-alert';
  import StrikethroughTool from '@itech-indrustries/editorjs-strikethrough';
  import ListTool from './custom-plugins/plugin-list-patch';
  import ImageTool from './custom-plugins/plugin-image-patch';
  import AttachesTool from './custom-plugins/plugin-attaches-patch';
  import PersonalityTool from './custom-plugins/plugin-personality-patch';
  // import SimpleTabs from "./custom-plugins/simple-tabs/index.js";
  import CollectionsTool from "./custom-plugins/plugin-collections";
//  import Links from "./custom-plugins/plugin-links";
  import horizontalruleTool from "./custom-plugins/plugin-horizontal-rule";
//  import LinkAutocomplete from "./custom-plugins/plugin-link-autocomplete-patch.js"
  import LinksInline from "./custom-plugins/plugin-links-inline.js"
//  import LinksList from "./custom-plugins/plugin-links-list.js";
  import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
  import ColorPlugin from './custom-plugins/editorjs-text-color-plugin/src/index';
  import CustomBlocksTool from './custom-plugins/plugin-custom-blocks';
  //import Tooltip from '';

  export default defineComponent({
    emits: ['input', 'error'],
    props: {
      value: {
        type: Object,
        default: null,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      placeholder: {
        type: String,
        default: null,
      },
      tools: {
        type: Array,
        default: () => ['header', 'list', 'code', 'image', 'style','paragraph', 'table','tooltip', 'quote', 'underline', 'collection', 'horizontalrule', 'linksInline', 'customBlocks'],
      },
      font: {
        type: String,
        default: 'sans-serif',
      },
      bordered: {
        type: Boolean,
        default: true,
      },
      folder: {
        type: String,
        default: undefined,
      },
    },
    components: {
      // CollectionsModal
    },
    setup(props, { emit, attrs }) {
      const api = inject('api');

      function addQueryToPath(path, query) {
        const queryParams = [];

        for (const [key, value] of Object.entries(query)) {
          queryParams.push(`${key}=${value}`);
        }

        return path.includes('?') ? `${path}&${queryParams.join('&')}` : `${path}?${queryParams.join('&')}`;
      }

      function getToken() {
        return api.defaults.headers?.['Authorization']?.split(' ')[1] || null;
      }

      function addTokenToURL(url, token) {
        const accessToken = token || getToken();
        if (!accessToken) return url;
        return addQueryToPath(url, { access_token: accessToken });
      }

      const editorjsInstance = ref(null);
      const uploaderComponentElement = ref(null);
      const editorElement = ref(null);
      const fileHandler = ref(null);
      const linkHandler = ref(null);
      const collectionsHandler = ref(null);

      const editorValueEmitter = debounce(function saver(context) {
        if (props.disabled || !context) return;

        context.saver
          .save()
          .then((result) => {
            if (!result || result.blocks.length < 1) {
              emit('input', null);
            } else {
              emit('input', result);
            }
          })
          .catch(() => emit('error', 'Cannot get content'));
      }, 250);

      onMounted(() => {

        editorjsInstance.value = new EditorJS({
          // @ts-ignore
          logLevel: 'ERROR',
          holder: editorElement.value,
          data: getPreparedValue(props.value),
          // Readonly makes troubles in some cases, also requires all plugins to implement it.
          // https://github.com/codex-team/editor.js/issues/1669
          readOnly: false,
          placeholder: props.placeholder,
          tools: buildToolsOptions(),
          minHeight: 24,
          onChange: editorValueEmitter,
        });

        if (attrs.autofocus) {
          editorjsInstance.value.focus();
        }
      });

      onUnmounted(() => {
        if (!editorjsInstance.value) return;
        editorjsInstance.value.destroy();
      });

      watch(
        () => props.value,
        (newVal, oldVal) => {
          if (
            !editorjsInstance.value ||
              // @TODO use better method for comparing.
            JSON.stringify(newVal?.blocks) === JSON.stringify(oldVal?.blocks)
          ) {
            return;
          }

          editorjsInstance.value.isReady.then(() => {
            if (
              editorjsInstance.value.configuration.holder.contains(document.activeElement) ||
                fileHandler.value !== null
            ) {
              return;
            }

            editorjsInstance.value.render(getPreparedValue(newVal));
          });
        }
      );

      return {
        editorjsInstance,
        editorElement,
        uploaderComponentElement,
        fileHandler,
        linkHandler,
        className: {
          [props.font]: true,
          bordered: props.bordered,
        },
        collectionsHandler,
        // Methods
        editorValueEmitter,
        unsetFileHandler,
        setFileHandler,
        handleFile,
        setLinkHandler,
        unsetLinkHandler,
        handleLink,
        getUploadFieldElement,
        addTokenToURL,
        getPreparedValue,
        buildToolsOptions,
        openCollectionsModal,
        unsetCollectionHandler,
      };

      function unsetFileHandler() {
        fileHandler.value = null;
      }

      function setFileHandler(handler) {
        fileHandler.value = handler;
      }

      function handleFile(event) {
        fileHandler.value(event);
        unsetFileHandler();
      }
      
function unsetLinkHandler() {
        fileHandler.value = null;
      }

      function setLinkHandler(handler) {
        //fileHandler.value = handler;
      }

      function handleLink(event) {
        //        fileHandler.value(event);
        //        unsetLinkHandler();
      }

      function getUploadFieldElement() {
        return uploaderComponentElement;
      }

      function getPreparedValue(value) {
        if (typeof value !== 'object') {
          return {
            time: null,
            version: 0,
            blocks: [],
          };
        }

        return {
          time: value?.time,
          version: value?.version,
          blocks: value?.blocks || [],
        };
      }


      function unsetCollectionHandler() {
        collectionsHandler.value = null;
      }

      function openCollectionsModal() {
        console.log('open collections modal yo!', this.$refs);
        collectionsHandler.value = true;
        return new Promise(resolve => {
          console.log('openCollectionsModal resolve yo -----> ', resolve);
          this.collectionSelected = resolve;
        });
      }

      /**
        * @returns {{}}
      */
      function buildToolsOptions() {
        const tools = {};

        const uploaderConfig = {
          addTokenToURL,
          baseURL: api.defaults.baseURL,
          picker: setFileHandler,
          getUploadFieldElement,
        };

        const defaults = {
          header: {
            class: headerTool,
            shortcut: 'CMD+SHIFT+H',
            inlineToolbar: true,
          },
          list: {
            class: ListTool,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+1',
          },
          embed: {
            class: EmbedTool,
            inlineToolbar: true,
          },
          paragraph: {
            class: ParagraphTool,
            inlineToolbar: true,
          },
          code: {
            class: CodeTool,
          },
          warning: {
            class: WarningTool,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
          },
          underline: {
            class: UnderlineTool,
            shortcut: 'CMD+SHIFT+U',
          },
          // textalign: {
          //   class: TextAlignTool,
          //   inlineToolbar: true,
          //   shortcut: 'CMD+SHIFT+A',
          // },
          strikethrough: {
            class: StrikethroughTool,
          },
          alert: {
            class: AlertTool,
          },
          table: {
            class: TableTool,
            inlineToolbar: true,
            withHeadings: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          quote: {
            class: QuoteTool,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
          },

          marker: {
            class: MarkerTool,
            shortcut: 'CMD+SHIFT+M',
          },
          inlinecode: {
            class: InlineCodeTool,
            shortcut: 'CMD+SHIFT+I',
          },
          delimiter: {
            class: DelimiterTool,
          },
          raw: {
            class: RawToolTool,
          },
          checklist: {
            class: ChecklistTool,
            inlineToolbar: true,
          },
          simpleimage: {
            class: SimpleImageTool,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: uploaderConfig,
            },
          },
          attaches: {
            class: AttachesTool,
            config: {
              uploader: uploaderConfig,
            },
          },
          personality: {
            class: PersonalityTool,
            config: {
              uploader: uploaderConfig,
            },
          },
          collection: {
            class: CollectionsTool,
            config: {
              collectionsEndpoint: '/collections',
              fieldsEndpoint: '/fields',
              contactsEndpoint: '/items/contacts?limit=-1',
              reporterLettersTopicsEndpoint: '/items/reporter_letters?fields[]=id,title,topics',
            }
          },
          customBlocks: {
            class: CustomBlocksTool
          },
       /*   links: {
            class: Links,
            config: {
              linksEndpoint: '/items/links',
              fieldsEndpoint: '/fields'
            }
          },
	  */	
          horizontalrule: {
            class: horizontalruleTool,
            inlineToolbar: true,
          },
          //tooltip: {
           //   class: Tooltip,
           //   inlineToolbar: true,
            //  config: {
             //   holder: "editorjs-tooltip"
             // }
            //},
          Color: {
            class: ColorPlugin,
            inlineToolbar: true,
            config: {
              defaultColor: "#4F5464",
              colorCollections: ["#71500F","#1A22FE","#4F5464"],
               type: 'text'
            }
          },
          alignmentTune: {
            class: AlignmentTuneTool
          },
      /*    linkAutocomplete: {
            class: LinkAutocomplete,
            inlineToolbar: true,
            config: {
              endpoint: '/items/links',
              queryParam: 'search',
              icons: {
                pdf: '/assets/d4c8b602-4e9f-45fd-bc65-dd41fe85c390'
              },
	            base: 'https://dev-onrr-cms.app.cloud.gov'	 
            },
          },
	  */
          linksInline: {
            class: LinksInline,
            inlineToolbar: true,
            config: {
              endpoint: '/items/links?limit=-1',
              page_id: document.URL.split('/').pop(), 
              queryParam: 'search',
	            base: 'https://dev-onrr-cms.app.cloud.gov'
		    
            },
	
          },
         /* linksList: {
            class: LinksList,
            inlineToolbar: true,
            config: {
              endpoint: '/items/links?limit=-1',
              queryParam: 'search',
    	        icons: {
	              pdf: '/assets/d4c8b602-4e9f-45fd-bc65-dd41fe85c390'
	            },
              base: 'https://dev-onrr-cms.app.cloud.gov'
            },
          },
	  */
        };

        // Build current tools config.

        for (const toolName of props.tools) {
          // @ts-ignore
          console.debug(" inline editor defaults : ", defaults, " tool name: ", toolName);
          const defaultsHasProperty = Object.prototype.hasOwnProperty.call(defaults, toolName);
          if (defaultsHasProperty) {
            tools[toolName.toString()] = defaults[toolName];
          }
        }

				if ('header' in tools) {
					tools.header.tunes = ['alignmentTune'];
				}

        // if ('color' in tools) {
				// 	tools.color.tunes = ['alignmentTune'];
				// }

        if ('paragraph' in tools) {
					tools.paragraph.tunes = ['alignmentTune'];
				}

				if ('table' in tools) {
					tools.table.tunes = ['alignmentTune'];
				}

				if ('image' in tools) {
					tools.image.tunes = ['alignmentTune'];
				}

			  return tools;
		  }
    }
  });
</script>

<style lang="css" scoped>
  .bordered {
    padding: var(--input-padding);
    background-color: var(--background-page);
    border: var(--border-width) solid var(--border-normal);
    border-radius: var(--border-radius);
  }

  .bordered:hover {
    border-color: var(--border-normal-alt);
  }

  .bordered:focus-within {
    border-color: var(--primary);
  }

  .monospace {
    font-family: var(--family-monospace);
  }

  .serif {
    font-family: var(--family-serif);
  }

  .gold-text-color {
    color: #71500F !important;
  }
  .blue-text-color {
    color: #1A22FE !important;
  }
  /* .tooltip-tool__input{
  border: 0;
  border-radius: 0 0 4px 4px;
  border-top: 1px solid rgba(201,201,204,.48);
}

.tooltip-tool__span{
  padding: 3px;
  border-radius: 6px;
}

.tooltip-tool__underline{
  text-decoration: underline;
}

.tooltip-color::before {
  background-color: transparent;
}

.tooltip-color::after {
  background-color: transparent;
}

.tooltip-text-color {
  color: transparent;
}

.cdx-tooltip {
  display: inline-block;
} */

  .sans-serif {
    font-family: var(--family-sans-serif);
  }
  
</style>

<style src="./editorjs-content-reset.css"></style>
<style src="./editorjs-components.css"></style>

