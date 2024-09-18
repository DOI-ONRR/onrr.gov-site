import { 
    getExpansionPanelsExpansionPanelBlocks,
    createExpansionPanelsExpansionPanelBlocksItem,
    deleteExpansionPanelsExpansionPanelBlocksItem,
    updateExpansionPanelsExpansionPanelBlocksItem
} from '../../operations/expansionPanels';
import { Endpoints, UpstreamAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { runCardBlocks } from '../cardBlocksFlow';
import { runContentBlocks } from '../contentBlocksFlow';
import { runExpansionPanelBlockLabel } from './expansionPanelBlockLabel';
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runExpansionPanelsExpansionPanelBlocks(expansionPanelId) {
    try {
        var appliedChanges = [];
        const latestExpansionPanelBlocks = await getExpansionPanelsExpansionPanelBlocks(expansionPanelId, Endpoints.LOCAL);
        const previousExpansionPanelBlocks = await getExpansionPanelsExpansionPanelBlocks(expansionPanelId, Endpoints.UPSTREAM);
        for (var latestBlock of latestExpansionPanelBlocks) {
            if (!previousExpansionPanelBlocks.find(prevBlock => prevBlock.id === latestBlock.id)) {
                const newBlock = JSON.parse(JSON.stringify(latestBlock));
                newBlock.item = latestBlock.item.id;
                const createdId = await createExpansionPanelsExpansionPanelBlocksItem(newBlock, Endpoints.UPSTREAM, UpstreamAuthToken);
                appliedChanges.push({
                    id: createdId,
                    collection: CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                });
            } else {
                const previousBlock = JSON.parse(JSON.stringify(previousExpansionPanelBlocks.find(prevBlock => prevBlock.id === latestBlock.id)));
                const blockChanges = diff(previousBlock, latestBlock);
                if (blockChanges) {
                    var updatedItem = JSON.parse(JSON.stringify(previousBlock));
                    updatedItem.item = previousBlock.item.id;
                    const updatedId = await updateExpansionPanelsExpansionPanelBlocksItem(updatedItem, Endpoints.UPSTREAM, UpstreamAuthToken);
                    appliedChanges.push({
                        id: updatedId,
                        collection: CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
            var flowResult = null;
            switch (latestBlock.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    flowResult = await runCardBlocks(latestBlock.item.id);
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    flowResult = await runContentBlocks(latestBlock.item.id);
                    break;
                case CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL:
                    flowResult = await runExpansionPanelBlockLabel(latestBlock.item.id);
                    break;
            }
            if (flowResult) {
                appliedChanges.push(flowResult);
            }
        }
        for (var previousBlock of previousExpansionPanelBlocks) {
            if (!latestExpansionPanelBlocks.find(block => block.id === previousBlock.id)) {
                const deletedId = await deleteExpansionPanelsExpansionPanelBlocksItem(previousBlock.id, Endpoints.UPSTREAM, UpstreamAuthToken);
                appliedChanges.push({
                    id: deletedId,
                    collection: CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS,
                    message: ApiMessages.ITEM_DELETED
                })
            }
        }
        return appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runExpansionPanelsExpansionPanelBlocks (${expansionPanelId}):`, error)
        throw new Error('Error in runExpansionPanelsExpansionPanelBlocks');
    }
}