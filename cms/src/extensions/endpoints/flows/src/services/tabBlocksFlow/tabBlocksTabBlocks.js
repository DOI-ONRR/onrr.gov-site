import { 
    getTabBlocksTabBlocks,
    deleteTabBlocksTabBlocksItem,
    createTabBlocksTabBlocksItem,
    updateTabBlocksTabBlocksItem,
} from '../../operations/tabBlocks';
import { runCardBlocks } from '../cardBlocksFlow';
import { runContentBlocks } from '../contentBlocksFlow';
import { runExpansionPanels } from '../expansionPanelsFlow';
import { runTabBlocks } from '../tabBlocksFlow';
import { runTabBlockLabel } from '../tabBlocksFlow';
import { Endpoints, CollectionTypes, ApiMessages, AuthToken } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runTabBlocksTabBlocks(tabBlockId) {
    try {
        const appliedChanges = [];
        const latestTabBlocks = await getTabBlocksTabBlocks(tabBlockId, Endpoints.LOCAL);
        const previousTabBlocks = await getTabBlocksTabBlocks(tabBlockId, Endpoints.UPSTREAM);
        for (const latestTabBlock of latestTabBlocks) {
            if (!previousTabBlocks.find(block => block.id === latestTabBlock.id)) {
                let newItem = JSON.parse(JSON.stringify(latestTabBlock));
                newItem.item = latestTabBlock.item.id;
                const createId = await createTabBlocksTabBlocksItem(newItem, Endpoints.UPSTREAM, AuthToken);
                appliedChanges.push({
                    id: createId,
                    collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                });
            } else {
                const previousTabBlock = previousTabBlocks.find(block => block.id === latestTabBlock.id);
                const blockChanges = diff(previousTabBlock, latestTabBlock);
                if (blockChanges) {
                    let updatedItem = JSON.parse(JSON.stringify(latestTabBlock));
                    updatedItem.item = latestTabBlock.item.id;
                    const updateId = await updateTabBlocksTabBlocksItem(updatedItem, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        id: updateId,
                        collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
            let flowResponse;
            switch (latestTabBlock.item.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    flowResponse = await runCardBlocks(latestTabBlock.item.id);
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    flowResponse = await runContentBlocks(latestTabBlock.item.id);
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    flowResponse = await runExpansionPanels(latestTabBlock.item.id);
                    break;
                case CollectionTypes.TAB_BLOCKS:
                    flowResponse = await runTabBlocks(latestTabBlock.item.id);
                    break;
                case CollectionTypes.TAB_BLOCK_LABEL:
                    flowResponse = await runTabBlockLabel(latestTabBlock.item.id);
                    break;
            }
            if (flowResponse) {
                appliedChanges.push(flowResponse);
            }
        };
        for (const previousTabBlock of previousTabBlocks) {
            if (!latestTabBlocks.find(block => block.id === previousTabBlock.id)) {
                const deletedItemId = await deleteTabBlocksTabBlocksItem(previousTabBlock.id, Endpoints.UPSTREAM, AuthToken);
                appliedChanges.push({
                    id: deletedItemId,
                    collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                    message: ApiMessages.ITEM_DELETED
                });
            }
        }
        return appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runTabBlocksTabBlockFlow (${tabBlockId}):`, error)
        throw new Error('Error in runTabBlocksTabBlockFlow');
    }
}