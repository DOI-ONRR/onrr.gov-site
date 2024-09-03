import { 
    getTabBlocksById,
    createTabBlock,
    updateTabBlocksItem
} from '../../operations/tabBlocks';
import { runTabBlocksTabBlocks } from './tabBlocksTabBlocks';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runTabBlocks(id) {
    try {
        var appliedChanges = []
        const latest = await getTabBlocksById(id, Endpoints.LOCAL);
        const previous = await getTabBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            appliedChanges.push({
                id: id,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.NO_CHANGES
            });
        } else {
            for (const change of changes) {
                if (change.kind == 'E' && !change.lhs && !Object.hasOwn(change, 'path')) {
                    const createdId = await createTabBlock(change.rhs, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        id: createdId,
                        collection: CollectionTypes.TAB_BLOCKS,
                        message: ApiMessages.ITEM_CREATED
                    });
                }
                if (change.kind == 'E' && Object.hasOwn(change, 'path')) {
                    const updatedItem = await updateTabBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        item: updatedItem,
                        collection: CollectionTypes.TAB_BLOCKS,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
        }
        const tabBlocksTabBlocksChanges = await runTabBlocksTabBlocks(id);
        return [...appliedChanges, ...tabBlocksTabBlocksChanges];
    }
    catch(error) {
        logger.error(`Error in runTabBlocks (${id}):`, error)
        throw new Error('Error in runTabBlocks');
    }
}