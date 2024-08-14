import { getCardBlocksById, createCardBlock } from "../operations/cardBlocks";
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../constants";
import { diff } from "deep-diff";
import { logger } from "./logger";

export async function run(id) {
    try {
        const latest = await getCardBlocksById(id, Endpoints.LOCAL);
        const previous = await getCardBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`cardBlocksFlowUtil.run:\n ${JSON.stringify(changes, null, 2)}`);
        if (changes.length === 0) {
            return {
                id: id,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            //const createdId = await createCardBlock(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            const createdId = id;
            logger.info(`Creating card block with id ${id}`);
            return {
                id: createdId,
                collection: CollectionTypes.CARD_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch {
        logger.error(`Error in cardBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in cardBlocksFlowUtil.run');
    }
}