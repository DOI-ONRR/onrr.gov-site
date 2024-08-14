import { getContentBlocksById, createContentBlock } from "../operations/contentBlocks";
import { Endpoints, AuthToken, ApiMessages, CollectionTypes } from "../constants";
import { diff } from "deep-diff";
import { logger } from "./logger";

export async function run(id) {
    try {
        const latest = await getContentBlocksById(id, Endpoints.LOCAL);
        const previous = await getContentBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.debug(`contentBlocksFlowUtil.run (${id}):\n`, changes);
        if (changes.length === 0) {
            return {
                id: id,
                collection: CollectionTypes.CONTENT_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            //const createdId = await createContentBlock(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            const createdId = id;
            logger.info(`Creating content block with id ${id}`);
            return {
                id: createdId,
                collection: CollectionTypes.CONTENT_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch(error) {
        logger.error(`Error in contentBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in contentBlocksFlowUtil.run');
    }
}