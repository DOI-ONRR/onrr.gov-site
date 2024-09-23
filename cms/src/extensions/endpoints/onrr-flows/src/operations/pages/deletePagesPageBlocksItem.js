import { deletePagesPageBlocksItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function deletePagesPageBlocksItem(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(deletePagesPageBlocksItemMutation, { id: id });
        return response.delete_pages_page_blocks_item.id;
    } catch (error) {
        logger.error("Error in deletePagesPageBlocksItem:", error);
        throw new Error('Error in deletePagesPageBlocksItem')
    }
}
