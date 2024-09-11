import { getCardBlocksById, createCardBlock, updateCardBlocksItem } from "../../operations/cardBlocks";
import { runCardBlocksCardContentBlocks } from "./cardBlocksCardContentBlocks";
import { Endpoints, UpstreamAuthToken, LocalAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runCardBlocks(id) {
    try {
        var appliedChanges = [];
        const latest = await getCardBlocksById(id, Endpoints.LOCAL, LocalAuthToken);
        const previous = await getCardBlocksById(id, Endpoints.UPSTREAM, UpstreamAuthToken);
        if (!previousVersionExists(previous)) {
            const createdId = await createCardBlock(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: createdId,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            });
        }
        else if (versionsDiffer(previous, latest)) {
            const updatedId = await updateCardBlocksItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: updatedId,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.ITEM_UPDATED
            });
        }
        const cardContentBlocksChanges = await runCardBlocksCardContentBlocks(id);
        return cardContentBlocksChanges.length > 0
            ? appliedChanges.concat(cardContentBlocksChanges)
            : appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runCardBlocks (${id}):`, error)
        throw new Error('Error in runCardBlocks');
    }
}