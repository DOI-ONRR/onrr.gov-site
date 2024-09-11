import { updatePagesItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils";

export async function updatePagesItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updatePagesItemMutation, { id: id, item: item});
        return response.update_pages_item.id;
    } catch (error) {
        logger.error('Error in updatePagesItem', error);
        throw new Error('Error in updatePagesItem');
    }
}