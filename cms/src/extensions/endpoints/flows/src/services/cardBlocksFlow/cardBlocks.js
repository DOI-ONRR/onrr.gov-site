import { getCardBlocksById, createCardBlock, updateCardBlocksItem } from "../../operations/cardBlocks";
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runCardBlocks(id) {
    try {
        const latest = await getCardBlocksById(id, Endpoints.LOCAL);
        const previous = await getCardBlocksById(id, Endpoints.UPSTREAM);
        if (!previousVersionExists(previous)) {
            const createdId = await createCardBlock(latest, Endpoints.UPSTREAM, AuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            }
        }
        else if (versionsDiffer(previous, latest)) {
            const updatedId = await updateCardBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
            return {
                id: updatedId,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.ITEM_UPDATED
            }
        }
        return null;
    }
    catch {
        logger.error(`Error in runCardBlocks (${id}):`, error)
        throw new Error('Error in runCardBlocks');
    }
}