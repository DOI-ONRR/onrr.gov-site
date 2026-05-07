import { pagesPageBlocksQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesPageBlocks(pagesId, endpoint, authToken) {
    try {
        const variables = {
            pages_id: pagesId,
        };
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }

        const data = await client.request(pagesPageBlocksQuery, variables);
        return data.pages_page_blocks;
    } catch (error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getPagesPageBlocks (${pagesId}): Permission denied`);
            return [];
        }
        logger.error("Error in getPagesPageBlocks:", error);
        throw new Error ('Error in getPagesPageBlocks');
    }
}