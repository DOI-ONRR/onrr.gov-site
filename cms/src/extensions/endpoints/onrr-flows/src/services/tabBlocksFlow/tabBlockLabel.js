import { 
    getTabBlockLabelById,
    createTabBlockLabelItem,
    updateTabBlockLabelItem,
} from '../../operations/tabBlocks';
import { Endpoints, UpstreamAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runTabBlockLabel(id) {
    try {
        const latest = await getTabBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getTabBlockLabelById(id, Endpoints.UPSTREAM);
        if (!previousVersionExists(previous)) {
            const createdId = await createTabBlockLabelItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.TAB_BLOCK_LABEL,
                message: ApiMessages.ITEM_CREATED
            }
        } else if (versionsDiffer(previous, latest)) {
            const updatedId = await updateTabBlockLabelItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            return {
                item: updatedId,
                collection: CollectionTypes.TAB_BLOCK_LABEL,
                message: ApiMessages.ITEM_UPDATED
            }
        }
        return null;
    }
    catch(error) {
        logger.error('Error in runTabBlockLabel:', error);
        throw new Error('Error in runTabBlockLabel');
    }
}