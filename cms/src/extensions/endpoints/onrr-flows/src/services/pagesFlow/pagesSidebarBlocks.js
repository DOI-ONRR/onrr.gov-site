import { 
    getPagesSidebarBlocks,
    createPagesSidebarBlocksItem,
    deletePagesSidebarBlocksItem,
    updatePagesSidebarBlocksItem
} from '../../operations/pages';
import { runContentBlocks } from '../contentBlocksFlow';
import { runCollectionBlocks } from '../collectionBlocksFlow';
import { ApiMessages, LocalAuthToken, UpstreamAuthToken, CollectionTypes, Endpoints } from '../../constants';
import diff from 'deep-diff';
import { logger } from '../../utils/logger';

export async function runPagesSidebarBlocks(pageId) {
    try {
        var appliedChanges = [];
        const latestBlocks = await getPagesSidebarBlocks(pageId, Endpoints.LOCAL, LocalAuthToken);
        const previousBlocks = await getPagesSidebarBlocks(pageId, Endpoints.UPSTREAM, UpstreamAuthToken);
        for (const latestSidebarBlock of (latestBlocks || [])) {
            if (!previousBlocks.find(block => block.id === latestSidebarBlock.id)) {
                var newItem = JSON.parse(JSON.stringify(latestSidebarBlock));
                newItem.item = latestSidebarBlock.item.id;
                const createId = await createPagesSidebarBlocksItem(newItem, Endpoints.UPSTREAM, UpstreamAuthToken);
                appliedChanges.push({
                    id: createId,
                    collection: CollectionTypes.PAGES_PAGE_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                });
            } else {
                const previousSidebarBlock = previousBlocks.find(block => block.id === latestSidebarBlock.id);
                const blockChanges = diff(previousSidebarBlock, latestSidebarBlock);
                if (blockChanges) {
                    var updatedItem = JSON.parse(JSON.stringify(latestSidebarBlock));
                    updatedItem.item = latestSidebarBlock.item.id;
                    const updateId = await updatePagesSidebarBlocksItem(updatedItem, Endpoints.UPSTREAM, UpstreamAuthToken);
                    appliedChanges.push({
                        id: updateId,
                        collection: CollectionTypes.PAGES_PAGE_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
            let flowResult;
            switch (latestSidebarBlock.collection) {
                case CollectionTypes.CONTENT_BLOCKS:
                    flowResult = await runContentBlocks(latestSidebarBlock.item.id);
                    break;
                case CollectionTypes.COLLECTION_BLOCKS:
                    flowResult = await runCollectionBlocks(latestSidebarBlock.item.id);
                    break;
            }
            if (flowResult && !Array.isArray(flowResult)) {
                appliedChanges.push(flowResult);
            } else if (Array.isArray(flowResult) && flowResult.length > 0) {
                appliedChanges.concat(flowResult);
            }
        }
        for (const previousSidebarBlock of (previousBlocks || [])) {
            if (!latestBlocks.find(block => block.id === previousSidebarBlock.id)) {
                const deleteId = await deletePagesSidebarBlocksItem(previousSidebarBlock.id, Endpoints.UPSTREAM, UpstreamAuthToken);
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
        logger.error(`Error in runPagesSidebarBlocks (${pageId}):\n `, error);
        throw new Error('Error in runPagesSidebarBlocks');
    }
}