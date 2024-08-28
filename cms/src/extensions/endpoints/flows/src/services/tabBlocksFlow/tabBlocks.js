import { 
    getTabBlocksById,
    getTabBlocksTabBlocks,
    createTabBlock,
    createTabBlocksTabBlocks,
    updateTabBlocksItem
} from '../../operations/tabBlocks';
import { runTabBlockLabel } from './tabBlockLabel';
import { runCardBlocks } from '../cardBlocksFlow';
import { runContentBlocks } from '../../services/contentBlocksFlow';
import { runExpansionPanels } from '../expansionPanelsFlow';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runTabBlocks(id) {
    try {
        const latest = await getTabBlocksById(id, Endpoints.LOCAL);
        const previous = await getTabBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind == 'E' && !change.lhs && !Object.hasOwn(change, 'path')) {
                const createdId = await createTabBlock(change.rhs, Endpoints.UPSTREAM, AuthToken);
                var tabBlockItems = [];
                const tabBlocksTabBlocks = await getTabBlocksTabBlocks(id, Endpoints.LOCAL);
                for (let block of tabBlocksTabBlocks) {
                    let response = {};
                    switch (block.item.collection) {
                        case CollectionTypes.TAB_BLOCK_LABEL:
                            response = await runTabBlockLabel(block.item.id);
                            break;
                        case CollectionTypes.CONTENT_BLOCKS:
                            response = await runContentBlocks(block.item.id);
                            break;
                        case CollectionTypes.CARD_BLOCKS:
                            response = await runCardBlocks(block.item.id);
                            break;
                        case CollectionTypes.EXPANSION_PANELS:
                            response = await runExpansionPanels(block.item.id);
                            break;
                        case CollectionTypes.TAB_BLOCKS:
                            response = await runTabBlocks(block.item.id);
                            break;
                    }
                    tabBlockItems.push({
                        id: block.id,
                        Sort: block.sort,
                        item: response.id,
                        collection: block.item.collection,
                        tab_blocks_id: {
                            id: id
                        }
                    })
                }
                await createTabBlocksTabBlocks(tabBlockItems, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: createdId,
                    collection: CollectionTypes.TAB_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind == 'E' && Object.hasOwn(change, 'path')) {
                const updatedItem = await updateTabBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    item: updatedItem,
                    collection: CollectionTypes.TAB_BLOCKS,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch(error) {
        logger.error(`Error in runTabBlocks (${id}):`, error)
        throw new Error('Error in runTabBlocks');
    }
}