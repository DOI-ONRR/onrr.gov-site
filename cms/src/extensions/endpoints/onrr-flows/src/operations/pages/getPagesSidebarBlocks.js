import { pagesSidebarBlocksQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesSidebarBlocks(pagesId, endpoint, authToken) {
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
        
        const data = await client.request(pagesSidebarBlocksQuery, variables);
        return data.pages_sidebar_blocks;
    } catch (error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getPagesSidebarBlocks (${pagesId}): Permission denied`);
            return [];
        }
        logger.error("Error in getPagesSidebarBlocks:", error);
        throw new Error ('Error in getPagesSidebarBlocks');
    }
}