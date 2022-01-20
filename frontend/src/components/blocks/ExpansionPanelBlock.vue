<template>
    <div class="pa-1">
        <v-expansion-panels
            accordion
            multiple>
            <v-expansion-panel
            v-for="(block,i) in blockItems"
            :key="i"
            class="mb-4"
            disable-icon-rotate
            >
            <v-expansion-panel-header color="expansionPanel">
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
            isOpen: false
        }
    },
    props: {
        block: [Array, Object],
    },
    components: {
        LayoutBlock
    },
    methods: {
    },
    computed: {
        blockItems() {
            const blocks = this.block.item.expansion_panel_blocks
            const blockItems = []

            blocks && blocks.forEach(obj => {
                if(obj.item !== null) {
                    if (obj && obj.item.__typename === 'expansion_panel_block_label') {
                        blockItems.push({ ...obj, panelBlocks: [] })
                    } else {
                        blockItems[blockItems.length - 1].panelBlocks.push(obj)
                    }
                }
            })
            return blockItems
        },
    }
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