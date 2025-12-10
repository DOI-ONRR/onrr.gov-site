import { deletePagesSidebarBlocksItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function deletePagesSidebarBlocksItem(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(deletePagesSidebarBlocksItemMutation, { id: id });
        return response.delete_pages_sidebar_blocks_item.id;
    } catch (error) {
        logger.error("Error in deletePagesSidebarBlocksItem:", error);
        throw new Error('Error in deletePagesSidebarBlocksItem')
    }
}
