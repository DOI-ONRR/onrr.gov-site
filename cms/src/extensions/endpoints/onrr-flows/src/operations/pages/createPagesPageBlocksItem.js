import { createPagesPageBlocksItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function createPagesPageBlocksItem(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesPageBlocksItemMutation, { item: data });
        return response.create_pages_page_blocks_item.id;
    } catch (error) {
        logger.error("Error in createPagesPageBlocksItem:", error);
        throw new Error('Error in createPagesPageBlocksItem')
    }
}
