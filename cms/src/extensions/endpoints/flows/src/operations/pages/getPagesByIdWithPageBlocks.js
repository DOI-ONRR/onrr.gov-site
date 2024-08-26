import { pagesByIdWithPageBlocksQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesByIdWithPageBlocks(pagesId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesByIdWithPageBlocksQuery, { id: pagesId });
        return data;
    } catch (error) {
        logger.error("Error in getPagesByIdWithPageBlocks:", error);
        throw new Error('Error in getPagesByIdWithPageBlocks');
    }
}