import { getCardBlocksById, createCardBlock, updateCardBlocksItem } from "../operations/cardBlocks";
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../constants";
import { diff } from "deep-diff";
import { logger } from "./logger";

export async function run(id) {
    try {
        const latest = await getCardBlocksById(id, Endpoints.LOCAL);
        const previous = await getCardBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind == 'E' && !change.lhs) {
                const createdId = await createCardBlock(change.rhs, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: createdId,
                    collection: CollectionTypes.CARD_BLOCKS,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind === 'E') {
                const updateResponse = await updateCardBlocksItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    item: updateResponse,
                    collection: CollectionTypes.CARD_BLOCKS,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch {
        logger.error(`Error in cardBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in cardBlocksFlowUtil.run');
    }
}