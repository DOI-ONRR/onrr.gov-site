import { createPagesPageBlocksItemsMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function createPagesPageBlocksItems(data, endpoint, authToken) {
    try {
        const variables = {
            items: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesPageBlocksItemsMutation, variables);
        return response.create_pages_page_blocks_items;
    } catch (error) {
        logger.error("Error in createPagesPageBlocksItems:", error);
        throw new Error('Error in createPagesPageBlocksItems. Check log files.')
    }
}