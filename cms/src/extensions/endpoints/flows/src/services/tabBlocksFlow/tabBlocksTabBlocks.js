import { 
    getTabBlocksTabBlocks,
    deleteTabBlocksTabBlocksItem
} from '../../operations/tabBlocks';
import { runCardBlocks } from '../cardBlocksFlow';
import { runContentBlocks } from '../contentBlocksFlow';
import { runExpansionPanels } from '../expansionPanelsFlow';
import { runTabBlocks } from '../tabBlocksFlow';
import { runTabBlockLabel } from '../tabBlocksFlow';
import { runTabBlocksTabBlocksItem } from '../tabBlocksFlow';
import { Endpoints, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runTabBlocksTabBlocks(tabBlockId) {
    try {
        const appliedChanges = [];
        const latest = await getTabBlocksTabBlocks(tabBlockId, Endpoints.LOCAL);
        for (const tabBlock of latest) {
            let flowResponse;
            switch (tabBlock.item.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    flowResponse = await runCardBlocks(tabBlock.item.id);
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    flowResponse = await runContentBlocks(tabBlock.item.id);
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    flowResponse = await runExpansionPanels(tabBlock.item.id);
                    break;
                case CollectionTypes.TAB_BLOCKS:
                    flowResponse = await runTabBlocks(tabBlock.item.id);
                    break;
                case CollectionTypes.TAB_BLOCK_LABEL:
                    flowResponse = await runTabBlockLabel(tabBlock.item.id);
                    break;
            }
            if (flowResponse) {
                appliedChanges.push(flowResponse);
            }
            appliedChanges.push(await runTabBlocksTabBlocksItem(tabBlock.id));
        };
        const previous = await getTabBlocksTabBlocks(tabBlockId, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (changes) {
            for (const change of changes) {
                if (change.kind === 'A' && change.item.kind === 'D') {
                    const deletedItemId = await deleteTabBlocksTabBlocksItem(change.item.lhs.id);
                    appliedChanges.push({
                        id: deletedItemId,
                        collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                        message: ApiMessages.ITEM_DELETED
                    });
                }
            }
        }
        return appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runTabBlocksTabBlockFlow (${tabBlockId}):`, error)
        throw new Error('Error in runTabBlocksTabBlockFlow');
    }
}