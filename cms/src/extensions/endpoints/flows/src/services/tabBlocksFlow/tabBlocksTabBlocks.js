import { 
    getTabBlocksTabBlocksById,
    createTabBlocksTabBlocksItem,
    updateTabBlocksTabBlocksItem
} from '../../operations/tabBlocks';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

async function runTabBlocksTabBlocks(id) {
    try {
        const latest = await getTabBlocksTabBlocksById(id, Endpoints.LOCAL);
        const previous = await getTabBlocksTabBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind == 'E' && !change.lhs && !Object.hasOwn(change, 'path')) {
                latest.item = latest.item.id;
                const newId = await createTabBlocksTabBlocksItem(latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: newId,
                    collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind === 'E' && Object.hasOwn(change, 'path')) {
                latest.item = latest.item.id;
                const updatedItem = await updateTabBlocksTabBlocksItem(latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: updatedItem.id,
                    collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch (error) {
        logger.error(`Error in runTabBlocksTabBlockFlow (${id}):`, error)
        throw new Error('Error in runTabBlocksTabBlockFlow');
    }
}

export default runTabBlocksTabBlocks;