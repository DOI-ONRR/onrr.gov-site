import { logger } from '../../utils';
import { getCardBlocksCardContentBlocks } from '../../operations/cardBlocks';
import { 
    createCardBlocksCardContentBlocksItem, 
    deleteCardBlocksCardContentBlocksItem,
    updateCardBlocksCardContentBlocksItem
} from '../../operations/cardBlocks';
import { runContentBlocks } from '../contentBlocksFlow';
import { ApiMessages, CollectionTypes, Endpoints, UpstreamAuthToken } from '../../constants';
import diff from 'deep-diff';

export async function runCardBlocksCardContentBlocks(id) {
    try {
        var appliedChanges = [];
        const latest = await getCardBlocksCardContentBlocks(id, Endpoints.LOCAL);
        const previous = await getCardBlocksCardContentBlocks(id, Endpoints.UPSTREAM);
        for (var latestContentBlock of latest) {
            if (!previous.find(prev => prev.id === latestContentBlock.id)) {
                var newContentBlock = JSON.parse(JSON.stringify(latestContentBlock));
                newContentBlock.item = latestContentBlock.item.id;
                const createOperationId = await createCardBlocksCardContentBlocksItem(newContentBlock, Endpoints.UPSTREAM, UpstreamAuthToken);
                appliedChanges.push({
                    id: createOperationId,
                    collection: CollectionTypes.CARD_BLOCKS_CARD_CONTENT_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                });
            } else {
                const previousBlock = JSON.parse(JSON.stringify(previous.find(prev => prev.id === latestContentBlock.id)));
                const blockChanges = diff(previousBlock, latestContentBlock);
                if (blockChanges) {
                    let updatedItem = JSON.parse(JSON.stringify(latestContentBlock));
                    updatedItem.item = latestContentBlock.item.id;
                    const updateId = await updateCardBlocksCardContentBlocksItem(updatedItem, Endpoints.UPSTREAM, UpstreamAuthToken);
                    appliedChanges.push({
                        id: updateId,
                        collection: CollectionTypes.CARD_BLOCKS_CARD_CONTENT_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
            const contentBlockFlowResult = await runContentBlocks(latestContentBlock.item.id);
            if (contentBlockFlowResult) {
                appliedChanges.push(contentBlockFlowResult);
            }
        }
        for (var previousContentBlock of previous) {
            if (!latest.find(latestBlock => latestBlock.id === previousContentBlock.id)) {
                const deleteOperationId = await deleteCardBlocksCardContentBlocksItem(previousContentBlock.id, Endpoints.UPSTREAM, UpstreamAuthToken)
                appliedChanges.push({
                    id: deleteOperationId,
                    collection: CollectionTypes.CARD_BLOCKS_CARD_CONTENT_BLOCKS,
                    message: ApiMessages.ITEM_DELETED
                })
            }
        }

        return appliedChanges;
    } catch (error) {
        logger.error('Error in runCardBlocksCardContentBlocks: ', error);
        throw new Error('Error in runCardBlocksCardContentBlocks');
    }
}