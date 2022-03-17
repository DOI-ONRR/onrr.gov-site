<template>
    <div class="pa-1" id="foo-bar">
        <v-expansion-panels
            accordion
            :value="openedPanel">
            <v-expansion-panel
            v-for="(block,i) in blockItems"
            :key="i"
            class="mb-4"
            disable-icon-rotate
            @click="addParamsToLocation({ panel: formattedLabel(block.item.block_label)  })"
            >
            <v-expansion-panel-header 
                :ref="formattedLabel(block.item.block_label)"
                color="expansionPanel">
                {{ block.item.block_label }}
                <template v-slot:actions>
                    <v-icon color="secondary" class="v-icon-plus">
                       mdi-plus-box
                    </v-icon>
                    <v-icon color="secondary" class="v-icon-minus">
                       mdi-minus-box
                    </v-icon>
                </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-4">
                <LayoutBlock :layoutBlocks="block.panelBlocks"></LayoutBlock>
            </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
    
</template>

<script>
import { formatToSlug } from '@/js/utils'
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')

import { 
  pageBlockMixin,
  editorBlockMixin
} from '@/mixins'
export default {
    mixins: [pageBlockMixin, editorBlockMixin],
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
            return blockItems
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
    created() {
        // this.openedPanel()
    },
}
</script>

<style lang="scss">
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