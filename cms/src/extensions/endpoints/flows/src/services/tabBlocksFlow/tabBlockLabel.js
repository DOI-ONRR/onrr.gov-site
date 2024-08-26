import { 
    getTabBlockLabelById,
    createTabBlockLabelItem,
    updateTabBlockLabelItem,
} from '../../operations/tabBlocks';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

async function runTabBlockLabel(id) {
    try {
        const latest = await getTabBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getTabBlockLabelById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.TAB_BLOCK_LABEL,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind === 'E' && !change.lhs) {
                //const createdId = await createTabBlockLabelItem(change.rhs, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: createdId,
                    collection: CollectionTypes.TAB_BLOCK_LABEL,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind === 'E') {
                const updatedItem = await updateTabBlockLabelItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    item: updatedItem.id,
                    collection: CollectionTypes.TAB_BLOCK_LABEL,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch(error) {
        logger.error('Error in runTabBlockLabelItemFlow:', error);
    }
}

export default runTabBlockLabel;