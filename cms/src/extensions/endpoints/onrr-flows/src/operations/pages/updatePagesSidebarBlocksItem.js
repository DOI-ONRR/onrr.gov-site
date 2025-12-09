import { updatePagesSidebarBlocksItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function updatePagesSidebarBlocksItem(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updatePagesSidebarBlocksItemMutation, { id: data.id, item: data });
        return response.update_pages_sidebar_blocks_item.id;
    } catch (error) {
        logger.error("Error in updatePagesSidebarBlocksItem:", error);
        throw new Error('Error in updatePagesSidebarBlocksItem')
    }
}
