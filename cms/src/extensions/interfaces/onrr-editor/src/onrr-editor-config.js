import { OnrrHyperlink } from './plugins/onrr-editorjs-hyperlink'
import ColorPlugin from 'editorjs-text-color-plugin'
import { OnrrLinkAutocomplete } from './plugins/onrr-link-autocomplete'
import Paragraph from '@editorjs/paragraph'
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import { OnrrNestedList } from './plugins/onrr-editorjs-nested-list';
import CodeTool from '@editorjs/code';
import Table from '@editorjs/table';
import ImageTool from './plugins/onrr-image-tool';
import HorizontalRuleTool from './plugins/horizontal-rule';
import CollectionsTool from './plugins/collections-tool';
import { OnrrAlignmentBlockTune } from './plugins/onrr-editorjs-alignment-blocktune';

export class OnrrEditorConfig {
    #config;
    constructor(config) {
        if (typeof config !== 'object') {
            throw new TypeError('The config parameter must be an object.');
        }

        this.#config = {
            holder: config.holder,
            inlineToolbar: ['bold', 'italic', 'hyperlink', 'color', 'linkAutocomplete'],
            minHeight: 24,
            onChange: config.changeHandler,
            data: config.data,
            tools: {
                paragraph: {
                    class: Paragraph,
                    tunes: ['alignmentTune']
                },
                header: {
                    class: Header,
                    tunes: ['alignmentTune'],
                    inlineToolbar: true
                },
                list: {
                    class: OnrrNestedList,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    }
                },
                code: {
                    class: CodeTool
                },
                image: {
                    class: ImageTool,
                    config: {
                        picker: config.picker,
                        baseURL: config.baseURL
                    },
                    tunes: ['alignmentTune']
                },
                table: {
                    class: Table,
                    config: {
                        rows: 2,
                        cols: 3,
                        withHeadings: true
                    },
                    tunes: ['alignmentTune']
                },
                quote: {
                    class: Quote
                },
                collection: {
                    class: CollectionsTool,
                    config: {
                        collectionsEndpoint: `${config.baseURL}collections`,
                        fieldsEndpoint: `${config.baseURL}fields`,
                        contactsEndpoint: `${config.baseURL}items/contacts?limit=-1`,
                        reporterLettersTopicsEndpoint: `${config.baseURL}items/reporter_letters?fields[]=id,title,topics`,
                    }
                },
                horizontalrule: {
                    class: HorizontalRuleTool,
                    inlineToolbar: true,
                },
                hyperlink: {
                    class: OnrrHyperlink,
                    config: {
                        shortcut: 'CMD+L',
                        target: '_blank',
                        rel: 'nofollow',
                        availableTargets: ['_blank', '_self'],
                        availableRels: ['author', 'noreferrer'],
                        validate: false,
                    }
                },
                color: {
                    class: ColorPlugin,
                    config: {
                        colorCollections: ['#1A22FE','#D83933','#C05500','#005024'],
                        defaultColor: '#000000',
                        type: 'text', 
                        customPicker: true
                    } 
                },
                linkAutocomplete: {
                    class: OnrrLinkAutocomplete,
                    config: {
                        endpoint: `${config.baseURL}link-autocomplete`,
                        queryParam: 'term' 
                    }
                },
                alignmentTune: {
                    class: OnrrAlignmentBlockTune,
                    config:{
                        default: "left"
                    },
                }
            }
        }
    }

    getConfig() {
        return this.#config;
    }
}