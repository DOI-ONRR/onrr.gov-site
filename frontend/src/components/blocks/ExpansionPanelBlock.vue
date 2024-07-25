<template>
    <div class="pa-1">
        <div class="usa-accordion usa-accordion--bordered">
            <template v-for="(block, i) in blockItems">
                <h3 class="usa-accordion__heading" :key="i">
                    <button
                    type="button"
                    class="usa-accordion__button"
                    :aria-controls="`panel-content-${block.uuid}`"
                    >
                    {{ block.item.block_label }}
                    </button>
                </h3>
                <div :id="`panel-content-${block.uuid}`" class="usa-accordion__content usa-prose" :key="i">
                    <LayoutBlock :layoutBlocks="block.panelBlocks"></LayoutBlock>
                </div>
            </template>
        </div>
    </div>
    
</template>

<script>
import { formatToSlug } from '@/js/utils'
import accordion from "@uswds/uswds/js/usa-accordion";
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')
const { v4: uuidv4 } = require('uuid')

import { 
  pageBlockMixin,
  editorBlockMixin,
  accessibilityMixin
} from '@/mixins'
export default {
    mixins: [pageBlockMixin, editorBlockMixin, accessibilityMixin],
    name: 'ExpansionPanelBlock',
    data() {
        return {
            panels: [],
            panelQueryParamExists: false
        }
    },
    props: {
        block: [Array, Object],
    },
    components: {
        LayoutBlock
    },
    methods: {
        getAllIndexes(arr, val) {
            const indexes = []
            let i = -1
            while ((i = arr.indexOf(val, i+1)) != -1){
                indexes.push(i)
            }
            return indexes
        },
        addParamsToLocation(params) {
            setTimeout(() => {
                const query = { path: this.$route.fullPath, ...this.$route.query, query: params }
                this.$router.push(query).catch(() => {})
            }, 0);
            
        },
        formattedLabel(label) {
            return formatToSlug(label)
        },
        formattedLabelsArr() {
            const panelsArr = this.panels
            return panelsArr.map(block => this.formattedLabel(block.item.block_label))
        },
        panelClickHandler(blockLabel) {
            this.addParamsToLocation({ panel: this.formattedLabel(blockLabel) })
            this.removeAriaExpandedFromExpansionPanels()
        }
        
    },
    computed: {
        blockItems() {
            const blocks = this.block.item.expansion_panel_blocks
            const blockItems = []

            blocks && blocks.forEach(obj => {
                if(obj.item !== null) {
                    if (obj && obj.item.__typename === 'expansion_panel_block_label') {
                        this.panels.push(obj)
                        blockItems.push({ ...obj, panelBlocks: [] })
                    } else {
                        blockItems[blockItems.length - 1].panelBlocks.push(obj)
                    }
                }
            })

            return blockItems.map(item => ({ ...item, uuid: uuidv4()}))
        },
        openedPanel() {
            const defaultBlockId = this.block.item.open_by_default?.id
            let formattedLabelArr = this.formattedLabelsArr()
            let openedId

            if (this.$route.query.panel) {
                openedId = formattedLabelArr.findIndex(block => block === this.$route.query.panel)
            } else {
                if (defaultBlockId) {
                    openedId = this.panels.findIndex(block => block.item.id === defaultBlockId)
                }
            }
            return openedId
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.removeAriaExpandedFromExpansionPanels();
            accordion.on();
        })
    }
}
</script>

<style lang="scss" scoped>
.v-expansion-panel-header {
    font-size: 1.2rem;
    font-weight: bold;
}

.v-icon {
    color: var(--v-secondary-base) !important;
}

.v-expansion-panel-header .v-icon-minus {
    display: none;
}

.v-expansion-panel-header.v-expansion-panel-header--active .v-icon-plus {
    display: none;
}

.v-expansion-panel-header.v-expansion-panel-header--active .v-icon-minus {
    display: block;
}


</style>