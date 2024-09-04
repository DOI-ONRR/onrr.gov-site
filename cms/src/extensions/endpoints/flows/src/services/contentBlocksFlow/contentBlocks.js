import { getContentBlocksById, createContentBlock, updateContentBlocksItem } from "../../operations/contentBlocks";
import { Endpoints, AuthToken, ApiMessages, CollectionTypes } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runContentBlocks(id) {
    try {
        const latest = await getContentBlocksById(id, Endpoints.LOCAL);
        const previous = await getContentBlocksById(id, Endpoints.UPSTREAM);
        if (!previousVersionExists(previous)) {
            const createdId = await createContentBlock(latest, Endpoints.UPSTREAM, AuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.CONTENT_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            }
        } else if (versionsDiffer(previous, latest)) {
            const updatedItem = await updateContentBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
            return {
                item: updatedItem,
                collection: CollectionTypes.CONTENT_BLOCKS,
                message: ApiMessages.ITEM_UPDATED
            }
        }
        return null;
    }
    catch(error) {
        logger.error(`Error in contentBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in contentBlocksFlowUtil.run');
    }
}