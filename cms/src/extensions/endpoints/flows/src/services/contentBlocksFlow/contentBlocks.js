import { getContentBlocksById, createContentBlock, updateContentBlocksItem } from "../../operations/contentBlocks";
import { Endpoints, AuthToken, ApiMessages, CollectionTypes } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runContentBlocks(id) {
    try {
        const latest = await getContentBlocksById(id, Endpoints.LOCAL);
        const previous = await getContentBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.CONTENT_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind === 'E' && !change.lhs) {
                const createdId = await createContentBlock(change.rhs, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: createdId,
                    collection: CollectionTypes.CONTENT_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind === 'E') {
                const updatedItem = await updateContentBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    item: updatedItem,
                    collection: CollectionTypes.CONTENT_BLOCKS,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch(error) {
        logger.error(`Error in contentBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in contentBlocksFlowUtil.run');
    }
}