import { createPagesSidebarBlocksItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function createPagesSidebarBlocksItem(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesSidebarBlocksItemMutation, { item: data });
        return response.create_pages_sidebar_blocks_item.id;
    } catch (error) {
        logger.error("Error in createPagesSidebarBlocksItem:", error);
        throw new Error('Error in createPagesSidebarBlocksItem')
    }
}
