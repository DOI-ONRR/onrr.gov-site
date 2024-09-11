import { 
    getTabBlocksById,
    createTabBlock,
    updateTabBlocksItem
} from '../../operations/tabBlocks';
import { runTabBlocksTabBlocks } from './tabBlocksTabBlocks';
import { Endpoints, UpstreamAuthToken, LocalAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runTabBlocks(id) {
    try {
        var appliedChanges = []
        const latest = await getTabBlocksById(id, Endpoints.LOCAL, LocalAuthToken);
        const previous = await getTabBlocksById(id, Endpoints.UPSTREAM, UpstreamAuthToken);
        if (!previousVersionExists(previous)) {
            const createdId = await createTabBlock(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: createdId,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            });
        } else if (versionsDiffer(previous, latest)) {
            const updatedItem = await updateTabBlocksItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                item: updatedItem,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.ITEM_UPDATED
            });
        }
        const tabBlocksTabBlocksChanges = await runTabBlocksTabBlocks(id);
        return [...appliedChanges, ...tabBlocksTabBlocksChanges];
    }
    catch(error) {
        logger.error(`Error in runTabBlocks (${id}):`, error)
        throw new Error('Error in runTabBlocks');
    }
}