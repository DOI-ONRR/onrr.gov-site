import { pagesPageBlocksItemByPageBlockId } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesPageBlockItemByPageBlockId(pageBlockId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesPageBlocksItemByPageBlockId, { id: pageBlockId });
        return data.pages_page_blocks_by_id.item;
    } catch (error) {
        logger.error(`Error in getPagesPageBlockItemByPageBlockId (${pageBlockId}):`, error);
        throw new Error('Error in getPagesPageBlockItemByPageBlockId');
    }
}