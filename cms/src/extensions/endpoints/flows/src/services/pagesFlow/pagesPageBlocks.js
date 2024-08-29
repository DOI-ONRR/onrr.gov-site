import { 
    getPagesPageBlocks,
    createPagesPageBlocksItem,
    deletePagesPageBlocksItem,
    updatePagesPageBlocksItem
} from '../../operations/pages';
import { runCardBlocks } from '../cardBlocksFlow/cardBlocks';
import { runContentBlocks } from '../contentBlocksFlow';
import { runExpansionPanels } from '../expansionPanelsFlow/expansionPanels';
import { runTabBlocks } from '../tabBlocksFlow';
import { ApiMessages, AuthToken, CollectionTypes, Endpoints } from '../../constants';
import diff from 'deep-diff';
import { logger } from '../../utils/logger';

export async function runPagesPageBlocks(pageId) {
    try {
        var appliedChanges = [];
        const latestBlocks = await getPagesPageBlocks(pageId, Endpoints.LOCAL);
        const previousBlocks = await getPagesPageBlocks(pageId, Endpoints.UPSTREAM);
        for (const latestPageBlock of latestBlocks) {
            if (!previousBlocks.find(block => block.id === latestPageBlock.id)) {
                let newItem = JSON.parse(JSON.stringify(latestPageBlock));
                newItem.item = latestPageBlock.item.id;
                const createId = await createPagesPageBlocksItem(newItem, Endpoints.UPSTREAM, AuthToken);
                appliedChanges.push({
                    id: createId,
                    collection: CollectionTypes.PAGES_PAGE_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                });
            } else {
                let flowResult;
                switch (latestPageBlock.collection) {
                    case CollectionTypes.CARD_BLOCKS:
                        flowResult = await runCardBlocks(latestPageBlock.item.id);
                        break;
                    case CollectionTypes.CONTENT_BLOCKS:
                        flowResult = await runContentBlocks(latestPageBlock.item.id);
                        break;
                    case CollectionTypes.EXPANSION_PANELS:
                        flowResult = await runExpansionPanels(latestPageBlock.item.id);
                        break;
                    case CollectionTypes.TAB_BLOCKS:
                        flowResult = await runTabBlocks(latestPageBlock.item.id);
                        break;
                }
                appliedChanges.push(flowResult);
                const previousPageBlock = previousBlocks.find(block => block.id === latestPageBlock.id);
                const blockChanges = diff(previousPageBlock, latestPageBlock);
                if (blockChanges) {
                    let updatedItem = JSON.parse(JSON.stringify(latestPageBlock));
                    updatedItem.item = latestPageBlock.item.id;
                    const updateId = await updatePagesPageBlocksItem(updatedItem, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        id: updateId,
                        collection: CollectionTypes.PAGES_PAGE_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
        }
        for (const previousPageBlock of previousBlocks) {
            if (!latestBlocks.find(block => block.id === previousPageBlock.id)) {
                const deleteId = await deletePagesPageBlocksItem(previousPageBlock.id, Endpoints.UPSTREAM, AuthToken);
                appliedChanges.push({
                    id: deleteId,
                    collection: CollectionTypes.PAGES_PAGE_BLOCKS,
                    message: ApiMessages.ITEM_DELETED
                });
            }
        }
        return appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runPagesPageBlocks (${pageId}):\n `, error);
        throw new Error('Error in runPagesPageBlocks');
    }
}