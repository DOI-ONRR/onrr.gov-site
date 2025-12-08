import { pagesPageBlocksQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesPageBlocks(pagesId, endpoint) {
    try {
        const variables = {
            pages_id: pagesId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesPageBlocksQuery, variables);
        return data.pages_page_blocks;
    } catch (error) {
        logger.error("Error in getPagesPageBlocks:", error);
        throw new Error ('Error in getPagesPageBlocks');
    }
}